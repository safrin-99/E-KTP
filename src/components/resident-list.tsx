'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CustomSelect } from '@/components/custom-select';
import { Icon } from '@/components/icons';

type ResidentRow = {
  id: string;
  record_code: string;
  full_name: string;
  village: string | null;
  district: string | null;
  record_status: string;
  created_at: string;
};

type StatusFilter = 'all' | 'draft' | 'pending' | 'verified' | 'archived';
const statusLabels: Record<string, string> = { draft: 'Draft', pending: 'Menunggu pemeriksaan', verified: 'Terverifikasi', archived: 'Diarsipkan' };
const statusClasses: Record<string, string> = {
  draft: 'bg-[#f8f0df] text-[#966a29] border-[#e9d7b1]',
  pending: 'bg-[#eef0dd] text-[#6a743c] border-[#d9dfb4]',
  verified: 'bg-[#e6efe4] text-[#2e6948] border-[#c5ddc5]',
  archived: 'bg-[#f0f0e9] text-[#778078] border-[#dfe1d9]',
};
const statusOptions = [
  { label: 'Semua status', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Menunggu pemeriksaan', value: 'pending' },
  { label: 'Terverifikasi', value: 'verified' },
  { label: 'Diarsipkan', value: 'archived' },
];

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || '—';
}
function formatDate(value: string) {
  try { return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)); }
  catch { return '—'; }
}
function csvEscape(value: string) { return `"${value.replaceAll('"', '""')}"`; }

export function ResidentList({ residents, loadError, totalCount, canExport }: { residents: ResidentRow[]; loadError: boolean; totalCount: number; canExport: boolean }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const filteredResidents = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('id-ID');
    return residents.filter((resident) => {
      const matchesQuery = !needle || [resident.record_code, resident.full_name, resident.village ?? '', resident.district ?? ''].some((value) => value.toLocaleLowerCase('id-ID').includes(needle));
      return matchesQuery && (status === 'all' || resident.record_status === status);
    });
  }, [residents, query, status]);

  function exportCsv() {
    const headers = ['Kode data', 'Nama', 'Desa/Kelurahan', 'Kecamatan', 'Status', 'Tanggal dibuat'];
    const rows = filteredResidents.map((item) => [item.record_code, item.full_name, item.village ?? '', item.district ?? '', statusLabels[item.record_status] ?? item.record_status, formatDate(item.created_at)].map(csvEscape).join(','));
    const content = `\uFEFF${[headers.map(csvEscape).join(','), ...rows].join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'data-masyarakat.csv'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  const counts = {
    draft: residents.filter((resident) => resident.record_status === 'draft').length,
    pending: residents.filter((resident) => resident.record_status === 'pending').length,
    verified: residents.filter((resident) => resident.record_status === 'verified').length,
  };
  const stats = [
    { label: 'Data aktif', value: totalCount, description: 'Seluruh catatan non-arsip', key: 'all', marker: 'bg-[#325f4c]' },
    { label: 'Draft', value: counts.draft, description: 'Masih perlu dilengkapi', key: 'draft', marker: 'bg-[#c3984e]' },
    { label: 'Pemeriksaan', value: counts.pending, description: 'Menunggu verifikasi', key: 'pending', marker: 'bg-[#969a58]' },
    { label: 'Terverifikasi', value: counts.verified, description: 'Sudah diperiksa', key: 'verified', marker: 'bg-[#4c805a]' },
  ];

  return (
    <div className="app-enter space-y-5">
      <section className="stagger-in grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.key} className="surface-lift rounded-[15px] border border-[#e0e3da] bg-[#fffefa] p-5">
            <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-semibold text-[#7d887e]">{stat.label}</p><span className={`h-2 w-2 rounded-full ${stat.marker}`}/></div>
            <p className="mt-4 font-display text-[41px] leading-none text-[#1c352b]">{new Intl.NumberFormat('id-ID').format(stat.value)}</p>
            <p className="mt-3 text-[10px] text-[#9aa197]">{stat.description}</p>
          </article>
        ))}
      </section>

      <section className="overflow-visible rounded-[16px] border border-[#dfe3d9] bg-[#fffefa] shadow-[0_5px_22px_rgba(27,48,42,.035)]">
        <div className="border-b border-[#e9ebe4] p-5 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div><div className="flex items-center gap-2"><span className="font-code text-[10px] text-[#9ba398]">01 /</span><h2 className="text-[13px] font-bold text-[#26392f]">Daftar masyarakat</h2></div><p className="mt-1.5 text-[11px] text-[#8a948b]">Data yang dapat diakses sesuai kewenangan akun.</p></div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <label className="field-shell flex h-11 min-w-0 items-center gap-2.5 rounded-xl border border-[#dce1d8] bg-[#fcfcf8] px-3.5 sm:w-[270px]">
                <Icon name="search" size={16} className="shrink-0 text-[#9aa49a]"/>
                <span className="sr-only">Cari data</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nama, kode, atau wilayah" className="min-w-0 flex-1 bg-transparent text-[12px] text-[#243c34] outline-none placeholder:text-[#a0a99f]"/>
                {query && <button type="button" onClick={() => setQuery('')} aria-label="Hapus pencarian" className="text-[#909c91] hover:text-[#324e3c]"><Icon name="x" size={14}/></button>}
              </label>
              <div className="w-full sm:w-[205px]"><CustomSelect value={status} onChange={(value) => setStatus(value as StatusFilter)} options={statusOptions} ariaLabel="Filter status" buttonClassName="!min-h-11 !rounded-xl !text-[12px]"/></div>
              {canExport && <button type="button" onClick={exportCsv} disabled={!filteredResidents.length} className="button-spring inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d8ded4] bg-white px-4 text-[11px] font-bold text-[#52665a] hover:border-[#9caf9a] hover:bg-[#f5f7f0] disabled:cursor-not-allowed disabled:opacity-40"><Icon name="download" size={15}/> Ekspor CSV</button>}
            </div>
          </div>
        </div>

        {loadError ? (
          <div role="alert" className="m-5 rounded-xl border border-[#e9c7b9] bg-[#fff4ef] p-5 text-[12px] text-[#8f4f3a]"><p className="font-bold">Data belum dapat dimuat</p><p className="mt-1 leading-5">Periksa koneksi Supabase, profil petugas, migrasi database, serta kebijakan RLS.</p></div>
        ) : filteredResidents.length === 0 ? (
          <div className="px-6 py-16 text-center app-enter"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf0e7] text-[#66806b]"><Icon name="search" size={20}/></span><p className="mt-4 text-[13px] font-bold text-[#26392f]">Tidak ada data yang cocok</p><p className="mt-1 text-[11px] text-[#919b91]">Coba kata kunci atau status yang berbeda.</p><button onClick={() => { setQuery(''); setStatus('all'); }} className="mt-4 text-[11px] font-bold text-[#38694e] hover:underline">Reset pencarian</button></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead><tr className="bg-[#f8f8f2] text-[9px] font-bold uppercase tracking-[.16em] text-[#899388]"><th className="px-6 py-3.5">Nama / kode</th><th className="px-5 py-3.5">Wilayah</th><th className="px-5 py-3.5">Tanggal masuk</th><th className="px-5 py-3.5">Status</th><th className="px-6 py-3.5 text-right">Referensi</th></tr></thead>
                <tbody className="divide-y divide-[#eef0e9]">
                  {filteredResidents.map((resident, index) => (
                    <tr key={resident.id} className="group animate-row transition-colors hover:bg-[#f7f8f1]" style={{ animationDelay: `${Math.min(index, 8) * 28}ms` }}>
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dfe6d7] bg-[#edf1e7] text-[11px] font-bold text-[#46694f]">{getInitials(resident.full_name)}</span><span><Link href={`/penduduk/${resident.id}`} className="block text-[12px] font-bold text-[#2a3d32] hover:text-[#376c4b] hover:underline">{resident.full_name}</Link><span className="mt-1 block font-code text-[10px] text-[#98a197]">{resident.record_code}</span></span></div></td>
                      <td className="px-5 py-4"><span className="flex items-start gap-2 text-[11px] text-[#46564b]"><Icon name="map-pin" size={14} className="mt-0.5 shrink-0 text-[#9aa49a]"/><span>{resident.village || 'Wilayah belum diisi'}<span className="mt-1 block text-[10px] text-[#9aa49a]">{resident.district || 'Kecamatan belum diisi'}</span></span></span></td>
                      <td className="px-5 py-4 text-[11px] text-[#6f7b71]">{formatDate(resident.created_at)}</td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${statusClasses[resident.record_status] ?? statusClasses.archived}`}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-70"/>{statusLabels[resident.record_status] ?? resident.record_status}</span></td>
                      <td className="px-6 py-4 text-right"><code className="font-code text-[10px] text-[#8e998f]">{resident.record_code}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-2 border-t border-[#e8ebe3] bg-[#fbfbf7] px-6 py-3.5 text-[10px] text-[#939c92] sm:flex-row sm:items-center sm:justify-between"><p>Menampilkan <strong className="text-[#516256]">{filteredResidents.length}</strong> dari <strong className="text-[#516256]">{residents.length}</strong> catatan yang dimuat.</p><p className="inline-flex items-center gap-1.5"><Icon name="shield-check" size={13} className="text-[#688669]"/> NIK dan data privat tidak ditampilkan di daftar.</p></div>
          </>
        )}
      </section>
    </div>
  );
}
