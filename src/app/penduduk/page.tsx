import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { ResidentList } from '@/components/resident-list';
import { requireStaff } from '@/lib/auth';
import { Icon } from '@/components/icons';

export const dynamic = 'force-dynamic';
type Props = { searchParams: Promise<{ created?: string; photo?: string; error?: string }> };

export default async function PendudukPage({ searchParams }: Props) {
  const [{ created, photo, error }, { supabase, profile }] = await Promise.all([searchParams, requireStaff()]);
  const [residentsResult, activeCountResult] = await Promise.all([
    supabase.from('residents').select('id, record_code, full_name, village, district, record_status, created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('residents').select('id', { count: 'exact', head: true }).neq('record_status', 'archived'),
  ]);
  const canExport = ['admin', 'operator', 'verifier'].includes(profile.role);

  return (
    <AppShell profile={profile}>
      <div className="app-enter mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div><p className="mb-2 font-code text-[10px] text-[#96a093]">PENDATAAN / CATATAN MASYARAKAT</p><h1 className="font-display text-[43px] leading-none text-[#1c342b] sm:text-[50px]">Data masyarakat</h1><p className="mt-3 max-w-[590px] text-[12px] leading-6 text-[#798479]">Kelola identitas, alamat, dan status verifikasi di ruang kerja internal kantor.</p></div>
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <span className="mr-1 inline-flex h-10 items-center gap-2 rounded-full border border-[#dce5d6] bg-[#edf2e8] px-3 text-[10px] font-semibold text-[#55775a]"><span className="status-pulse h-1.5 w-1.5 rounded-full bg-[#6b9670]"/> Akses petugas aktif</span>
          {canExport && <Link href="/penduduk/tambah" className="button-spring inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1d5145] px-4 text-[11px] font-bold text-white shadow-[0_6px_14px_rgba(29,81,69,.15)] hover:bg-[#17473c]"><Icon name="plus" size={16}/> Tambah data</Link>}
        </div>
      </div>
      {created === '1' && <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-[#c9dfc4] bg-[#edf5e9] px-4 py-3.5 text-[#376847] app-enter"><Icon name="check-circle" size={17} className="mt-0.5 shrink-0"/><div><p className="text-[12px] font-bold">Data berhasil disimpan</p><p className="mt-1 text-[11px] leading-5">Catatan baru tersimpan sebagai draft. Pastikan data diperiksa sebelum ditandai terverifikasi.</p>{photo === 'error' && <p className="mt-1 text-[11px] text-[#8b6134]">Data tersimpan, tetapi foto gagal diunggah. Kamu dapat melanjutkan tanpa foto.</p>}</div></div>}
      {error === 'forbidden' && <div role="alert" className="mb-5 rounded-xl border border-[#e9c7b9] bg-[#fff4ef] px-4 py-3.5 text-[11px] text-[#8f4f3a]">Akun ini tidak memiliki izin untuk melakukan tindakan tersebut.</div>}
      <ResidentList residents={(residentsResult.data ?? []) as Array<{ id: string; record_code: string; full_name: string; village: string | null; district: string | null; record_status: string; created_at: string }>} loadError={Boolean(residentsResult.error || activeCountResult.error)} totalCount={activeCountResult.count ?? 0} canExport={canExport}/>
      <p className="mt-4 text-[10px] leading-5 text-[#9ba398]">Data pribadi hanya ditampilkan kepada petugas sesuai hak akses. Gunakan data fiktif hingga kantor menyetujui penggunaan data nyata.</p>
    </AppShell>
  );
}
