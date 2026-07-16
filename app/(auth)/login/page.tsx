'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';
import { Logo } from '@/components/Icons';

const supabase = createClient();

export default function LoginPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        router.replace('/dashboard');
      } else {
        setCheckingSession(false);
      }
    };

    void checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/dashboard');
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div className="animate-pulse" style={{ color: 'var(--text-primary)' }}>
          <Logo width={48} height={48} />
        </div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

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
            onClick={() => {
              void handleGoogleLogin();
            }}
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
