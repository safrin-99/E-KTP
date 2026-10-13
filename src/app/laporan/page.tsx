import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Icon } from '@/components/icons';
import { requireStaff } from '@/lib/auth';

export const dynamic = 'force-dynamic';
function pct(value: number, total: number) { return total > 0 ? Math.round((value / total) * 100) : 0; }

export default async function LaporanPage() {
  const { supabase, profile } = await requireStaff();
  const canView = ['admin', 'operator', 'verifier', 'viewer'].includes(profile.role);
  if (!canView) return <AppShell profile={profile}><div className="rounded-[16px] border border-[#dfe3d9] bg-[#fffefa] p-8"><Icon name="shield-check" size={24} className="text-[#64806a]"/><h1 className="font-display mt-3 text-[38px] text-[#1c342b]">Akses laporan dibatasi</h1><p className="mt-2 text-[12px] leading-6 text-[#798479]">Akun kamu tidak memiliki izin untuk membuka laporan data masyarakat.</p><Link href="/dashboard" className="mt-5 inline-flex text-[11px] font-bold text-[#3d6a4c] hover:underline">Kembali ke ringkasan</Link></div></AppShell>;

  const [totalRows, draftRows, pendingRows, verifiedRows, archivedRows, regionRows] = await Promise.all([
    supabase.from('residents').select('id', { count: 'exact', head: true }).neq('record_status', 'archived'),
    supabase.from('residents').select('id', { count: 'exact', head: true }).eq('record_status', 'draft'),
    supabase.from('residents').select('id', { count: 'exact', head: true }).eq('record_status', 'pending'),
    supabase.from('residents').select('id', { count: 'exact', head: true }).eq('record_status', 'verified'),
    supabase.from('residents').select('id', { count: 'exact', head: true }).eq('record_status', 'archived'),
    supabase.from('residents').select('village, district').neq('record_status', 'archived').order('created_at', { ascending: false }).limit(1000),
  ]);
  const count = totalRows.count ?? 0; const draft = draftRows.count ?? 0; const pending = pendingRows.count ?? 0; const verified = verifiedRows.count ?? 0; const archived = archivedRows.count ?? 0;
  const regionMap = new Map<string, { village: string; district: string; count: number }>();
  for (const row of regionRows.data ?? []) {
    const village = row.village || 'Belum diisi'; const district = row.district || 'Belum diisi'; const key = `${village}::${district}`;
    const current = regionMap.get(key); if (current) current.count += 1; else regionMap.set(key, { village, district, count: 1 });
  }
  const regions = [...regionMap.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  const hasError = [totalRows, draftRows, pendingRows, verifiedRows, archivedRows, regionRows].some((result) => Boolean(result.error));
  const canExport = ['admin', 'operator', 'verifier'].includes(profile.role);

  return <AppShell profile={profile}>
    <div className="app-enter mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-code text-[10px] text-[#96a093]">ANALISIS / LAPORAN</p><h1 className="font-display mt-2 text-[44px] leading-none text-[#1c342b] sm:text-[50px]">Laporan pendataan</h1><p className="mt-3 max-w-[600px] text-[12px] leading-6 text-[#798479]">Ringkasan status dan persebaran data non-arsip dalam unit kerja kamu.</p></div>{canExport && <a href="/api/laporan/unduh" className="button-spring inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#1d5145] px-4 text-[11px] font-bold text-white hover:bg-[#17473c]"><Icon name="download" size={15}/> Unduh laporan CSV</a>}</div>
    {hasError && <div role="alert" className="mb-5 rounded-xl border border-[#e9c7b9] bg-[#fff4ef] p-4 text-[11px] text-[#8f4f3a]">Sebagian laporan tidak dapat dimuat. Periksa kebijakan RLS pada tabel residents.</div>}
    <section className="stagger-in grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[{ label: 'Data aktif', value: count, description: 'Tidak termasuk arsip', color: '#325f4c' }, { label: 'Draft', value: draft, description: `${pct(draft,count)}% dari catatan aktif`, color: '#ba9556' }, { label: 'Menunggu verifikasi', value: pending, description: `${pct(pending,count)}% dari catatan aktif`, color: '#969a58' }, { label: 'Terverifikasi', value: verified, description: `${pct(verified,count)}% dari catatan aktif`, color: '#4c805a' }].map((item) => <article key={item.label} className="surface-lift rounded-[15px] border border-[#dfe3d9] bg-[#fffefa] p-5"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}/><p className="text-[11px] font-semibold text-[#78857a]">{item.label}</p></div><p className="font-display mt-4 text-[42px] leading-none text-[#1f392f]">{new Intl.NumberFormat('id-ID').format(item.value)}</p><p className="mt-3 text-[10px] text-[#9aa398]">{item.description}</p></article>)}
    </section>
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,.75fr)]">
      <section className="overflow-hidden rounded-[16px] border border-[#dfe3d9] bg-[#fffefa]"><div className="border-b border-[#e8ebe3] px-5 py-5 sm:px-6"><p className="font-code text-[9px] text-[#9aa397]">SEBARAN WILAYAH</p><h2 className="mt-1.5 text-[13px] font-bold text-[#273c31]">Catatan menurut desa dan kecamatan</h2><p className="mt-1 text-[10px] text-[#929b90]">Maksimal 1.000 catatan aktif terbaru yang dimuat.</p></div>{regions.length === 0 ? <div className="px-6 py-12 text-center text-[11px] text-[#929b90]">Belum ada catatan untuk diringkas.</div> : <div className="divide-y divide-[#eef0e9]">{regions.map((region) => <div key={`${region.village}-${region.district}`} className="flex items-center gap-4 px-5 py-4 sm:px-6"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9eee4] text-[#59795f]"><Icon name="map-pin" size={16}/></span><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-[#2a3d32]">{region.village}</p><p className="mt-1 truncate text-[10px] text-[#8f9a90]">{region.district}</p></div><div className="text-right"><p className="font-code text-[14px] text-[#365740]">{region.count}</p><p className="mt-1 text-[9px] text-[#a0a89f]">catatan</p></div></div>)}</div>}</section>
      <section className="rounded-[16px] border border-[#dfe3d9] bg-[#fffefa] p-5 sm:p-6"><p className="font-code text-[9px] text-[#9aa397]">STATUS / RINGKASAN</p><h2 className="mt-1.5 text-[13px] font-bold text-[#273c31]">Komposisi catatan</h2><div className="mt-5 space-y-4">{[{ label: 'Draft', value: draft, color: '#ba9556' }, { label: 'Menunggu verifikasi', value: pending, color: '#969a58' }, { label: 'Terverifikasi', value: verified, color: '#4c805a' }, { label: 'Diarsipkan', value: archived, color: '#a9b0a4' }].map((item) => <div key={item.label}><div className="mb-2 flex items-center justify-between text-[10px]"><span className="text-[#778478]">{item.label}</span><span className="font-code text-[#43594a]">{item.value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#eef0e9]"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct(item.value, count + archived)}%`, backgroundColor: item.color }}/></div></div>)}</div><div className="mt-7 border-t border-[#e8ebe3] pt-4"><div className="flex items-start gap-2.5"><Icon name="shield-check" size={16} className="mt-0.5 text-[#64806a]"/><p className="text-[10px] leading-[1.8] text-[#879187]">Laporan ini tidak menyertakan NIK, alamat lengkap, atau foto. Ekspor hanya tersedia bagi peran petugas yang diizinkan dan dicatat di log ekspor.</p></div></div></section>
    </div>
  </AppShell>;
}
