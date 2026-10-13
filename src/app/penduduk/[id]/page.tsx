import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Icon } from '@/components/icons';
import { requireStaff } from '@/lib/auth';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ id: string }> };
const labels: Record<string, string> = { draft: 'Draft', pending: 'Menunggu pemeriksaan', verified: 'Terverifikasi', archived: 'Diarsipkan' };
function niceDate(value: string | null) { if (!value) return 'Belum diisi'; return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value)); }
function Info({ label, value, sensitive = false }: { label: string; value?: string | null; sensitive?: boolean }) { return <div className="min-w-0 border-b border-[#eceee7] py-3"><p className="text-[10px] text-[#8b968b]">{label}</p><p className={`mt-1.5 break-words text-[12px] font-semibold ${sensitive ? 'font-code text-[#506557]' : 'text-[#2a4033]'}`}>{value || 'Belum diisi'}</p></div>; }

export default async function ResidentProfilePage({ params }: Props) {
  const [{ id }, { supabase, profile }] = await Promise.all([params, requireStaff()]);
  const { data: resident, error } = await supabase.from('residents').select('id, record_code, full_name, village, district, regency, province, record_status, created_at, updated_at').eq('id', id).maybeSingle();
  if (error || !resident) notFound();
  const canSeePrivate = ['admin', 'operator', 'verifier'].includes(profile.role);
  const privateResult = canSeePrivate ? await supabase.from('resident_private_data').select('nik, gender, address, rt, rw, occupation, citizenship, birth_place, birth_date, religion, marital_status, blood_type, photo_path').eq('resident_id', id).maybeSingle() : { data: null, error: null };
  const privateData = privateResult.data;
  let photoUrl = '';
  if (privateData?.photo_path) {
    const { data } = await supabase.storage.from('resident-photos').createSignedUrl(privateData.photo_path, 60);
    photoUrl = data?.signedUrl ?? '';
  }
  const statusStyle = resident.record_status === 'verified' ? 'bg-[#e6efe4] text-[#2e6948]' : resident.record_status === 'archived' ? 'bg-[#f0f0e9] text-[#778078]' : 'bg-[#f8f0df] text-[#966a29]';

  return <AppShell profile={profile}>
    <div className="app-enter mx-auto max-w-[1080px]">
      <Link href="/penduduk" className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold text-[#748076] hover:text-[#1d5145]"><Icon name="arrow-left" size={15}/> Kembali ke daftar</Link>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-code text-[10px] text-[#95a093]">PROFIL / {resident.record_code}</p><h1 className="font-display mt-2 text-[44px] leading-none text-[#1c342b] sm:text-[50px]">Profil masyarakat</h1><p className="mt-3 text-[12px] text-[#7f8a80]">Informasi catatan sesuai akses petugas yang masuk.</p></div><div className="flex flex-wrap gap-2"><span className={`inline-flex h-10 items-center rounded-full px-3 text-[10px] font-bold ${statusStyle}`}>{labels[resident.record_status] ?? resident.record_status}</span>{canSeePrivate && <Link href={`/penduduk/${id}/kartu`} className="button-spring inline-flex h-10 items-center gap-2 rounded-xl bg-[#1d5145] px-4 text-[11px] font-bold text-white hover:bg-[#17473c]"><Icon name="id-card" size={15}/> Kartu internal</Link>}</div></div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,.76fr)_minmax(0,1.4fr)]">
        <section className="rounded-[16px] border border-[#dfe3d9] bg-[#fffefa] p-6 sm:p-7"><div className="flex flex-col items-start"><div className="flex h-[78px] w-[78px] items-center justify-center overflow-hidden rounded-[19px] border border-[#dce5d6] bg-[#e9eee4] text-[22px] font-bold text-[#45694e]">{photoUrl ? <img src={photoUrl} alt="Foto profil" className="h-full w-full object-cover"/> : resident.full_name.trim().split(/\s+/).slice(0,2).map((x) => x[0]?.toUpperCase()).join('')}</div><h2 className="mt-5 font-display text-[30px] leading-tight text-[#23392e]">{resident.full_name}</h2><p className="mt-2 font-code text-[10px] text-[#8c988c]">{resident.record_code}</p><span className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold ${statusStyle}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{labels[resident.record_status] ?? resident.record_status}</span></div><div className="mt-7 border-t border-[#e9ebe4] pt-5"><p className="font-code text-[9px] text-[#9aa398]">WILAYAH</p><div className="mt-3 flex items-start gap-2.5"><Icon name="map-pin" size={16} className="mt-0.5 text-[#718871]"/><div><p className="text-[12px] font-semibold text-[#334b3a]">{resident.village || 'Desa / kelurahan belum diisi'}</p><p className="mt-1 text-[11px] text-[#8a958a]">{resident.district || 'Kecamatan belum diisi'}</p><p className="mt-1 text-[11px] text-[#8a958a]">{[resident.regency, resident.province].filter(Boolean).join(', ') || 'Wilayah belum lengkap'}</p></div></div></div><div className="mt-6 border-t border-[#e9ebe4] pt-4 text-[10px] leading-5 text-[#929c92]"><p>Dibuat pada {niceDate(resident.created_at)}.</p><p>Pembaruan terakhir {niceDate(resident.updated_at)}.</p></div></section>
        <section className="rounded-[16px] border border-[#dfe3d9] bg-[#fffefa] p-5 sm:p-7"><div className="border-b border-[#e9ebe4] pb-4"><p className="font-code text-[9px] text-[#9aa398]">DETAIL / CATATAN</p><h2 className="mt-1.5 text-[13px] font-bold text-[#2b4034]">Informasi tercatat</h2><p className="mt-1 text-[11px] text-[#929b90]">Kolom sensitif hanya tersedia untuk peran petugas yang diizinkan.</p></div><div className="grid gap-x-6 sm:grid-cols-2"><Info label="Nama lengkap" value={resident.full_name}/><Info label="Kode referensi" value={resident.record_code} sensitive/><Info label="Desa / kelurahan" value={resident.village}/><Info label="Kecamatan" value={resident.district}/><Info label="Kabupaten / kota" value={resident.regency}/><Info label="Provinsi" value={resident.province}/>{canSeePrivate && <><Info label="NIK" value={privateData?.nik} sensitive/><Info label="Jenis kelamin" value={privateData?.gender}/><Info label="Tempat lahir" value={privateData?.birth_place}/><Info label="Tanggal lahir" value={privateData?.birth_date ? niceDate(privateData.birth_date) : null}/><Info label="Golongan darah" value={privateData?.blood_type}/><Info label="Agama" value={privateData?.religion}/><Info label="Status perkawinan" value={privateData?.marital_status}/><Info label="Pekerjaan" value={privateData?.occupation}/><Info label="Kewarganegaraan" value={privateData?.citizenship}/><Info label="Alamat" value={privateData?.address}/><Info label="RT / RW" value={privateData ? [privateData.rt, privateData.rw].filter(Boolean).join(' / ') : null}/></>}</div>{!canSeePrivate && <div className="mt-5 rounded-xl border border-[#e5e8de] bg-[#f7f8f2] p-4 text-[11px] leading-5 text-[#7c887d]"><Icon name="shield-check" size={15} className="mr-1.5 inline-block text-[#5d7e62]"/> Detail pribadi disembunyikan berdasarkan peran akun kamu.</div>}</section>
      </div>
    </div>
  </AppShell>;
}
