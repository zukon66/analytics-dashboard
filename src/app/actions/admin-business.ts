"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyToken } from "@/app/actions/auth";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const ADMIN_COOKIE = "kokos_session";
const ALLOWED_EXTENSIONS = new Set([1, 3, 7]);

export async function extendBusinessTrial(formData: FormData) {
  const businessId = Number(formData.get("businessId"));
  const extendDays = Number(formData.get("extendDays"));

  if (!Number.isInteger(businessId) || businessId <= 0) {
    redirect("/businesses?trial_error=invalid_business");
  }

  if (!ALLOWED_EXTENSIONS.has(extendDays)) {
    redirect(`/businesses/${businessId}?trial_error=invalid_days`);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAdmin = token ? await verifyToken(token) : false;

  if (!isAdmin) {
    redirect("/x-kokos-9f4a");
  }

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
    revalidatePath("/");
    revalidatePath("/businesses");
    revalidatePath(`/businesses/${businessId}`);
    redirect(`/businesses/${businessId}?trial=extended`);
  }

  redirect(`/businesses/${businessId}?trial_error=not_applied`);
}
