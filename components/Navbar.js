'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Sparkles, Search, Layers, Shield, LogIn, LogOut, User, Clock, Users, GraduationCap, Palette } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const path = usePathname();
  const router = useRouter();

  const link = (href, label, Icon) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        path === href
          ? 'text-primary bg-primary/10'
          : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />} {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/85 border-b border-border/70">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-700 via-rose-700 to-stone-800 flex items-center justify-center text-amber-50 font-serif text-xl shadow-md">ক</span>
          <span className="font-serif text-xl md:text-2xl tracking-tight">
            Threads of the <span className="text-primary">Eight</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {link('/', 'Home', Sparkles)}
          {link('/gallery', 'Gallery', Search)}
          {link('/timeline', 'Timeline', Clock)}
          {link('/artisans', 'Artisans', Users)}
          {link('/contemporary-artisans', 'Contemporary Artisans', Palette)}
          {link('/team', 'Team', GraduationCap)}
          {link('/compare', 'Compare', Layers)}
          {user?.role === 'admin' && link('/admin', 'Admin', Shield)}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-primary-foreground">admin</span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={async () => { await logout(); router.push('/'); }}>
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                <LogIn className="w-4 h-4 mr-1" /> Login
              </Button>
              <Button size="sm" onClick={() => router.push('/register')}>Join</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
