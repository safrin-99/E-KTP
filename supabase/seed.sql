-- DATA UJI FIKTIF. Tidak mengandung NIK, foto, atau alamat penduduk nyata.
-- Jalankan setelah migrasi awal. Aman dijalankan ulang selama kode demo tidak diubah.

insert into public.residents (
  office_id, record_code, full_name, village, district, regency, province, record_status
)
select
  o.id, 'DEMO-0001', 'Andi Contoh',
  'Desa Simulasi', 'Kecamatan Contoh', 'Kabupaten Contoh', 'Provinsi Contoh', 'draft'
from public.offices o
where not exists (select 1 from public.residents r where r.record_code = 'DEMO-0001')
limit 1;

insert into public.residents (
  office_id, record_code, full_name, village, district, regency, province, record_status
)
select
  o.id, 'DEMO-0002', 'Bunga Simulasi',
  'Kelurahan Fiktif', 'Kecamatan Contoh', 'Kabupaten Contoh', 'Provinsi Contoh', 'pending'
from public.offices o
where not exists (select 1 from public.residents r where r.record_code = 'DEMO-0002')
limit 1;
