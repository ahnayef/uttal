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
      minHeight: '100dvh', background: '#07070f',
      padding: '24px',
    }}>
      <div style={{
        textAlign: 'center',
        width: '100%',
        maxWidth: '420px',
      }}>
        <div
          className="glow-pulse"
          style={{
            width: 'clamp(44px, 12vw, 52px)',
            height: 'clamp(44px, 12vw, 52px)',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 18px 50px rgba(124, 58, 237, 0.35)',
          }}
        >
          <svg width="clamp(22px, 6vw, 26px)" height="clamp(22px, 6vw, 26px)" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <div
          style={{
            width: '18px', height: '18px', border: '2px solid #8b5cf6', borderTopColor: 'transparent',
            borderRadius: '50%', margin: '0 auto',
          }}
          className="spinner"
        />
      </div>
    </div>
  );
}
