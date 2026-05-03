import type { NextConfig } from "next";

const securityHeaders = [
  // Clickjacking önleme — kimse dashboardu iframe'e alamaz
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // XSS önleme — tarayıcıya hangi kaynaklardan içerik yüklenebileceğini söyler
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline script'leri için gerekli
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Tailwind + Recharts inline style'ları için
      "style-src 'self' 'unsafe-inline'",
      // Supabase API çağrıları
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      // Font ve ikon kaynakları
      "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Görsel kaynakları
      "img-src 'self' data: blob:",
      // Frame, object, base engelle
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; "),
  },
  // MIME type saldırısı önleme
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Referrer bilgisini kısıtla
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Gereksiz tarayıcı özelliklerini kapat
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HTTPS zorla (yayında aktif olur)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // XSS filter (eski tarayıcılar için)
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        // Tüm sayfalara uygula
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
