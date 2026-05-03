"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyToken } from "@/app/actions/auth";
import { createSupabaseServer } from "@/lib/supabase/server";

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
    const supabase = await createSupabaseServer();
    const { error } = await supabase.rpc("admin_extend_business_trial", {
      target_business_id: businessId,
      extend_days: extendDays,
    });

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
