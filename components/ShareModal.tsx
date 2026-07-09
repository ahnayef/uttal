'use client';
import { useState, useEffect } from 'react';
import type { Todo, Visibility } from '@/lib/types';
import { generateShareUrl } from '@/lib/utils';
import { LuGlobe, LuLock, LuUsers, LuX, LuCopy, LuCheck } from 'react-icons/lu';

interface Props { todo: Todo; onUpdate: (u: Partial<Todo>) => void; onClose: () => void; }

const OPTS = [
  { value: 'private', icon: <LuLock size={18} />, label: 'Private',  desc: 'Only you can see this' },
  { value: 'public',  icon: <LuGlobe size={18} />, label: 'Public',   desc: 'Anyone with the link can view' },
  { value: 'shared',  icon: <LuUsers size={18} />, label: 'Shared',   desc: 'Specific people only' },
] as const;

export default function ShareModal({ todo, onUpdate, onClose }: Props) {
  const [shareUrl, setShareUrl]     = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [copied, setCopied]         = useState(false);

  useEffect(() => { setShareUrl(generateShareUrl(todo)); }, [todo]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addEmail = () => {
    const e = emailInput.trim().toLowerCase();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || todo.sharedWith.includes(e)) return;
    onUpdate({ sharedWith: [...todo.sharedWith, e], visibility: 'shared' });
    setEmailInput('');
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', backdropFilter: 'blur(12px)', zIndex: 1000, transition: 'background 0.3s' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '460px', maxWidth: '92vw',
        background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
        borderRadius: '16px', zIndex: 1001, overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Share Access</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Manage who can view this item</div>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '8px',
            border: 'none', background: 'transparent',
            color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s, color 0.2s'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}>
            <LuX size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Visibility */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Visibility</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {OPTS.map(opt => (
                <button key={opt.value} type="button" onClick={() => onUpdate({ visibility: opt.value })} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '14px 16px', borderRadius: '12px', width: '100%',
                  border: `1px solid ${todo.visibility === opt.value ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  background: todo.visibility === opt.value ? 'var(--bg-surface-hover)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}>
                  <div style={{ color: todo.visibility === opt.value ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{opt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: todo.visibility === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                  {todo.visibility === opt.value && <LuCheck size={18} color="var(--accent-primary)" />}
                </button>
              ))}
            </div>
          </div>

          {/* Share link */}
          {todo.visibility !== 'private' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Link</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input readOnly value={shareUrl} className="luxury-input" style={{ fontFamily: '"Geist Mono", monospace', fontSize: '12px', color: 'var(--text-secondary)' }} />
                <button type="button" onClick={handleCopy} className="luxury-button-secondary" style={{ padding: '0 16px', color: copied ? '#4ade80' : 'var(--text-primary)', borderColor: copied ? '#4ade80' : 'var(--border-strong)' }}>
                  {copied ? <LuCheck size={16} /> : <LuCopy size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Email list */}
          {todo.visibility === 'shared' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Access List</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="email" value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addEmail()}
                  placeholder="name@company.com" className="luxury-input"
                />
                <button type="button" onClick={addEmail} className="luxury-button-primary">Add</button>
              </div>
              
              {todo.sharedWith.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontStyle: 'italic', margin: 0 }}>No viewers added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {todo.sharedWith.map(email => (
                    <div key={email} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: '8px',
                      background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: 'var(--accent-primary-text)' }}>
                          {email[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{email}</span>
                      </div>
                      <button type="button" onClick={() => onUpdate({ sharedWith: todo.sharedWith.filter(x => x !== email) })} style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', borderRadius: '4px', transition: 'color 0.2s'
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
                      >
                        <LuX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
