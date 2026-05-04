"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyToken } from "@/app/actions/auth";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const ADMIN_COOKIE = "kokos_session";
const ALLOWED_EXTENSIONS = new Set([1, 3, 7]);
const VALID_PLANS = new Set(["trial", "starter", "pro", "enterprise"]);
const VALID_STATUSES = new Set(["active", "inactive", "trial", "churned"]);

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = token ? await verifyToken(token) : false;

  if (!isAdmin) {
    redirect("/x-kokos-9f4a");
  }
}

function readBusinessId(formData: FormData) {
  const businessId = Number(formData.get("businessId"));
  if (!Number.isInteger(businessId) || businessId <= 0) {
    redirect("/businesses?operation_error=invalid_business");
  }
  return businessId;
}

function revalidateBusiness(businessId: number) {
  revalidatePath("/");
  revalidatePath("/businesses");
  revalidatePath(`/businesses/${businessId}`);
}

export async function extendBusinessTrial(formData: FormData) {
  const businessId = Number(formData.get("businessId"));
  const extendDays = Number(formData.get("extendDays"));

  if (!Number.isInteger(businessId) || businessId <= 0) {
    redirect("/businesses?trial_error=invalid_business");
  }

  if (!ALLOWED_EXTENSIONS.has(extendDays)) {
    redirect(`/businesses/${businessId}?trial_error=invalid_days`);
  }

  await requireAdmin();

  let applied = false;

  try {
    const supabase = createSupabaseAdmin();
    const { data: business, error: fetchError } = await supabase
      .from("businesses")
      .select("trial_started_at, trial_ends_at, status")
      .eq("id", businessId)
      .single();

    if (fetchError || !business) throw fetchError;

    const now = new Date();
    const currentTrialEnd = business.trial_ends_at ? new Date(business.trial_ends_at) : now;
    const baseEnd = currentTrialEnd > now ? currentTrialEnd : now;
    const requestedEnd = new Date(baseEnd.getTime() + extendDays * 86400000);
    const maxEnd = new Date(now.getTime() + 7 * 86400000);
    const nextTrialEnd = requestedEnd > maxEnd ? maxEnd : requestedEnd;

    const { error } = await supabase
      .from("businesses")
      .update({
        trial_started_at: business.trial_started_at ?? now.toISOString(),
        trial_ends_at: nextTrialEnd.toISOString(),
        trial_max_days: 7,
        status: business.status === "inactive" ? "trial" : business.status,
      })
      .eq("id", businessId);

    if (error) throw error;
    applied = true;
  } catch {
    applied = false;
  }

  if (applied) {
    revalidateBusiness(businessId);
    redirect(`/businesses/${businessId}?trial=extended`);
  }

  redirect(`/businesses/${businessId}?trial_error=not_applied`);
}

export async function updateBusinessPlan(formData: FormData) {
  const businessId = readBusinessId(formData);
  const plan = formData.get("plan")?.toString() ?? "";

  if (!VALID_PLANS.has(plan)) {
    redirect(`/businesses/${businessId}?operation_error=invalid_plan`);
  }

  await requireAdmin();

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("businesses")
      .update({ plan, plan_code: plan })
      .eq("id", businessId);

    if (error) throw error;
    revalidateBusiness(businessId);
    redirect(`/businesses/${businessId}?operation=plan_updated`);
  } catch {
    redirect(`/businesses/${businessId}?operation_error=plan_not_updated`);
  }
}

export async function updateBusinessStatus(formData: FormData) {
  const businessId = readBusinessId(formData);
  const status = formData.get("status")?.toString() ?? "";

  if (!VALID_STATUSES.has(status)) {
    redirect(`/businesses/${businessId}?operation_error=invalid_status`);
  }

  await requireAdmin();

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("businesses")
      .update({ status, last_active_at: status === "active" ? new Date().toISOString() : undefined })
      .eq("id", businessId);

    if (error) throw error;
    revalidateBusiness(businessId);
    redirect(`/businesses/${businessId}?operation=status_updated`);
  } catch {
    redirect(`/businesses/${businessId}?operation_error=status_not_updated`);
  }
}

export async function updateBusinessTrialEnd(formData: FormData) {
  const businessId = readBusinessId(formData);
  const trialEndsAtInput = formData.get("trialEndsAt")?.toString() ?? "";
  const trialEndsAt = new Date(trialEndsAtInput);

  if (!trialEndsAtInput || Number.isNaN(trialEndsAt.getTime())) {
    redirect(`/businesses/${businessId}?operation_error=invalid_trial_date`);
  }

  await requireAdmin();

  try {
    const supabase = createSupabaseAdmin();
    const now = new Date();
    const maxTrialEnd = new Date(now.getTime() + 7 * 86400000);
    const safeTrialEnd = trialEndsAt > maxTrialEnd ? maxTrialEnd : trialEndsAt;

    const { error } = await supabase
      .from("businesses")
      .update({
        trial_started_at: now.toISOString(),
        trial_ends_at: safeTrialEnd.toISOString(),
        trial_max_days: 7,
        status: "trial",
      })
      .eq("id", businessId);

    if (error) throw error;
    revalidateBusiness(businessId);
    redirect(`/businesses/${businessId}?operation=trial_date_updated`);
  } catch {
    redirect(`/businesses/${businessId}?operation_error=trial_date_not_updated`);
  }
}
