-- Skema tabel banner promo beranda (US-42)
-- Cara pakai: Supabase > SQL Editor > New query > Tempel skrip ini > Run.

create table if not exists public.banner (
  id bigint generated always as identity primary key,
  judul text not null,
  teks text not null,
  gambar_url text,
  tautan text default '#judul-produk',
  label_tombol text default 'Lihat Promo',
  is_aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.banner enable row level security;

-- Publik boleh membaca banner yang aktif
drop policy if exists "publik_baca_banner" on public.banner;
create policy "publik_baca_banner" on public.banner
  for select to public using (is_aktif = true);

-- Admin boleh mengelola banner (US-42)
drop policy if exists "admin_kelola_banner" on public.banner;
create policy "admin_kelola_banner" on public.banner
  for all to authenticated using (true) with check (true);

-- Data banner awal (hanya ditambahkan jika tabel kosong)
insert into public.banner (judul, teks, gambar_url, tautan, label_tombol, is_aktif)
select
  'Penawaran Spesial Pekan Ini!',
  'Nikmati beragam produk pilihan berkualitas dengan harga terbaik. Pesan langsung dengan mudah lewat WhatsApp.',
  '/produk/kopi.svg',
  '#judul-produk',
  'Pesan Sekarang',
  true
where not exists (select 1 from public.banner);

