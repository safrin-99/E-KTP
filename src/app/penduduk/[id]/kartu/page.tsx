import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Icon } from '@/components/icons';
import { PrintButton } from '@/components/print-button';
import { requireStaff } from '@/lib/auth';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ id: string }> };
function fieldLabel(label: string, value?: string | null) { return <div className="border-b border-[#e7ebe3] py-3"><p className="text-[9px] font-semibold uppercase tracking-[.13em] text-[#8d998f]">{label}</p><p className="mt-1.5 text-[12px] font-semibold text-[#273e31]">{value || 'Belum diisi'}</p></div>; }

export default async function InternalCardPage({ params }: Props) {
  const [{ id }, { supabase, profile }] = await Promise.all([params, requireStaff()]);
  if (!['admin', 'operator', 'verifier'].includes(profile.role)) redirect(`/penduduk/${id}`);
  const { data: resident, error } = await supabase.from('residents').select('id, record_code, full_name, village, district, regency, province').eq('id', id).maybeSingle();
  if (error || !resident) notFound();
  const { data: privateData } = await supabase.from('resident_private_data').select('nik, gender, address, rt, rw, occupation, citizenship, birth_place, birth_date, religion, marital_status, blood_type, photo_path').eq('resident_id', id).maybeSingle();
  let photoUrl = '';
  if (privateData?.photo_path) { const { data } = await supabase.storage.from('resident-photos').createSignedUrl(privateData.photo_path, 60); photoUrl = data?.signedUrl ?? ''; }
  const initials = resident.full_name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

  return <AppShell profile={profile}>
    <div className="app-enter mx-auto max-w-[930px]">
      <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href={`/penduduk/${id}`} className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#718075] hover:text-[#1d5145]"><Icon name="arrow-left" size={15}/> Kembali ke profil</Link><p className="font-code text-[10px] text-[#95a093]">DOKUMEN INTERNAL / PRATINJAU</p><h1 className="font-display mt-2 text-[42px] leading-none text-[#1c342b] sm:text-[48px]">Kartu data internal</h1><p className="mt-3 text-[12px] leading-6 text-[#798479]">Format ringkasan untuk kebutuhan administrasi kantor. Bukan dokumen identitas resmi.</p></div><PrintButton/></div>
      <section className="print-sheet overflow-hidden rounded-[18px] border border-[#d9dfd5] bg-[#fffefa] shadow-[0_20px_54px_rgba(27,48,42,.08)]">
        <div className="flex flex-col justify-between gap-5 bg-[#1b4338] px-6 py-6 text-[#f5f3e9] sm:flex-row sm:items-center sm:px-8 sm:py-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[.06] text-[#d7e6a9]"><Icon name="id-card" size={20}/></span><div><p className="text-[12px] font-bold tracking-wide">DATAWARGA</p><p className="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-[#c7d5c2]/65">Kartu data internal</p></div></div><span className="w-fit rounded-full border border-[#d7e6a9]/30 bg-[#d7e6a9]/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.15em] text-[#e4edc5]">Bukan identitas resmi</span></div>
        <div className="grid gap-7 p-6 sm:grid-cols-[190px_minmax(0,1fr)] sm:p-8"><div><div className="flex aspect-[4/5] w-full max-w-[190px] items-center justify-center overflow-hidden rounded-[15px] border border-[#dfe5d9] bg-[#edf1e7] text-[40px] font-bold text-[#4a6c51]">{photoUrl ? <img src={photoUrl} alt="Foto profil" className="h-full w-full object-cover"/> : initials}</div><p className="mt-3 font-code text-[9px] text-[#98a296]">REF / {resident.record_code}</p></div><div><p className="font-code text-[9px] text-[#98a296]">PROFIL MASYARAKAT</p><h2 className="font-display mt-2 text-[37px] leading-[1.02] text-[#1b362c] sm:text-[44px]">{resident.full_name}</h2><p className="mt-3 text-[11px] text-[#7f8b80]">{[resident.village, resident.district, resident.regency, resident.province].filter(Boolean).join(' · ') || 'Wilayah belum lengkap'}</p><div className="mt-5 grid gap-x-7 sm:grid-cols-2">{fieldLabel('NIK', privateData?.nik)}{fieldLabel('Jenis kelamin', privateData?.gender)}{fieldLabel('Tempat, tanggal lahir', [privateData?.birth_place, privateData?.birth_date].filter(Boolean).join(', '))}{fieldLabel('Golongan darah', privateData?.blood_type)}{fieldLabel('Status perkawinan', privateData?.marital_status)}{fieldLabel('Pekerjaan', privateData?.occupation)}{fieldLabel('Kewarganegaraan', privateData?.citizenship)}{fieldLabel('Agama', privateData?.religion)}<div className="sm:col-span-2">{fieldLabel('Alamat', [privateData?.address, privateData?.rt ? `RT ${privateData.rt}` : '', privateData?.rw ? `RW ${privateData.rw}` : '', resident.village, resident.district].filter(Boolean).join(', '))}</div></div></div></div>
        <div className="flex flex-col gap-2 border-t border-[#dfe5d9] bg-[#f5f6f0] px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p className="text-[10px] leading-5 text-[#758277]">Diterbitkan oleh sistem pendataan internal kantor untuk keperluan administrasi.</p><p className="font-code text-[9px] font-medium tracking-[.12em] text-[#77877a]">INTERNAL USE ONLY</p></div>
      </section>
      <p className="no-print mt-4 text-[10px] leading-5 text-[#99a197]">Saat mencetak, gunakan fitur “Simpan sebagai PDF” pada dialog cetak browser. Desain ini sengaja berbeda dari KTP-el dan tidak berfungsi sebagai identitas resmi.</p>
    </div>
  </AppShell>;
}
