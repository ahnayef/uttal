'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, saveUser } from '@/lib/store';
import { generateId, getInitials } from '@/lib/utils';
import type { User } from '@/lib/types';
import { LuArrowRight } from 'react-icons/lu';
import { useTheme } from '@/components/ThemeProvider'; // just to ensure context loads if needed

export default function LoginPage() {
  const router = useRouter();
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (getUser()) router.replace('/dashboard'); }, [router]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim())  e.name  = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const user: User = {
      id: generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      bio: '',
      avatar: '',
      createdAt: new Date().toISOString(),
    };
    saveUser(user);
    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-main)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'var(--accent-primary)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: 'var(--shadow-md)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <h1 className="heading-primary" style={{ fontSize: '32px' }}>
            Welcome to Uttal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>The premium standard for goal tracking.</p>
        </div>

        {/* Card */}
        <div className="luxury-card">
          <form onSubmit={handleSubmit}>
            {[
              { key: 'name',  label: 'Full Name', type: 'text',  value: name,  set: setName,  ph: 'John Doe',     err: errors.name  },
              { key: 'email', label: 'Email',     type: 'email', value: email, set: setEmail, ph: 'john@example.com', err: errors.email },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '24px' }}>
                <label className="section-label">
                  {f.label}
                </label>
                <input
                  autoFocus={f.key === 'name'}
                  type={f.type}
                  value={f.value}
                  placeholder={f.ph}
                  onChange={e => { f.set(e.target.value); setErrors(p => ({ ...p, [f.key]: undefined })); }}
                  className="luxury-input"
                  style={{ borderColor: f.err ? '#ef4444' : undefined }}
                />
                {f.err && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>{f.err}</p>}
              </div>
            ))}

            <button
              type="submit" disabled={loading}
              className="luxury-button-primary"
              style={{ width: '100%', marginTop: '12px', padding: '14px' }}
            >
              {loading ? 'Entering...' : <>Continue <LuArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            No password required. Data is stored securely in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
