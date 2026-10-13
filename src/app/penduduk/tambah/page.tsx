import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CustomSelect } from '@/components/custom-select';
import { Icon } from '@/components/icons';
import { PhotoPicker } from '@/components/photo-picker';
import { requireStaff } from '@/lib/auth';
import { createResident } from './actions';

type Props = { searchParams: Promise<{ error?: string }> };

const genderOptions = [
  { label: 'Laki-laki', value: 'Laki-laki' },
  { label: 'Perempuan', value: 'Perempuan' },
  { label: 'Tidak diketahui', value: 'Tidak diketahui' },
];
const bloodOptions = ['Tidak diketahui', 'A', 'B', 'AB', 'O'].map((value) => ({ label: value, value }));
const religionOptions = ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Kepercayaan lainnya', 'Tidak diketahui'].map((value) => ({ label: value, value }));
const maritalOptions = ['Belum kawin', 'Kawin', 'Cerai hidup', 'Cerai mati', 'Tidak diketahui'].map((value) => ({ label: value, value }));
const citizenshipOptions = [{ label: 'WNI', value: 'WNI' }, { label: 'WNA', value: 'WNA' }, { label: 'Belum diketahui', value: 'Belum diketahui' }];

function Field({ label, name, placeholder, type = 'text', required = false, hint, maxLength }: { label: string; name: string; placeholder?: string; type?: string; required?: boolean; hint?: string; maxLength?: number }) {
  return <div><label htmlFor={name} className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[#536157]">{label}{required && <span className="text-[#ad6a46]">*</span>}</label><input id={name} name={name} type={type} required={required} placeholder={placeholder} maxLength={maxLength} inputMode={name === 'nik' || name === 'rt' || name === 'rw' ? 'numeric' : undefined} autoComplete="off" className="field-shell h-12 w-full rounded-xl border border-[#dce1d8] bg-white px-3.5 text-[12px] text-[#243c34] outline-none placeholder:text-[#a3aca2]"/>{hint && <p className="mt-1.5 text-[10px] leading-4 text-[#929c91]">{hint}</p>}</div>;
}
function SelectField({ label, name, options, placeholder = 'Pilih salah satu', defaultValue = '', required = false }: { label: string; name: string; options: { label: string; value: string }[]; placeholder?: string; defaultValue?: string; required?: boolean }) {
  return <div><label className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-[#536157]">{label}{required && <span className="text-[#ad6a46]">*</span>}</label><CustomSelect name={name} defaultValue={defaultValue} options={options} placeholder={placeholder}/></div>;
}

export default async function TambahPendudukPage({ searchParams }: Props) {
  const [{ error }, { profile }] = await Promise.all([searchParams, requireStaff()]);
  if (!['admin', 'operator', 'verifier'].includes(profile.role)) redirect('/penduduk?error=forbidden');

  const messages: Record<string, { title: string; body: string }> = {
    required: { title: 'Periksa kembali formulir', body: 'Lengkapi kolom wajib dan pastikan NIK berisi tepat 16 angka.' },
    'birth-date': { title: 'Tanggal lahir tidak valid', body: 'Tanggal lahir tidak boleh berada di masa depan.' },
    photo: { title: 'Foto tidak memenuhi ketentuan', body: 'Gunakan foto JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.' },
    'duplicate-nik': { title: 'NIK sudah terdaftar', body: 'NIK ini sudah digunakan pada catatan lain. Periksa data sebelum mengirim ulang.' },
    forbidden: { title: 'Akses tidak diizinkan', body: 'Akun ini tidak memiliki izin untuk menambah data.' },
    save: { title: 'Data belum tersimpan', body: 'Periksa migrasi database dan kebijakan akses Supabase, lalu coba lagi.' },
  };
  const issue = error ? messages[error] : null;

  return (
    <AppShell profile={profile}>
      <div className="app-enter mx-auto max-w-[1120px]">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><Link href="/penduduk" className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#718075] transition hover:text-[#1d5145]"><Icon name="arrow-left" size={15}/> Kembali ke daftar</Link><p className="mb-2 font-code text-[10px] text-[#8e9b8d]">PENDATAAN / ENTRY BARU</p><h1 className="font-display text-[42px] leading-[.98] text-[#1c342b] sm:text-[48px]">Tambah data<br className="sm:hidden"/> masyarakat.</h1><p className="mt-3 max-w-[560px] text-[12px] leading-6 text-[#758077]">Isi informasi sesuai dokumen dan kewenangan kantor. Catatan yang baru dibuat akan berstatus draft sampai diperiksa.</p></div>
          <div className="flex items-center gap-2 self-start rounded-full border border-[#d7e2d1] bg-[#edf2e8] px-3 py-2 text-[10px] font-bold text-[#4f7657] sm:self-auto"><Icon name="shield-check" size={14}/> Form internal petugas</div>
        </div>

        {issue && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-[#e8c7b7] bg-[#fff4ef] px-4 py-3.5 text-[#8f4f3a] app-enter"><Icon name="info" size={17} className="mt-0.5 shrink-0"/><div><p className="text-[12px] font-bold">{issue.title}</p><p className="mt-1 text-[11px] leading-5">{issue.body}</p></div></div>}

        <form action={createResident} className="space-y-5">
          <section className="overflow-visible rounded-[16px] border border-[#dfe3d9] bg-[#fffefa] shadow-[0_5px_22px_rgba(27,48,42,.035)]">
            <div className="flex items-start gap-3 border-b border-[#e9ebe4] px-5 py-5 sm:px-7"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#e9eee4] text-[#52775c]"><Icon name="id-card" size={17}/></span><div><p className="font-code text-[9px] text-[#98a397]">01 / IDENTITAS</p><h2 className="mt-1 text-[13px] font-bold text-[#2b4034]">Informasi dasar</h2><p className="mt-1 text-[11px] leading-5 text-[#929b90]">Data utama untuk membuat profil digital internal.</p></div></div>
            <div className="grid gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:px-7 sm:py-6 lg:grid-cols-3">
              <div className="lg:col-span-2"><Field label="Nama lengkap" name="full_name" placeholder="Sesuai dokumen yang dirujuk" required maxLength={160}/></div>
              <Field label="NIK" name="nik" placeholder="16 digit angka" required maxLength={16} hint="Diperiksa formatnya. Gunakan data fiktif selama pengujian."/>
              <SelectField label="Jenis kelamin" name="gender" options={genderOptions} placeholder="Pilih jenis kelamin" required/>
              <Field label="Tempat lahir" name="birth_place" placeholder="Kota / kabupaten" required maxLength={100}/>
              <Field label="Tanggal lahir" name="birth_date" type="date" required/>
              <SelectField label="Golongan darah" name="blood_type" options={bloodOptions} placeholder="Pilih golongan darah"/>
              <SelectField label="Agama" name="religion" options={religionOptions} placeholder="Pilih agama"/>
              <SelectField label="Status perkawinan" name="marital_status" options={maritalOptions} placeholder="Pilih status"/>
              <Field label="Pekerjaan" name="occupation" placeholder="Pekerjaan saat ini" maxLength={100}/>
              <SelectField label="Kewarganegaraan" name="citizenship" options={citizenshipOptions} defaultValue="WNI"/>
            </div>
          </section>

          <section className="overflow-visible rounded-[16px] border border-[#dfe3d9] bg-[#fffefa] shadow-[0_5px_22px_rgba(27,48,42,.035)]">
            <div className="flex items-start gap-3 border-b border-[#e9ebe4] px-5 py-5 sm:px-7"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f3eadb] text-[#996d3b]"><Icon name="map" size={17}/></span><div><p className="font-code text-[9px] text-[#98a397]">02 / DOMISILI</p><h2 className="mt-1 text-[13px] font-bold text-[#2b4034]">Alamat dan wilayah</h2><p className="mt-1 text-[11px] leading-5 text-[#929b90]">Gunakan format alamat yang konsisten agar data mudah disaring.</p></div></div>
            <div className="grid gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:px-7 sm:py-6 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-3"><Field label="Alamat lengkap" name="address" placeholder="Jalan, dusun, kompleks, atau keterangan alamat" required maxLength={300}/></div>
              <Field label="RT" name="rt" placeholder="Contoh: 003" maxLength={10}/>
              <Field label="RW" name="rw" placeholder="Contoh: 002" maxLength={10}/>
              <Field label="Desa / kelurahan" name="village" placeholder="Nama desa atau kelurahan" required maxLength={120}/>
              <Field label="Kecamatan" name="district" placeholder="Nama kecamatan" required maxLength={120}/>
              <Field label="Kabupaten / kota" name="regency" placeholder="Nama kabupaten atau kota" maxLength={120}/>
              <Field label="Provinsi" name="province" placeholder="Nama provinsi" required maxLength={120}/>
            </div>
          </section>

          <section className="overflow-visible rounded-[16px] border border-[#dfe3d9] bg-[#fffefa] shadow-[0_5px_22px_rgba(27,48,42,.035)]">
            <div className="flex items-start gap-3 border-b border-[#e9ebe4] px-5 py-5 sm:px-7"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#e9eceb] text-[#5c7168]"><Icon name="image" size={17}/></span><div><p className="font-code text-[9px] text-[#98a397]">03 / DOKUMENTASI</p><h2 className="mt-1 text-[13px] font-bold text-[#2b4034]">Foto profil <span className="font-normal text-[#99a198]">(opsional)</span></h2><p className="mt-1 text-[11px] leading-5 text-[#929b90]">Foto disimpan pada bucket privat dan hanya tersedia untuk petugas berwenang.</p></div></div>
            <div className="p-5 sm:px-7 sm:py-6"><PhotoPicker/><p className="mt-3 text-[10px] leading-5 text-[#9aa398]">Foto bukan pengganti proses verifikasi identitas. Saat pengujian, gunakan foto contoh yang bukan milik penduduk nyata.</p></div>
          </section>

          <div className="flex flex-col gap-3 rounded-[15px] border border-[#e0e3da] bg-[#eeefe7] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div className="flex items-start gap-2.5"><Icon name="info" size={16} className="mt-0.5 shrink-0 text-[#71816c]"/><p className="max-w-[570px] text-[10px] leading-5 text-[#798579]">Data baru disimpan sebagai <strong className="text-[#536c55]">Draft</strong>. Kartu data internal bukan KTP-el dan tidak menggantikan dokumen resmi. Pastikan kantor memiliki dasar pemrosesan sebelum memakai data nyata.</p></div><div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row"><Link href="/penduduk" className="button-spring inline-flex h-11 items-center justify-center rounded-xl border border-[#d2d9ce] bg-[#fffefa] px-4 text-[11px] font-bold text-[#657368] hover:bg-[#f7f8f2]">Batal</Link><button type="submit" className="button-spring inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1d5145] px-5 text-[11px] font-bold text-white shadow-[0_6px_14px_rgba(29,81,69,.16)] hover:bg-[#17473c]"><Icon name="check" size={15}/> Simpan data</button></div></div>
        </form>
      </div>
    </AppShell>
  );
}
