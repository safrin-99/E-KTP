'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}
function nullable(value: string) { return value ? value : null; }

export async function createResident(formData: FormData) {
  const fullName = field(formData, 'full_name');
  const nik = field(formData, 'nik').replace(/\s+/g, '');
  const gender = field(formData, 'gender');
  const birthPlace = field(formData, 'birth_place');
  const birthDate = field(formData, 'birth_date');
  const address = field(formData, 'address');
  const rt = field(formData, 'rt');
  const rw = field(formData, 'rw');
  const village = field(formData, 'village');
  const district = field(formData, 'district');
  const regency = field(formData, 'regency');
  const province = field(formData, 'province');
  const religion = field(formData, 'religion');
  const maritalStatus = field(formData, 'marital_status');
  const occupation = field(formData, 'occupation');
  const citizenship = field(formData, 'citizenship');
  const bloodType = field(formData, 'blood_type');

  if (!fullName || fullName.length < 2 || !/^\d{16}$/.test(nik) || !gender || !birthPlace || !birthDate || !address || !village || !district || !province) {
    redirect('/penduduk/tambah?error=required');
  }
  if (new Date(`${birthDate}T00:00:00Z`).getTime() > Date.now()) {
    redirect('/penduduk/tambah?error=birth-date');
  }

  const photoEntry = formData.get('photo');
  const photo = photoEntry instanceof File && photoEntry.size > 0 ? photoEntry : null;
  if (photo && (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) || photo.size > 5 * 1024 * 1024)) {
    redirect('/penduduk/tambah?error=photo');
  }

  const { supabase, profile } = await requireStaff();
  if (!['admin', 'operator', 'verifier'].includes(profile.role)) redirect('/penduduk/tambah?error=forbidden');

  const { data: residentId, error } = await supabase.rpc('create_resident_record', {
    p_full_name: fullName,
    p_nik: nik,
    p_gender: gender,
    p_birth_place: birthPlace,
    p_birth_date: birthDate,
    p_address: address,
    p_rt: nullable(rt),
    p_rw: nullable(rw),
    p_village: village,
    p_district: district,
    p_regency: nullable(regency),
    p_province: province,
    p_religion: nullable(religion),
    p_marital_status: nullable(maritalStatus),
    p_occupation: nullable(occupation),
    p_citizenship: nullable(citizenship) ?? 'WNI',
    p_blood_type: nullable(bloodType),
  });

  if (error || !residentId) {
    const errorText = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase();
    if (errorText.includes('nik') || error?.code === '23505') redirect('/penduduk/tambah?error=duplicate-nik');
    if (errorText.includes('izin') || errorText.includes('permission') || error?.code === '42501') redirect('/penduduk/tambah?error=forbidden');
    redirect('/penduduk/tambah?error=save');
  }

  let photoProblem = false;
  if (photo) {
    const extension = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${residentId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('resident-photos').upload(path, new Uint8Array(await photo.arrayBuffer()), {
      contentType: photo.type,
      upsert: false,
    });
    if (uploadError) {
      photoProblem = true;
    } else {
      const { error: updateError } = await supabase.from('resident_private_data').update({ photo_path: path }).eq('resident_id', residentId);
      if (updateError) {
        await supabase.storage.from('resident-photos').remove([path]);
        photoProblem = true;
      }
    }
  }

  revalidatePath('/penduduk');
  revalidatePath('/dashboard');
  redirect(photoProblem ? '/penduduk?created=1&photo=error' : '/penduduk?created=1');
}
