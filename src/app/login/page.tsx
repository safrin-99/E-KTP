import { Icon } from '@/components/icons';
import { LoginForm } from '@/components/login-form';

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  let message = '';
  if (error === 'missing') message = 'Masukkan email dan kata sandi untuk melanjutkan.';
  if (error === 'credentials') message = 'Email atau kata sandi tidak cocok. Periksa kembali lalu coba lagi.';
  if (error === 'no-access') message = 'Akun sudah ada, tetapi belum aktif atau belum terdaftar sebagai petugas. Hubungi administrator kantor.';

  return (
    <main className="grid min-h-screen bg-[#f4f3ed] lg:grid-cols-[minmax(420px,1.02fr)_minmax(480px,.98fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#173a32] px-12 py-10 text-[#f5f3e9] lg:flex lg:flex-col xl:px-[7vw]">
        <div className="pointer-events-none absolute inset-0 opacity-[.13]" style={{ backgroundImage: 'radial-gradient(#d7e8a2 0.7px, transparent 0.7px)', backgroundSize: '22px 22px' }}/>
        <div className="pointer-events-none absolute -right-[240px] top-[9%] h-[680px] w-[680px] rounded-full border border-[#e1eccb]/15 decor-drift"/>
        <div className="pointer-events-none absolute -right-[145px] top-[17%] h-[490px] w-[490px] rounded-full border border-[#e1eccb]/20"/>
        <div className="pointer-events-none absolute -right-[60px] top-[26%] h-[300px] w-[300px] rounded-full border border-[#e1eccb]/25"/>
        <div className="pointer-events-none absolute bottom-[-160px] left-[-160px] h-[440px] w-[440px] rounded-full border border-[#e1eccb]/10"/>

        <div className="relative z-10 flex items-center gap-3 app-enter">
          <div className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-white/15 bg-white/[.07] text-[#e0e9bf]"><Icon name="id-card" size={21}/></div>
          <div><p className="text-[15px] font-bold tracking-[-.03em]">DataWarga</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.2em] text-[#c0d0bd]/65">Ruang kerja internal</p></div>
        </div>

        <div className="relative z-10 my-auto max-w-[570px] py-20 app-enter enter-delay-1">
          <p className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.22em] text-[#c4d6ad]"><span className="h-px w-9 bg-[#c4d6ad]/70"/> Administrasi yang tertata</p>
          <h1 className="font-display max-w-[570px] text-[64px] leading-[.94] tracking-[-.055em] xl:text-[76px]">Data yang rapi.<br/><span className="text-[#d4e4a2]">Kerja yang berarti.</span></h1>
          <p className="mt-7 max-w-[390px] text-[13px] leading-[1.9] text-[#d6e0d3]/72">Satu ruang kerja bagi petugas untuk mencatat, memeriksa, dan mengelola informasi masyarakat dengan akses yang terjaga.</p>

          <div className="mt-12 grid max-w-[430px] grid-cols-2 gap-5 border-t border-white/15 pt-6">
            <div><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-[#d6e4b6]"><Icon name="database" size={16}/></div><p className="text-[12px] font-semibold text-white/90">Data terpusat</p><p className="mt-1.5 text-[11px] leading-5 text-[#c4d3c5]/60">Tersusun dalam satu ruang kerja.</p></div>
            <div><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-[#d6e4b6]"><Icon name="shield-check" size={16}/></div><p className="text-[12px] font-semibold text-white/90">Akses sesuai peran</p><p className="mt-1.5 text-[11px] leading-5 text-[#c4d3c5]/60">Informasi mengikuti izin petugas.</p></div>
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-[10px] text-[#c4d3c5]/55"><span>DATAWARGA / INTERNAL</span><span>Versi awal · 01.0</span></div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
        <LoginForm message={message}/>
      </section>
    </main>
  );
}
