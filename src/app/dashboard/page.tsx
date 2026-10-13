import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Icon } from '@/components/icons';
import { requireStaff } from '@/lib/auth';

export const dynamic = 'force-dynamic';
function formatDate(value: string) { return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)); }

export default async function DashboardPage() {
  const { supabase, profile } = await requireStaff();
  const [allRows, pendingRows, verifiedRows, recentRows] = await Promise.all([
    supabase.from('residents').select('id', { count: 'exact', head: true }).neq('record_status', 'archived'),
    supabase.from('residents').select('id', { count: 'exact', head: true }).in('record_status', ['draft', 'pending']),
    supabase.from('residents').select('id', { count: 'exact', head: true }).eq('record_status', 'verified'),
    supabase.from('residents').select('id, record_code, full_name, village, district, record_status, created_at').order('created_at', { ascending: false }).limit(5),
  ]);
  const total = allRows.count ?? 0; const pending = pendingRows.count ?? 0; const verified = verifiedRows.count ?? 0;
  const hasError = Boolean(allRows.error || pendingRows.error || verifiedRows.error || recentRows.error);
  const completion = total > 0 ? Math.min(100, Math.round((verified / total) * 100)) : 0;
  const stats = [
    { title: 'Catatan aktif', value: total, description: 'Data non-arsip', icon: 'users' as const, accent: 'text-[#476d53]', tint: 'bg-[#e8efe2]' },
    { title: 'Perlu diperiksa', value: pending, description: 'Draft dan menunggu verifikasi', icon: 'clock' as const, accent: 'text-[#9a7740]', tint: 'bg-[#f3eadb]' },
    { title: 'Terverifikasi', value: verified, description: 'Telah diperiksa petugas', icon: 'badge-check' as const, accent: 'text-[#527e5d]', tint: 'bg-[#e5eee1]' },
  ];
  return (
    <AppShell profile={profile}>
      <section className="app-enter relative mb-6 overflow-hidden rounded-[17px] bg-[#1b4338] px-6 py-7 text-[#f5f3e9] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute right-[-40px] top-[-120px] h-[350px] w-[350px] rounded-full border border-[#e3ebd0]/10 decor-drift"/><div className="pointer-events-none absolute right-[75px] top-[-50px] h-[230px] w-[230px] rounded-full border border-[#e3ebd0]/15"/>
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div className="max-w-[650px]"><p className="mb-4 flex items-center gap-2 font-code text-[10px] text-[#c3d5b0]"><span className="h-px w-6 bg-[#c3d5b0]/80"/> RUANG KERJA / 01</p><h1 className="font-display text-[43px] leading-[.98] sm:text-[54px]">Selamat datang,<br/><span className="text-[#d7e6a9]">{profile.full_name.split(' ')[0]}.</span></h1><p className="mt-4 max-w-[520px] text-[12px] leading-6 text-[#d5dfd4]/75">Ringkasan operasional pendataan masyarakat. Lihat catatan terbaru, periksa status, dan lanjutkan pekerjaan dari sini.</p></div><div className="flex flex-wrap gap-2"><Link href="/penduduk" className="button-spring inline-flex h-11 items-center gap-2 rounded-xl bg-[#f4f2e8] px-4 text-[11px] font-bold text-[#254738] hover:bg-white"><Icon name="users" size={15}/> Buka data <Icon name="arrow-up-right" size={14}/></Link>{['admin', 'operator', 'verifier'].includes(profile.role) && <Link href="/penduduk/tambah" className="button-spring inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/[.06] px-4 text-[11px] font-semibold text-white hover:bg-white/10"><Icon name="plus" size={15}/> Data baru</Link>}</div></div>
      </section>

      {hasError && <div role="alert" className="mb-5 rounded-xl border border-[#e9c7b9] bg-[#fff4ef] p-4 text-[11px] text-[#8f4f3a]">Sebagian ringkasan belum dapat dimuat. Periksa koneksi Supabase, profil petugas, dan kebijakan RLS.</div>}

      <section className="stagger-in grid gap-3 md:grid-cols-3">
        {stats.map((stat) => <article key={stat.title} className="surface-lift rounded-[15px] border border-[#dfe3d9] bg-[#fffefa] p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-semibold text-[#78857a]">{stat.title}</p><p className="mt-4 font-display text-[45px] leading-none text-[#1f392f]">{new Intl.NumberFormat('id-ID').format(stat.value)}</p><p className="mt-3 text-[10px] text-[#9aa398]">{stat.description}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-[11px] ${stat.tint} ${stat.accent}`}><Icon name={stat.icon} size={19}/></span></div></article>)}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,.7fr)]">
        <section className="overflow-hidden rounded-[16px] border border-[#dfe3d9] bg-[#fffefa]"><div className="flex items-center justify-between gap-3 border-b border-[#e8ebe3] px-5 py-5 sm:px-6"><div><p className="font-code text-[9px] text-[#9aa397]">CATATAN / TERBARU</p><h2 className="mt-1.5 text-[13px] font-bold text-[#273c31]">Data terakhir masuk</h2></div><Link href="/penduduk" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#406d4f] hover:underline">Lihat daftar <Icon name="chevron-right" size={14}/></Link></div>
          {recentRows.error ? <p className="p-6 text-[11px] text-[#8f4f3a]">Data terbaru belum dapat dimuat.</p> : !recentRows.data?.length ? <div className="px-6 py-12 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#e9eee4] text-[#6b846e]"><Icon name="database" size={18}/></span><p className="mt-3 text-[12px] font-bold text-[#2d4135]">Belum ada data</p><p className="mt-1 text-[11px] text-[#929c92]">Tambahkan data fiktif untuk menguji alur.</p><Link href="/penduduk/tambah" className="mt-4 inline-flex text-[11px] font-bold text-[#3d6a4c] hover:underline">Tambah catatan pertama</Link></div> : <div className="divide-y divide-[#eef0e9]">{recentRows.data.map((row, index) => <div key={row.id} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-[#f8f8f3] sm:px-6" style={{ animation: 'enter-rise .35s ease both', animationDelay: `${index * 45}ms` }}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dfe6d7] bg-[#edf1e7] text-[10px] font-bold text-[#496b51]">{row.full_name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('')}</span><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-[#2a3d32]">{row.full_name}</p><p className="mt-1 truncate font-code text-[9px] text-[#98a197]">{row.record_code}<span className="mx-2 font-sans text-[#c1c8be]">/</span>{row.village || 'Wilayah belum diisi'}</p></div><div className="hidden text-right sm:block"><p className="text-[10px] text-[#6e7c70]">{formatDate(row.created_at)}</p><p className={`mt-1 text-[10px] font-semibold ${row.record_status === 'verified' ? 'text-[#4b8056]' : 'text-[#a07b41]'}`}>{row.record_status === 'verified' ? 'Terverifikasi' : row.record_status === 'pending' ? 'Menunggu pemeriksaan' : row.record_status === 'archived' ? 'Diarsipkan' : 'Draft'}</p></div></div>)}</div>}
        </section>

        <section className="rounded-[16px] border border-[#dfe3d9] bg-[#fffefa] p-5 sm:p-6"><p className="font-code text-[9px] text-[#9aa397]">KUALITAS DATA</p><h2 className="mt-1.5 text-[13px] font-bold text-[#273c31]">Kemajuan verifikasi</h2><div className="mt-7 flex items-end justify-between gap-3"><div><p className="font-display text-[48px] leading-none text-[#1f392f]">{completion}<span className="text-[24px]">%</span></p><p className="mt-2 text-[10px] text-[#929c92]">Catatan terverifikasi</p></div><p className="rounded-lg bg-[#e7efe3] px-2.5 py-1.5 font-code text-[10px] text-[#4c7353]">{verified} / {total}</p></div><div className="mt-5 h-[5px] overflow-hidden rounded-full bg-[#e7e9e1]"><div className="h-full rounded-full bg-[#537e5b] transition-all duration-700" style={{ width: `${completion}%` }}/></div><div className="mt-6 space-y-4"><StatusLine color="#537e5b" label="Terverifikasi" value={verified} total={total}/><StatusLine color="#ba9556" label="Perlu pemeriksaan" value={pending} total={total}/><StatusLine color="#b7beb3" label="Status lainnya" value={Math.max(0, total - verified - pending)} total={total}/></div><div className="mt-7 border-t border-[#e8ebe3] pt-4"><div className="flex items-start gap-2.5"><Icon name="shield-check" size={16} className="mt-0.5 shrink-0 text-[#64806a]"/><p className="text-[10px] leading-[1.8] text-[#879187]">Jangan masukkan data masyarakat nyata sebelum dasar pemrosesan dan hak akses disetujui kantor.</p></div></div></section>
      </div>
    </AppShell>
  );
}

function StatusLine({ color, label, value, total }: { color: string; label: string; value: number; total: number }) {
  const percent = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return <div><div className="mb-2 flex items-center justify-between gap-3 text-[10px]"><span className="flex items-center gap-2 text-[#78857a]"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }}/>{label}</span><span className="font-code text-[#42594a]">{value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#eef0e9]"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${percent}%`, backgroundColor: color }}/></div></div>;
}
