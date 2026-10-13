import { createClient } from '@/lib/supabase/server';

function csvEscape(value: string) { return `"${value.replaceAll('"', '""')}"`; }

export async function GET() {
  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (claimsError || !userId) return new Response('Silakan login terlebih dahulu.', { status: 401 });

  const { data: profile } = await supabase.from('user_profiles').select('id, role, is_active').eq('id', userId).maybeSingle();
  if (!profile?.is_active || !['admin', 'operator', 'verifier'].includes(profile.role)) {
    return new Response('Akses ekspor tidak diizinkan.', { status: 403 });
  }

  const { data, error } = await supabase.from('residents').select('record_code, full_name, village, district, regency, province, record_status, created_at').order('created_at', { ascending: false }).limit(5000);
  if (error) return new Response('Laporan belum dapat dibuat. Periksa database dan kebijakan RLS.', { status: 500 });

  const headers = ['Kode data', 'Nama', 'Desa/Kelurahan', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Status', 'Tanggal dibuat'];
  const statusLabels: Record<string, string> = { draft: 'Draft', pending: 'Menunggu pemeriksaan', verified: 'Terverifikasi', archived: 'Diarsipkan' };
  const rows = (data ?? []).map((row) => [row.record_code, row.full_name, row.village ?? '', row.district ?? '', row.regency ?? '', row.province ?? '', statusLabels[row.record_status] ?? row.record_status, new Date(row.created_at).toLocaleDateString('id-ID')].map(csvEscape).join(','));
  const csv = `\uFEFF${[headers.map(csvEscape).join(','), ...rows].join('\r\n')}`;
  const { error: auditError } = await supabase.from('report_exports').insert({ requested_by: userId, report_type: 'residents_csv', filters_summary: 'Kolom non-sensitif; maksimal 5.000 catatan terbaru', record_count: rows.length });
  if (auditError) return new Response('Ekspor dibatalkan karena pencatatan audit gagal.', { status: 500 });

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="laporan-data-masyarakat.csv"',
      'Cache-Control': 'no-store, private',
    },
  });
}
