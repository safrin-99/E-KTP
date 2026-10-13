'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/icons';

export function PhotoPicker() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div>
      <label htmlFor="photo" className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5c8] bg-[#f9faf5] px-5 py-8 text-center transition hover:border-[#8fa58d] hover:bg-[#f4f7ef] sm:flex-row sm:gap-5 sm:text-left">
        {preview ? <img src={preview} alt="Pratinjau foto yang dipilih" className="h-20 w-20 rounded-xl border border-[#dfe5d9] object-cover"/> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8eee2] text-[#51755b] transition group-hover:scale-105"><Icon name="upload" size={18}/></span>}
        <span className="mt-3 min-w-0 sm:mt-0"><span className="block text-[12px] font-bold text-[#3c5444]">{file ? file.name : 'Pilih foto dari perangkat'}</span><span className="mt-1 block text-[10px] text-[#9aa399]">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Klik untuk mengganti` : 'JPG, PNG, atau WebP · Maksimal 5 MB'}</span></span>
        <span className="mt-3 rounded-lg border border-[#dce3d8] bg-white px-3 py-2 text-[10px] font-bold text-[#627568] transition group-hover:border-[#a9baa5] sm:ml-auto sm:mt-0">{file ? 'Ganti foto' : 'Pilih file'}</span>
        <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" ref={inputRef} onChange={(event) => setFile(event.target.files?.[0] ?? null)}/>
      </label>
      {file && <button type="button" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ''; }} className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#96705e] hover:text-[#865139]"><Icon name="x" size={12}/> Hapus pilihan foto</button>}
    </div>
  );
}
