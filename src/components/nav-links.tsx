'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/icons';

const links = [
  { href: '/dashboard', label: 'Ringkasan', icon: 'dashboard' as const, group: 'RUANG KERJA' },
  { href: '/penduduk', label: 'Data masyarakat', icon: 'users' as const, group: 'PENDATAAN' },
  { href: '/laporan', label: 'Laporan', icon: 'reports' as const, group: 'PENDATAAN' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="flex gap-1.5 lg:flex-col">
      {links.map((item, index) => {
        const active = pathname === item.href || (item.href === '/penduduk' && pathname.startsWith('/penduduk'));
        const showGroup = index === 0 || item.group !== links[index - 1].group;
        return (
          <div key={item.href} className={showGroup ? 'lg:mt-3 first:lg:mt-0' : ''}>
            {showGroup && <p className="mb-2 hidden px-3 text-[9px] font-bold uppercase tracking-[.18em] text-[#9aa39a] lg:block">{item.group}</p>}
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`nav-link group relative flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[12px] font-semibold ${active ? 'bg-[#e8eee4] text-[#1b5143]' : 'text-[#68766b] hover:bg-[#f0f1eb] hover:text-[#213e32]'}`}
            >
              <Icon name={item.icon} size={17} className={active ? 'text-[#1b5143]' : 'text-[#919d92] group-hover:text-[#52715e]'}/>
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#598565]"/>}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
