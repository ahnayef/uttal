'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, saveUser } from '@/lib/store';
import type { User } from '@/lib/types';
import { LuSave, LuLogOut, LuUser } from 'react-icons/lu';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace('/login'); return; }
    setUser(u);
    setName(u.name);
    setEmail(u.email);
    setBio(u.bio || '');
  }, [router]);

  if (!user) return null;

  const handleSave = () => {
    const updated = { ...user, name, email, bio };
    saveUser(updated);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('uttal_user');
    localStorage.removeItem('uttal_todos');
    router.replace('/login');
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '56px' }}>
        <span className="section-label">Account</span>
        <h1 className="heading-primary">
          Profile Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
          Manage your personal information.
        </p>
      </div>

      <div className="luxury-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--accent-primary)', color: 'var(--accent-primary-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <LuUser size={40} />
          </div>
        </div>

        <div>
          <label className="section-label">Full Name</label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            className="luxury-input" placeholder="Your name"
          />
        </div>
        
        <div>
          <label className="section-label">Email</label>
          <input
            value={email} onChange={e => setEmail(e.target.value)}
            className="luxury-input" placeholder="Your email"
          />
        </div>

        <div>
          <label className="section-label">Bio</label>
          <textarea
            value={bio} onChange={e => setBio(e.target.value)}
            className="luxury-input" placeholder="A short bio about yourself..."
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={handleLogout} className="luxury-button-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
            <LuLogOut size={16} /> Logout / Clear Data
          </button>
          
          <button type="button" onClick={handleSave} className="luxury-button-primary">
            {saved ? 'Saved' : 'Save Changes'} <LuSave size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
