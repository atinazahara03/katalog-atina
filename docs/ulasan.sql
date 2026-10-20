-- Skema tabel ulasan dan rating produk (US-38)
-- Cara pakai: Buka dashboard Supabase > SQL Editor > New query > Tempel skrip ini > Run.

create table if not exists public.ulasan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  komentar text not null,
  created_at timestamptz not null default now()
);

-- Index untuk mempercepat query ulasan per produk
create index if not exists idx_ulasan_produk_id on public.ulasan (produk_id);

-- Row Level Security
alter table public.ulasan enable row level security;

-- Pengunjung / publik boleh membaca ulasan
drop policy if exists "publik_baca_ulasan" on public.ulasan;
create policy "publik_baca_ulasan" on public.ulasan
  for select to public using (true);

-- Pengunjung / publik boleh menambahkan ulasan
drop policy if exists "publik_tambah_ulasan" on public.ulasan;
create policy "publik_tambah_ulasan" on public.ulasan
  for insert to public with check (true);

-- Admin boleh mengubah atau menghapus ulasan (US-39)
drop policy if exists "admin_kelola_ulasan" on public.ulasan;
create policy "admin_kelola_ulasan" on public.ulasan
  for all to authenticated using (true) with check (true);

