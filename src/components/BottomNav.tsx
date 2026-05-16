'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Globe, Map } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/onboarding', label: 'Home', icon: Home },
  { href: '/studio', label: 'Avatar', icon: Sparkles },
  { href: '/worlds', label: 'Build', icon: Globe },
  { href: '/quests', label: 'Quests', icon: Map },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? 'is-active' : ''}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
