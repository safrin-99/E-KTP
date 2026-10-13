import Link from 'next/link';
import type { ReactNode } from 'react';
import { logout } from '@/app/logout/actions';
import type { StaffProfile } from '@/lib/auth';
import { Icon } from '@/components/icons';
import { NavLinks } from '@/components/nav-links';

const roleLabels: Record<StaffProfile['role'], string> = {
  admin: 'Administrator', operator: 'Operator', verifier: 'Verifikator', viewer: 'Viewer', auditor: 'Auditor',
};

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'PT';
}

export function AppShell({ profile, children }: { profile: StaffProfile; children: ReactNode }) {
  return (
    <div className="app-canvas text-[#1b302a]">
      <aside className="relative z-30 w-full border-b border-[#e0e3da] bg-[#fbfaf6] px-4 py-4 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[254px] lg:flex-col lg:border-b-0 lg:border-r lg:border-[#e0e3da] lg:px-5 lg:py-6">
        <Link href="/dashboard" className="group flex w-fit items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#7e9e82]">
          <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[#1d5145] text-[#e0e9bf]"><Icon name="id-card" size={21}/></span>
          <span className="block">
            <span className="block text-[14px] font-bold tracking-[-.035em] text-[#1b302a]">DataWarga</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[.17em] text-[#8a9488]">Ruang kerja internal</span>
          </span>
        </Link>

        <div className="mt-8 lg:mt-10"><NavLinks/></div>

        <div className="mt-7 hidden rounded-xl border border-[#e2e5db] bg-[#f5f5ed] p-4 lg:block">
          <div className="flex items-center gap-2 text-[#446d53]"><Icon name="shield-check" size={16}/><span className="text-[11px] font-bold">Privasi dan akses</span></div>
          <p className="mt-2 text-[11px] leading-[1.7] text-[#778177]">Gunakan data sesuai kewenangan. Catatan akses dapat diperiksa melalui audit.</p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e5e6df] pt-4 lg:mt-auto lg:pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dfe8d7] text-[11px] font-bold text-[#345d46]">{initials(profile.full_name)}</span>
            <span className="min-w-0"><span className="block truncate text-[12px] font-bold text-[#24372e]">{profile.full_name}</span><span className="mt-1 block text-[10px] text-[#8a948b]">{roleLabels[profile.role]}</span></span>
          </div>
          <form action={logout}>
            <button aria-label="Keluar dari aplikasi" title="Keluar" className="button-spring flex h-9 w-9 items-center justify-center rounded-[10px] border border-transparent text-[#849087] hover:border-[#ebd9d2] hover:bg-[#fff4ef] hover:text-[#9c533a] focus-visible:ring-2 focus-visible:ring-[#ba8d7a]"><Icon name="logout" size={17}/></button>
          </form>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[254px]">
        <header className="sticky top-0 z-20 hidden h-[62px] items-center justify-between border-b border-[#e0e3da]/90 bg-[#f8f7f1]/92 px-7 backdrop-blur-lg lg:flex xl:px-10">
          <div className="flex items-center gap-2 text-[11px] text-[#9aa39a]"><span className="font-code text-[10px]">DW /</span><span className="text-[#68766b]">Administrasi masyarakat</span></div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-[10px] font-semibold text-[#69816c]"><span className="status-pulse h-1.5 w-1.5 rounded-full bg-[#6c9871]"/> Aplikasi internal</span>
            <span className="h-4 w-px bg-[#dce0d7]"/>
            <span className="font-code text-[10px] text-[#96a096]">2026 / LOCAL</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1580px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9 xl:px-10">{children}</main>
        <footer className="mx-auto flex max-w-[1580px] flex-col gap-1 border-t border-[#e0e3da] px-4 py-5 text-[10px] text-[#939c92] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 xl:px-10">
          <span><span className="font-code">DATAWARGA</span><span className="mx-2 text-[#c0c6bb]">/</span>Sistem pendataan internal</span>
          <span>Data pribadi hanya untuk petugas yang berwenang.</span>
        </footer>
      </div>
    </div>
  );
}
