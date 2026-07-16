'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import type { User } from '@/lib/types';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user] = useState<User | null>(() => getUser());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [router, user]);

  if (!user) {
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
    <div style={{ display: 'flex', background: 'var(--bg-main)', minHeight: '100dvh', color: 'var(--text-primary)' }}>
      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            border: 'none',
            background: 'rgba(0, 0, 0, 0.32)',
            zIndex: 90,
          }}
        />
      )}
      <main style={{
        flex: 1,
        marginLeft: '260px', /* Increased sidebar width slightly for luxury feel */
        minHeight: '100dvh',
        padding: '56px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', /* Center horizontally */
      }} className="dashboard-main">
        <div style={{ width: '100%', maxWidth: '860px', marginBottom: '20px' }} className="dashboard-mobile-header">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="luxury-button-secondary"
            style={{ padding: '8px 14px' }}
          >
            Menu
          </button>
        </div>
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
