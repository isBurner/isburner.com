'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '~' },
  { href: '/dashboard/keys', label: 'API Keys', icon: '>' },
  { href: '/dashboard/usage', label: 'Usage', icon: '#' },
  { href: '/dashboard/billing', label: 'Billing', icon: '$' },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-r border-border bg-bg-surface/40 sm:w-64">
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <Link href="/" className="font-mono text-lg font-bold tracking-tight">
          is<span className="text-accent">Burner</span>
        </Link>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
              userButtonPopoverCard: 'border-[#1e1e2a] bg-[#0e0e14]',
              userButtonPopoverActionButton: 'text-[#e2e2ea] hover:bg-[#14141c]',
              userButtonPopoverActionButtonText: 'text-[#e2e2ea]',
              userButtonPopoverFooter: 'hidden',
            },
          }}
        />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-muted hover:bg-bg-elevated/50 hover:text-text'
              }`}
            >
              <span className="w-4 text-center text-xs">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <div className="my-2 border-t border-border" />
        <a
          href="/docs"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm text-text-muted transition-colors hover:bg-bg-elevated/50 hover:text-text"
        >
          <span className="w-4 text-center text-xs">?</span>
          Docs
        </a>
      </nav>
    </aside>
  );
}
