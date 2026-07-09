'use client';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { FaGoogle } from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-main)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="heading-primary" style={{ fontSize: '32px' }}>Welcome to Uttal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>The premium standard for goal tracking.</p>
        </div>
        <div className="luxury-card" style={{ textAlign: 'center', padding: '32px' }}>
          <button
            onClick={() => signIn('google')}
            className="luxury-button-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FaGoogle size={18} /> Sign in with Google
          </button>
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            No password required. Your data will be stored securely.
          </p>
        </div>
      </div>
    </div>
  );
}
