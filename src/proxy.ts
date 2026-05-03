import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "kokos_session";
const DEMO_BUSINESS_COOKIE = "kokos_business_demo";
// /admin kasıtlı olarak buraya dahil edilmedi — ziyaretçi /login'e yönlenir
const PUBLIC_PATHS = ["/x-kokos-9f4a", "/login", "/signup"];

function isDemoBusinessLoginEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEMO_BUSINESS_LOGIN === "true";
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return false;

    const value = token.slice(0, lastDot);
    const providedSig = token.slice(lastDot + 1);
    const secret = process.env.AUTH_SECRET ?? "fallback-secret";
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
    const expectedSig = Buffer.from(signature).toString("base64url");
    return providedSig === expectedSig;
  } catch {
    return false;
  }
}

async function requireBusinessAuth(request: NextRequest) {
  if (isDemoBusinessLoginEnabled() && request.cookies.get(DEMO_BUSINESS_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  let user;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

async function requireAdminAuth(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/x-kokos-9f4a", request.url));
  }

  const valid = await verifyAdminToken(token);
  if (!valid) {
    const response = NextResponse.redirect(new URL("/x-kokos-9f4a", request.url));
    response.cookies.delete(ADMIN_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin URL'ini bilen ziyaretçileri sessizce /login'e yönlendir
  // (Gizli admin URL'ini sızdırmamak için requireAdminAuth'tan önce ele alınır)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/portal")) {
    return requireBusinessAuth(request);
  }

  return requireAdminAuth(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
