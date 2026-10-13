'use client';

import { Icon } from '@/components/icons';

export function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="no-print button-spring inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1d5145] px-4 text-[11px] font-bold text-white hover:bg-[#17473c]"><Icon name="file-check" size={15}/> Cetak / simpan PDF</button>;
}
