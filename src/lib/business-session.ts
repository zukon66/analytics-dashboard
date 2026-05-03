import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Business } from "@/lib/queries";
import { mockBusinesses } from "@/lib/mockData";

export type PortalBusiness = Business & {
  auth_user_id?: string | null;
  trial_started_at?: string | null;
  trial_ends_at?: string | null;
  trial_max_days?: number | null;
};

const DEMO_BUSINESS_COOKIE = "kokos_business_demo";

function getDemoBusiness(): PortalBusiness {
  const demo = mockBusinesses[0];
  return {
    ...demo,
    owner_email: "demo@kokos.test",
    auth_user_id: "demo-business-user",
    trial_started_at: "2026-05-02T09:10:00",
    trial_ends_at: "2026-06-02T09:10:00",
    trial_max_days: 7,
  };
}

function canUseDemoBusinessFallback() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_BUSINESS_LOGIN === "true";
}

export async function getCurrentBusiness(): Promise<PortalBusiness> {
  const cookieStore = await cookies();
  if (cookieStore.get(DEMO_BUSINESS_COOKIE)?.value === "1") {
    return getDemoBusiness();
  }

  const supabase = await createSupabaseServer();
  let user;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    if (canUseDemoBusinessFallback()) {
      return getDemoBusiness();
    }
    redirect("/login");
  }

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("businesses")
    .select("id,name,city,plan,status,owner_email,created_at,last_active_at,auth_user_id,trial_started_at,trial_ends_at,trial_max_days")
    .or(`auth_user_id.eq.${user.id},owner_email.eq.${user.email ?? ""}`)
    .limit(1)
    .maybeSingle();

  if (!data) {
    return {
      id: 1,
      name: user.user_metadata?.business_name ?? "İşletme Paneli",
      city: user.user_metadata?.city ?? "Silifke",
      plan: "trial",
      status: "trial",
      owner_email: user.email ?? null,
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      auth_user_id: user.id,
      trial_started_at: new Date().toISOString(),
      trial_ends_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      trial_max_days: 7,
    };
  }

  return data as PortalBusiness;
}

export function trialDaysLeft(business: PortalBusiness): number | null {
  if (!business.trial_ends_at) return null;
  const diff = new Date(business.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}
