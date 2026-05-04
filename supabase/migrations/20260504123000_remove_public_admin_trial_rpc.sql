-- Admin trial uzatma islemi artik Next.js server action + service role ile yapilir.
-- Client tarafindan anon/authenticated role ile cagirilabilen mutasyon RPC'si kapatilir.

revoke execute on function public.admin_extend_business_trial(bigint, int) from anon, authenticated;
drop function if exists public.admin_extend_business_trial(bigint, int);
