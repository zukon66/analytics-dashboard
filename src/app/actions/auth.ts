"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "kokos_session";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 saat

// Basit HMAC imzası — Node.js crypto ile, ekstra paket yok
async function signToken(value: string): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? "fallback-secret";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value)
  );
  const b64 = Buffer.from(signature).toString("base64url");
  return `${value}.${b64}`;
}

export async function verifyToken(token: string): Promise<boolean> {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const value = token.slice(0, lastDot);
  const expected = await signToken(value);
  return expected === token;
}

export async function login(prevState: string | null, formData: FormData) {
  const username = formData.get("username")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const validUser = process.env.ADMIN_USERNAME ?? "";
  const validPass = process.env.ADMIN_PASSWORD ?? "";

  if (!validUser || !validPass) {
    return "Sunucu yapılandırması eksik.";
  }

  if (username !== validUser || password !== validPass) {
    return "Kullanıcı adı veya şifre hatalı.";
  }

  // İmzalı session token oluştur
  const payload = `auth:${username}:${Date.now()}`;
  const token = await signToken(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,       // JavaScript okuyamaz
    secure: process.env.NODE_ENV === "production", // Yayında HTTPS zorunlu
    sameSite: "strict",   // CSRF koruması
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin");
}
