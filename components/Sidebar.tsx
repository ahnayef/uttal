'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import { LuLayoutDashboard, LuLayoutList, LuPlus, LuUser, LuSun, LuMoon } from 'react-icons/lu';
import { useTheme } from '@/components/ThemeProvider';

const NAV = [
  { label: 'Overview', href: '/dashboard', exact: true,  icon: <LuLayoutDashboard size={18} /> },
  { label: 'All Todos', href: '/todos', exact: true,     icon: <LuLayoutList size={18} /> },
  { label: 'New Todo', href: '/todos/new', exact: false, icon: <LuPlus size={18} /> },
  { label: 'Profile',  href: '/dashboard/profile', exact: false, icon: <LuUser size={18} /> },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '36px 28px 24px' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--accent-primary)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            uttal
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 16px' }}>
        {NAV.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '10px 14px',
                marginBottom: '4px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive ? '500' : '500',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.8, display: 'flex' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area: Theme Switcher & User */}
      <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px', borderRadius: '10px',
            border: '1px solid transparent', background: 'transparent',
            cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-secondary)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: '500', letterSpacing: '0.02em' }}>Appearance</span>
          {mounted && (theme === 'dark' ? <LuMoon size={16} /> : <LuSun size={16} />)}
        </button>

        {/* User Card */}
        <Link href="/dashboard/profile" style={{ textDecoration: 'none', display: 'block' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              transition: 'all 0.2s', cursor: 'pointer',
              background: 'var(--bg-surface-elevated)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--accent-primary)', color: 'var(--accent-primary-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '600',
            }}>
              {getInitials(user.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
