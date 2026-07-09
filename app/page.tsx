'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/store';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getUser() ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#07070f',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div
          className="glow-pulse"
          style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <div style={{ width: '18px', height: '18px', border: '2px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }} className="spinner" />
      </div>
    </div>
  );
}
