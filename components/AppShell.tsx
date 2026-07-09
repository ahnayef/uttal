'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import type { User } from '@/lib/types';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace('/login'); return; }
    setUser(u);
    setReady(true);
  }, [router]);

  if (!ready || !user) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-main)',
      }}>
        <div style={{
          width: '24px', height: '24px',
          border: '2px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
        }} className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Sidebar user={user} />
      <main style={{
        flex: 1,
        marginLeft: '260px', /* Increased sidebar width slightly for luxury feel */
        minHeight: '100vh',
        padding: '56px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', /* Center horizontally */
      }}>
        <div style={{
          width: '100%',
          maxWidth: '860px', /* Constrain width and center */
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}
