"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export type BusinessSignupState = { error?: string; step?: number } | null;
const VALID_PLANS = ["trial", "starter", "pro", "enterprise"] as const;
const DEMO_BUSINESS_COOKIE = "kokos_business_demo";
const DEMO_BUSINESS_EMAIL = process.env.DEMO_BUSINESS_EMAIL ?? "demo@kokos.test";
const DEMO_BUSINESS_PASSWORD = process.env.DEMO_BUSINESS_PASSWORD ?? "Demo123!";

function isDemoBusinessLoginEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_BUSINESS_LOGIN === "true";
}

export async function businessSignup(
  prevState: BusinessSignupState,
  formData: FormData
): Promise<BusinessSignupState> {
  const email          = formData.get("email")?.toString().trim() ?? "";
  const password       = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";
  const businessName   = formData.get("businessName")?.toString().trim() ?? "";
  const city           = formData.get("city")?.toString().trim() ?? "";
  const planInput      = formData.get("plan")?.toString() ?? "trial";
  const plan           = VALID_PLANS.includes(planInput as (typeof VALID_PLANS)[number]) ? planInput : "trial";

  if (!email || !password || !confirmPassword || !businessName || !city) {
    return { error: "Lütfen tüm alanları doldurun." };
  }
  if (password.length < 6) {
    return { error: "Şifre en az 6 karakter olmalıdır." };
  }

  if (password !== confirmPassword) {
    return { error: "Şifreler eşleşmiyor." };
  }

  const supabase = await createSupabaseServer();

  // 1. Supabase Auth kaydı
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { business_name: businessName, city, plan },
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "Bu e-posta adresi zaten kayıtlı." };
    }
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Kayıt oluşturulamadı. Lütfen tekrar deneyin." };
  }

  // 2. businesses tablosuna işletme kaydı ekle
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);
  const trialStartedAt = new Date();

  const { error: bizError } = await supabase.from("businesses").insert({
    name:          businessName,
    city,
    plan,
    status:        "trial",
    owner_email:   email,
    auth_user_id:  authData.user.id,
    trial_started_at: trialStartedAt.toISOString(),
    trial_ends_at: trialEndsAt.toISOString(),
    trial_max_days: 7,
  });

  if (bizError) {
    // DB'de tablo yoksa veya RLS engelliyorsa mock modda devam et
    console.warn("İşletme kaydı DB'ye yazılamadı (mock mod):", bizError.message);
  }

  redirect("/portal");
}

export async function businessLogin(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email    = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!email || !password) return "E-posta ve şifre gereklidir.";

  if (
    isDemoBusinessLoginEnabled() &&
    email.toLocaleLowerCase("tr-TR") === DEMO_BUSINESS_EMAIL &&
    password === DEMO_BUSINESS_PASSWORD
  ) {
    const cookieStore = await cookies();
    cookieStore.set(DEMO_BUSINESS_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    redirect("/portal");
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return "E-posta veya şifre hatalı.";
    }
    return error.message;
  }

  redirect("/portal");
}

export async function businessLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_BUSINESS_COOKIE);

  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
