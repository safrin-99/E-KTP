'use client';

import { useState } from 'react';
import { login } from '@/app/login/actions';
import { Icon } from '@/components/icons';

export function LoginForm({ message }: { message: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="app-enter w-full max-w-[400px]">
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#1d5145] text-[#e6edcd]"><Icon name="id-card" size={21}/></div>
        <div>
          <p className="text-[15px] font-bold tracking-[-.03em] text-[#1c302a]">DataWarga</p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.19em] text-[#77847a]">Ruang kerja internal</p>
        </div>
      </div>

      <div className="mb-8">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.19em] text-[#52745f]"><span className="h-px w-6 bg-[#8da58c]"/> Akses petugas</p>
        <h2 className="font-display text-[42px] leading-[.98] text-[#1b302a] sm:text-[48px]">Masuk ke<br/>ruang kerja.</h2>
        <p className="mt-4 max-w-[350px] text-[13px] leading-6 text-[#758078]">Gunakan akun kantor yang telah didaftarkan administrator. Akses hanya tersedia untuk petugas yang aktif.</p>
      </div>

      {message && <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-[#e4c7a7] bg-[#fff4e7] p-3.5 text-[12px] leading-5 text-[#7b4b24] app-enter"><Icon name="info" size={17} className="mt-0.5 shrink-0"/><span>{message}</span></div>}

      <form action={login} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-[11px] font-bold uppercase tracking-[.11em] text-[#536159]">Email kantor</label>
          <div className="field-shell flex h-[50px] items-center gap-3 rounded-xl border border-[#dce1d8] bg-white px-3.5">
            <Icon name="mail" size={17} className="shrink-0 text-[#91a095]"/>
            <input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@kantor.id" className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#243c34] outline-none placeholder:text-[#a4aca5]" />
            {email.includes('@') && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e9f1e7] text-[#437354]"><Icon name="check" size={12}/></span>}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-[.11em] text-[#536159]">Kata sandi</label>
            <span className="text-[10px] text-[#9aa39c]">Rahasia akun kamu</span>
          </div>
          <div className="field-shell flex h-[50px] items-center gap-3 rounded-xl border border-[#dce1d8] bg-white px-3.5">
            <Icon name="lock-keyhole" size={17} className="shrink-0 text-[#91a095]"/>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required placeholder="Masukkan kata sandi" className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#243c34] outline-none placeholder:text-[#a4aca5]" />
            <button type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={showPassword} onClick={() => setShowPassword((state) => !state)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#7c8b81] transition hover:bg-[#f1f3ed] hover:text-[#1d5145] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#91b59c]">
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={17}/>
            </button>
          </div>
        </div>

        <button type="submit" className="button-spring group relative flex h-[51px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#1d5145] px-5 text-[13px] font-semibold text-white shadow-[0_7px_16px_rgba(29,81,69,.16)] hover:bg-[#17473c] hover:shadow-[0_10px_22px_rgba(29,81,69,.2)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d9e6d4]">
          <span>Masuk ke dashboard</span><Icon name="arrow-up-right" size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
        </button>
      </form>

      <div className="mt-6 flex items-start gap-3 border-t border-[#e3e5de] pt-5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e9eee5] text-[#54725d]"><Icon name="shield-check" size={15}/></span>
        <p className="text-[11px] leading-[1.7] text-[#879189]">Ruang kerja ini hanya untuk petugas terdaftar. Selama pengujian, gunakan data fiktif dan jangan masukkan dokumen pribadi masyarakat.</p>
      </div>
      <p className="mt-7 flex items-center justify-center gap-2 text-[10px] text-[#9aa39c]"><span className="h-1.5 w-1.5 rounded-full bg-[#7f9d70]"/> Sistem internal · Akses tercatat</p>
    </div>
  );
}
