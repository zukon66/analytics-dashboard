# Ana Proje Entegrasyon Sozlesmesi

Bu dokuman KOK-OS Analytics panelinin ana restoran/odeme projesine nasil baglanacagini tanimlar. Hedef, kullanicinin ana projede actigi hesapla ayni kimlik ve isletme baglaminda analytics paneline girebilmesidir.

## Onerilen Mimari

Analytics panel ayri bir Next.js uygulamasi olarak kalabilir, ancak auth ve isletme sahipligi ana projeyle ayni Supabase projesi uzerinden cozulmelidir.

- Kimlik kaynagi: Supabase Auth.
- Kullanici eslesmesi: `auth.users.id`.
- Isletme eslesmesi: `businesses.id`.
- Yetki modeli: `business_members`.
- Plan ve odeme durumu: `subscriptions` ve `payments`.
- Admin operasyonlari: sadece server-side service role.

Ana proje login olan kullaniciyi analytics paneline yonlendirdiginde panel tekrar hesap olusturmamalidir. Panel, Supabase session cookie veya ayni auth kullanicisi ile `business_members` kaydini okuyup aktif isletmeyi bulmalidir.

## Veri Akisi

1. Kullanici ana projede Supabase Auth ile giris yapar.
2. Ana proje kullanicinin `business_members` kaydini olusturur veya gunceller.
3. Odeme/trial bilgisi `subscriptions` tablosuna yazilir.
4. Analytics panel `/portal` route'unda session'i okur.
5. `getCurrentBusiness()` aktif kullanici icin `businesses` + `business_members` baglantisini bulur.
6. Dashboard sorgulari sadece bulunan `business_id` ile calisir.
7. RLS, kullanicinin sadece kendi isletme verisini okumasini saglar.

## Gerekli Tablolar

- `businesses`: isletme profili, plan, trial alanlari, ana proje kullanici referansi.
- `business_members`: kullanici-isletme uyeligi ve rol bilgisi.
- `plans`: plan katalogu.
- `subscriptions`: trial/aktif/past_due/cancelled abonelik durumu.
- `payments`: odeme gecmisi.
- `menus`, `menu_categories`, `menu_items`: menu yapisi.
- `restaurant_tables`: masa tanimlari.
- `qr_sessions`: QR oturumlari.
- `orders`, `order_items`: siparis ve siparis kalemleri.

## Gerekli Env Degiskenleri

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_USERNAME=
ADMIN_PASSWORD=
AUTH_SECRET=
```

`SUPABASE_SERVICE_ROLE_KEY` sadece server tarafinda kullanilmalidir. `NEXT_PUBLIC_` prefix'i verilmemelidir.

## Server Action ve Endpoint Kurallari

- Isletme kullanicisi islemleri Supabase Auth session ile calismalidir.
- Admin mutasyonlari service role ile calismalidir.
- Client tarafindan public RPC ile veri degistirilmemelidir.
- Ana proje odeme aldiginda `subscriptions.status`, `plan_code`, `current_period_ends_at` alanlarini guncellemelidir.
- Trial maksimum 7 gun olmalidir; admin uzatmalari da 7 gun ust sinirini asmamalidir.

## Admin ve Isletme Ayrimi

Admin paneli gizli admin cookie ile calisir ve normal isletme kullanicisi route'larindan ayridir. Admin, isletme verilerini operasyonel amacla gorebilir; isletme kullanicisi sadece kendi `business_id` kapsamindaki verileri gorebilir.

## Riskler

- Farkli Supabase projeleri kullanilirsa kullanici ve isletme eslesmesi kopar.
- Public `SECURITY DEFINER` mutasyon RPC'leri ciddi guvenlik riski olusturur.
- Ana projedeki odeme durumu analytics paneline yazilmazsa plan/trial kontrolleri anlamsiz kalir.
- `business_members` kurulmadan sadece `businesses.auth_user_id` ile ilerlemek ekip/rol modelini kilitler.

## Uygulama Sirasi

1. Ana proje ve analytics panel ayni Supabase projesine alinmali.
2. `business_members`, `subscriptions`, `payments` migration'lari uygulanmali.
3. Ana proje kayit/odeme akisinda `businesses` ve `business_members` yazmali.
4. Analytics `getCurrentBusiness()` sadece session + membership ile business secmeli.
5. Admin mutasyonlari service role server action olarak kalmali.
6. Mock fallback sadece demo modda calismali; production'da sessizce gercek veri hatasini gizlememeli.
