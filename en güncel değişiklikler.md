# En Guncel Degisiklikler

Tarih: 4 Mayis 2026

## Guvenli Admin Islemleri

- Admin trial uzatma islemi public Supabase RPC uzerinden kaldirildi.
- `src/app/actions/admin-business.ts` artik admin cookie dogrulamasindan sonra sadece server tarafinda `SUPABASE_SERVICE_ROLE_KEY` ile calisan admin Supabase client kullanir.
- `src/lib/supabase/server.ts` icine `createSupabaseAdmin()` eklendi.
- Public `admin_extend_business_trial` RPC fonksiyonunu kapatan migration eklendi ve Supabase projesine uygulandi.

## Supabase Production Veri Modeli

- Dogru Supabase projesi olarak `fxeanxdpdgzgymvaghqz` hedeflendi.
- Supabase migration zinciri bu projeye uygulandi.
- Ana proje entegrasyonu icin production veri modeli eklendi:
  - `plans`
  - `business_members`
  - `menus`
  - `menu_categories`
  - `menu_items`
  - `restaurant_tables`
  - `qr_sessions`
  - `order_items`
  - `subscriptions`
  - `payments`
- `orders` tablosuna masa, QR oturumu, tamamlanma/iptal zamani ve durum aciklamasi alanlari eklendi.
- RLS policy'leri ve ilgili index'ler eklendi.

## Ana Proje Entegrasyon Sozlesmesi

- `docs/ana-proje-entegrasyon-sozlesmesi.md` eklendi.
- Bu dokumanda ana proje ile analytics panel arasindaki auth, business, odeme, trial, role ve veri akisi netlestirildi.
- `business_members` merkezli yetki modeli onerildi.
- Admin mutasyonlarinin service role server action ile calismasi kural haline getirildi.

## Masa Performansi Ekranlari

- Claude tarafindan baslatilan `/portal/customers` donusumu korunarak masa performansi ekrani guncel halde repoya alinacak duruma getirildi.
- `/portal/customers/[tableId]` masa detay analizi sayfasi ekran goruntusuyle dogrulandi.
- Yeni ekran goruntuleri eklendi:
  - `docs/screenshots/masa-performansi.png`
  - `docs/screenshots/masa-detay-m11.png`

## Env Notlari

`.env.example` eklendi.

Gerekli degiskenler:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_USERNAME=
ADMIN_PASSWORD=
AUTH_SECRET=
```

Not: Lokal `.env.local` dosyasi secret icerir ve repoya eklenmedi. Dogru Supabase projesi icin `NEXT_PUBLIC_SUPABASE_URL` degeri `https://fxeanxdpdgzgymvaghqz.supabase.co` olmali, anon key ise Supabase dashboard'dan alinmalidir.

## Test Sonuclari

- `npm run lint`: Basarili.
- `npm run build`: Basarili.
- Supabase migration listesi dogru projede dogrulandi.
- `admin_extend_business_trial` public RPC fonksiyonunun kaldirildigi dogrulandi.
- `get_platform_kpis()` Supabase tarafinda veri dondurdu.

## Kalan Dikkat Noktalari

- `.env.local` dogru Supabase anon key ile guncellenmeden lokal uygulama hala eski Supabase projesine istek atabilir.
- Service role key sadece server ortaminda tutulmali; `NEXT_PUBLIC_` prefix'i ile tanimlanmamali.
- Ana proje odeme akisinin `subscriptions` ve `payments` tablolarini yazmasi gerekiyor.
