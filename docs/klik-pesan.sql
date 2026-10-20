-- Skema tabel pencatatan klik pesan WhatsApp / penjualan (US-40 & US-41)
-- Cara pakai: Buka dashboard Supabase > SQL Editor > New query > Tempel skrip ini > Run.

create table if not exists public.klik_pesan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Index untuk mempercepat agregasi per produk_id
create index if not exists idx_klik_pesan_produk_id on public.klik_pesan (produk_id);

-- Row Level Security
alter table public.klik_pesan enable row level security;

-- Pengunjung / publik boleh mencatat klik pemesanan
drop policy if exists "publik_tambah_klik" on public.klik_pesan;
create policy "publik_tambah_klik" on public.klik_pesan
  for insert to public with check (true);

-- Admin boleh membaca data klik untuk dashboard (US-41)
drop policy if exists "admin_baca_klik" on public.klik_pesan;
create policy "admin_baca_klik" on public.klik_pesan
  for select to authenticated using (true);

