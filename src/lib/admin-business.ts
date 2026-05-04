import { createSupabaseAdmin } from "@/lib/supabase/server";

export type BusinessMemberRow = {
  id: number;
  business_id: number;
  auth_user_id: string;
  role: "owner" | "manager" | "staff" | "viewer";
  status: "active" | "invited" | "disabled";
  created_at: string;
};

export type SubscriptionRow = {
  id: number;
  business_id: number;
  plan_code: "trial" | "starter" | "pro" | "enterprise";
  status: "trialing" | "active" | "past_due" | "cancelled" | "expired";
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_started_at: string | null;
  current_period_ends_at: string | null;
  external_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentRow = {
  id: number;
  business_id: number;
  subscription_id: number | null;
  provider: string | null;
  external_payment_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  paid_at: string | null;
  created_at: string;
};

export type AdminBusinessOperations = {
  members: BusinessMemberRow[];
  subscriptions: SubscriptionRow[];
  payments: PaymentRow[];
  error: string | null;
};

export async function getAdminBusinessOperations(
  businessId: number
): Promise<AdminBusinessOperations> {
  try {
    const supabase = createSupabaseAdmin();

    const [membersRes, subscriptionsRes, paymentsRes] = await Promise.all([
      supabase
        .from("business_members")
        .select("id, business_id, auth_user_id, role, status, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select(
          "id, business_id, plan_code, status, trial_started_at, trial_ends_at, current_period_started_at, current_period_ends_at, external_subscription_id, created_at, updated_at"
        )
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("payments")
        .select(
          "id, business_id, subscription_id, provider, external_payment_id, amount, currency, status, paid_at, created_at"
        )
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const error =
      membersRes.error?.message ??
      subscriptionsRes.error?.message ??
      paymentsRes.error?.message ??
      null;

    if (error) {
      return { members: [], subscriptions: [], payments: [], error };
    }

    return {
      members: (membersRes.data ?? []) as BusinessMemberRow[],
      subscriptions: (subscriptionsRes.data ?? []) as SubscriptionRow[],
      payments: (paymentsRes.data ?? []) as PaymentRow[],
      error: null,
    };
  } catch (error) {
    return {
      members: [],
      subscriptions: [],
      payments: [],
      error: error instanceof Error ? error.message : "Admin verileri okunamadı.",
    };
  }
}
