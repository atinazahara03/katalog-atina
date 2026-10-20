-- Skema tabel varian produk (US-12 & US-48)
-- Cara pakai: Buka dashboard Supabase > SQL Editor > New query > Tempel skrip ini > Run.

create table if not exists public.varian (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama_varian text not null,
  harga integer not null check (harga >= 0),
  stok integer check (stok is null or stok >= 0),
  created_at timestamptz not null default now()
);

-- Index untuk performa query per produk_id
create index if not exists idx_varian_produk_id on public.varian (produk_id);

-- Row Level Security
alter table public.varian enable row level security;

-- Pengunjung / publik boleh membaca varian produk
drop policy if exists "publik_baca_varian" on public.varian;
create policy "publik_baca_varian" on public.varian
  for select to public using (true);

-- Admin boleh mengelola varian produk (tambah, ubah, hapus)
drop policy if exists "admin_kelola_varian" on public.varian;
create policy "admin_kelola_varian" on public.varian
  for all to authenticated using (true) with check (true);

-- Data varian contoh untuk beberapa produk (hanya diisi jika tabel kosong)
insert into public.varian (produk_id, nama_varian, harga, stok)
select p.id, v.nama_varian, v.harga, v.stok
from public.produk p
cross join (values
  ('Kemasan 250 g', 45000, 20),
  ('Kemasan 500 g', 85000, 15),
  ('Kemasan 1 kg',  160000, 10)
) as v(nama_varian, harga, stok)
where p.id = 1
  and not exists (select 1 from public.varian where produk_id = 1);

insert into public.varian (produk_id, nama_varian, harga, stok)
select p.id, v.nama_varian, v.harga, v.stok
from public.produk p
cross join (values
  ('Toples 250 g', 40000, 30),
  ('Toples 500 g', 75000, 20)
) as v(nama_varian, harga, stok)
where p.id = 4
  and not exists (select 1 from public.varian where produk_id = 4);

insert into public.varian (produk_id, nama_varian, harga, stok)
select p.id, v.nama_varian, v.harga, v.stok
from public.produk p
cross join (values
  ('1 meter',   90000, 25),
  ('2 meter',  175000, 15),
  ('3 meter',  250000, 10)
) as v(nama_varian, harga, stok)
where p.id = 6
  and not exists (select 1 from public.varian where produk_id = 6);
