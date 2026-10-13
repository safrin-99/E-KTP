-- Fondasi awal aplikasi pendataan masyarakat untuk SATU kantor.
-- Jalankan pada proyek Supabase baru. Sesuaikan nama kantor sebelum produksi.

create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  office_id uuid not null references public.offices(id) on delete restrict,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  role text not null default 'operator' check (role in ('admin', 'operator', 'verifier', 'viewer', 'auditor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.residents (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete restrict,
  record_code text not null unique default ('RES-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  village text,
  district text,
  regency text,
  province text,
  record_status text not null default 'draft' check (record_status in ('draft', 'pending', 'verified', 'archived')),
  created_by uuid references public.user_profiles(id) on delete set null,
  updated_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

-- Kolom yang lebih sensitif dipisahkan agar tidak ikut dibaca pada daftar umum.
create table if not exists public.resident_private_data (
  resident_id uuid primary key references public.residents(id) on delete cascade,
  nik text unique check (nik is null or nik ~ '^[0-9]{16}$'),
  gender text check (gender is null or gender in ('Laki-laki', 'Perempuan', 'Tidak diketahui')),
  address text,
  rt text check (rt is null or char_length(rt) <= 10),
  rw text check (rw is null or char_length(rw) <= 10),
  occupation text,
  citizenship text check (citizenship is null or citizenship in ('WNI', 'WNA', 'Belum diketahui')),
  birth_place text,
  birth_date date,
  religion text,
  marital_status text check (marital_status is null or marital_status in ('Belum kawin', 'Kawin', 'Cerai hidup', 'Cerai mati', 'Tidak diketahui')),
  blood_type text check (blood_type is null or blood_type in ('A', 'B', 'AB', 'O', 'Tidak diketahui')),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id) on delete set null
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('insert', 'update', 'delete')),
  entity_type text not null check (entity_type in ('residents', 'resident_private_data')),
  entity_id uuid,
  field_names text[] not null default array[]::text[],
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists residents_office_status_idx on public.residents (office_id, record_status);
create index if not exists residents_name_idx on public.residents (lower(full_name));
create index if not exists residents_location_idx on public.residents (village, district);
create index if not exists residents_created_at_idx on public.residents (created_at desc);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_user_id, created_at desc);

-- Kantor placeholder untuk proyek baru; ganti nama/region sebelum penggunaan nyata.
insert into public.offices (name, region)
select 'KANTOR CONTOH - GANTI SEBELUM PRODUKSI', 'Wilayah contoh'
where not exists (select 1 from public.offices);

-- Fungsi pembantu kebijakan RLS. SECURITY DEFINER menghindari rekursi saat
-- kebijakan user_profiles memeriksa peran. search_path dikunci dan objek dischema-qualify.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.user_profiles as p
  where p.id = (select auth.uid())
    and p.is_active = true
  limit 1;
$$;

create or replace function public.current_office_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.office_id
  from public.user_profiles as p
  where p.id = (select auth.uid())
    and p.is_active = true
  limit 1;
$$;

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_user_role() is not null;
$$;

create or replace function public.can_manage_users()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.can_view_residents()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = any (array['admin', 'operator', 'verifier', 'viewer']), false);
$$;

create or replace function public.can_edit_residents()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = any (array['admin', 'operator', 'verifier']), false);
$$;

create or replace function public.can_verify_records()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = any (array['admin', 'verifier']), false);
$$;

create or replace function public.can_access_private_data()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = any (array['admin', 'operator', 'verifier']), false);
$$;

create or replace function public.can_view_audit()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = any (array['admin', 'auditor']), false);
$$;

-- Nilai pemilik/waktu tidak dipercaya dari browser. Office ditetapkan dari profil petugas.
create or replace function public.stamp_resident()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    if public.current_office_id() is null then
      raise exception 'Akun petugas tidak aktif atau belum memiliki kantor';
    end if;
    new.office_id := public.current_office_id();
    if tg_op = 'INSERT' then
      new.created_by := (select auth.uid());
      if new.record_status in ('verified', 'archived') and not public.can_verify_records() then
        raise exception 'Hanya admin/verifikator yang boleh membuat data terverifikasi atau diarsipkan';
      end if;
    elsif old.record_status is distinct from new.record_status and not public.can_verify_records() then
      raise exception 'Hanya admin/verifikator yang boleh mengubah status verifikasi atau arsip';
    end if;
    new.updated_by := (select auth.uid());
  end if;
  new.updated_at := now();
  if new.record_status = 'archived' then
    new.archived_at := coalesce(new.archived_at, now());
  else
    new.archived_at := null;
  end if;
  return new;
end;
$$;

create or replace function public.stamp_private_data()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    if not public.can_access_private_data() then
      raise exception 'Akses data privat tidak diizinkan';
    end if;
    if tg_op = 'UPDATE' and old.resident_id is distinct from new.resident_id then
      raise exception 'Data privat tidak boleh dipindahkan ke catatan lain';
    end if;
    new.updated_by := (select auth.uid());
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- Log aktivitas hanya menyimpan nama kolom yang berubah, bukan nilai NIK/alamat/foto.
create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity_id uuid;
  v_changed_fields text[] := array[]::text[];
begin
  if tg_op = 'DELETE' then
    v_entity_id := coalesce((to_jsonb(old) ->> 'id')::uuid, (to_jsonb(old) ->> 'resident_id')::uuid);
    select coalesce(array_agg(k.key order by k.key), array[]::text[])
      into v_changed_fields
      from jsonb_object_keys(to_jsonb(old)) as k(key)
      where k.key not in ('created_at', 'updated_at', 'created_by', 'updated_by', 'office_id');
    insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, field_names)
      values ((select auth.uid()), 'delete', tg_table_name, v_entity_id, v_changed_fields);
    return old;
  elsif tg_op = 'INSERT' then
    v_entity_id := coalesce((to_jsonb(new) ->> 'id')::uuid, (to_jsonb(new) ->> 'resident_id')::uuid);
    select coalesce(array_agg(k.key order by k.key), array[]::text[])
      into v_changed_fields
      from jsonb_object_keys(to_jsonb(new)) as k(key)
      where k.key not in ('created_at', 'updated_at', 'created_by', 'updated_by', 'office_id');
    insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, field_names)
      values ((select auth.uid()), 'insert', tg_table_name, v_entity_id, v_changed_fields);
    return new;
  else
    v_entity_id := coalesce((to_jsonb(new) ->> 'id')::uuid, (to_jsonb(new) ->> 'resident_id')::uuid);
    select coalesce(array_agg(n.key order by n.key), array[]::text[])
      into v_changed_fields
      from jsonb_each(to_jsonb(new)) as n(key, value)
      where (to_jsonb(old) -> n.key) is distinct from n.value
        and n.key not in ('created_at', 'updated_at', 'created_by', 'updated_by', 'office_id');
    insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, field_names)
      values ((select auth.uid()), 'update', tg_table_name, v_entity_id, v_changed_fields);
    return new;
  end if;
end;
$$;

create trigger residents_stamp_before_write
before insert or update on public.residents
for each row execute function public.stamp_resident();

create trigger private_data_stamp_before_write
before insert or update on public.resident_private_data
for each row execute function public.stamp_private_data();

create trigger residents_audit_after_write
 after insert or update or delete on public.residents
 for each row execute function public.write_audit_log();

create trigger private_data_audit_after_write
 after insert or update or delete on public.resident_private_data
 for each row execute function public.write_audit_log();

-- Selalu aktifkan RLS dan batasi GRANT selain menulis kebijakan.
alter table public.offices enable row level security;
alter table public.user_profiles enable row level security;
alter table public.residents enable row level security;
alter table public.resident_private_data enable row level security;
alter table public.audit_logs enable row level security;

revoke all on table public.offices, public.user_profiles, public.residents,
  public.resident_private_data, public.audit_logs from public, anon, authenticated;

grant usage on schema public to authenticated;
grant select on table public.offices to authenticated;
grant select, insert, update on table public.user_profiles to authenticated;
grant select, insert, update on table public.residents to authenticated;
grant select, insert, update on table public.resident_private_data to authenticated;
grant select on table public.audit_logs to authenticated;

revoke all on function public.current_user_role() from public, anon;
revoke all on function public.current_office_id() from public, anon;
revoke all on function public.is_active_staff() from public, anon;
revoke all on function public.can_manage_users() from public, anon;
revoke all on function public.can_view_residents() from public, anon;
revoke all on function public.can_edit_residents() from public, anon;
revoke all on function public.can_verify_records() from public, anon;
revoke all on function public.can_access_private_data() from public, anon;
revoke all on function public.can_view_audit() from public, anon;
revoke all on function public.stamp_resident() from public, anon, authenticated;
revoke all on function public.stamp_private_data() from public, anon, authenticated;
revoke all on function public.write_audit_log() from public, anon, authenticated;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_office_id() to authenticated;
grant execute on function public.is_active_staff() to authenticated;
grant execute on function public.can_manage_users() to authenticated;
grant execute on function public.can_view_residents() to authenticated;
grant execute on function public.can_edit_residents() to authenticated;
grant execute on function public.can_verify_records() to authenticated;
grant execute on function public.can_access_private_data() to authenticated;
grant execute on function public.can_view_audit() to authenticated;

-- Kantor hanya dapat membaca data miliknya.
create policy "office members can read own office"
on public.offices for select to authenticated
using (id = (select public.current_office_id()));

create policy "staff can read own profile and admin can read office profiles"
on public.user_profiles for select to authenticated
using (
  public.is_active_staff()
  and office_id = (select public.current_office_id())
  and (id = (select auth.uid()) or public.can_manage_users())
);

create policy "admin can create office profiles"
on public.user_profiles for insert to authenticated
with check (
  public.can_manage_users()
  and office_id = (select public.current_office_id())
);

create policy "admin can update office profiles"
on public.user_profiles for update to authenticated
using (
  public.can_manage_users()
  and office_id = (select public.current_office_id())
)
with check (
  public.can_manage_users()
  and office_id = (select public.current_office_id())
);

create policy "permitted staff can view office residents"
on public.residents for select to authenticated
using (
  public.can_view_residents()
  and office_id = (select public.current_office_id())
);

create policy "editors can add office residents"
on public.residents for insert to authenticated
with check (
  public.can_edit_residents()
  and office_id = (select public.current_office_id())
);

create policy "editors can update office residents"
on public.residents for update to authenticated
using (
  public.can_edit_residents()
  and office_id = (select public.current_office_id())
)
with check (
  public.can_edit_residents()
  and office_id = (select public.current_office_id())
);

create policy "permitted staff can read resident private data"
on public.resident_private_data for select to authenticated
using (
  public.can_access_private_data()
  and exists (
    select 1 from public.residents as r
    where r.id = resident_private_data.resident_id
      and r.office_id = (select public.current_office_id())
  )
);

create policy "permitted staff can add resident private data"
on public.resident_private_data for insert to authenticated
with check (
  public.can_access_private_data()
  and exists (
    select 1 from public.residents as r
    where r.id = resident_private_data.resident_id
      and r.office_id = (select public.current_office_id())
  )
);

create policy "permitted staff can update resident private data"
on public.resident_private_data for update to authenticated
using (
  public.can_access_private_data()
  and exists (
    select 1 from public.residents as r
    where r.id = resident_private_data.resident_id
      and r.office_id = (select public.current_office_id())
  )
)
with check (
  public.can_access_private_data()
  and exists (
    select 1 from public.residents as r
    where r.id = resident_private_data.resident_id
      and r.office_id = (select public.current_office_id())
  )
);

create policy "admins and auditors can read audit logs"
on public.audit_logs for select to authenticated
using (public.can_view_audit());

-- Bucket foto harus privat. Path yang disarankan: <resident-uuid>/<random-filename>.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resident-photos', 'resident-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "permitted staff can read resident photos"
on storage.objects for select to authenticated
using (
  bucket_id = 'resident-photos'
  and public.can_access_private_data()
  and exists (
    select 1 from public.residents as r
    where r.id::text = ((storage.foldername(name))[1])
      and r.office_id = (select public.current_office_id())
  )
);

create policy "permitted staff can upload resident photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'resident-photos'
  and public.can_access_private_data()
  and exists (
    select 1 from public.residents as r
    where r.id::text = ((storage.foldername(name))[1])
      and r.office_id = (select public.current_office_id())
  )
);

create policy "permitted staff can replace resident photos"
on storage.objects for update to authenticated
using (
  bucket_id = 'resident-photos'
  and public.can_access_private_data()
  and exists (
    select 1 from public.residents as r
    where r.id::text = ((storage.foldername(name))[1])
      and r.office_id = (select public.current_office_id())
  )
)
with check (
  bucket_id = 'resident-photos'
  and public.can_access_private_data()
  and exists (
    select 1 from public.residents as r
    where r.id::text = ((storage.foldername(name))[1])
      and r.office_id = (select public.current_office_id())
  )
);

-- Tidak ada policy DELETE untuk data utama/foto: gunakan arsip dan proses penghapusan khusus.
