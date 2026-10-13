# Hotfix dari screenshot error

1. Duplikat `import Link from 'next/link'` pada `src/components/resident-list.tsx` sudah dihapus.
2. Jangan menjalankan ulang `supabase/migrations/202610130001_initial_schema.sql` jika objek dari migrasi itu sudah ada. Error `residents_stamp_before_write already exists` terjadi karena file awal dijalankan lagi.
3. Setelah memastikan tabel/triggers dari migrasi awal tersedia, jalankan hanya `supabase/migrations/202610130002_create_resident_record.sql` untuk memasang fungsi penyimpanan formulir dan tabel log ekspor.
4. Pertahankan `.env.local` lokal; jangan salin `.env.example` menimpanya.
