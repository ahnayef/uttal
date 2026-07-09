'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Todo } from '@/lib/types';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { LuCheck, LuLock, LuGlobe, LuUsers } from 'react-icons/lu';
import { ThemeProvider } from '@/components/ThemeProvider';

function SharedTodoContent() {
  const searchParams = useSearchParams();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) { setError('Invalid link'); return; }
    try {
      setTodo(JSON.parse(atob(data)));
    } catch {
      setError('Corrupt link data');
    }
  }, [searchParams]);

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: '#ef4444', fontSize: '14px' }}>
        {error}
      </div>
    );
  }

  if (!todo) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} className="spinner" />
      </div>
    );
  }

  const VisIcon = todo.visibility === 'public' ? LuGlobe : todo.visibility === 'shared' ? LuUsers : LuLock;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', padding: '60px 24px' }}>
      <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              {todo.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <VisIcon size={14} />
                <span style={{ textTransform: 'capitalize' }}>Read-only {todo.visibility} view</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Description */}
          {todo.description && (
            <div className="luxury-card">
              <h2 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Details</h2>
              <MarkdownRenderer content={todo.description} />
            </div>
          )}

          {/* Tasks */}
          {todo.items.length > 0 && (
            <div className="luxury-card" style={{ padding: 0, overflow: 'hidden' }}>
              {todo.items.map((item, idx) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 24px',
                  borderBottom: idx < todo.items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                    border: `1px solid ${item.completed ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                    background: item.completed ? 'var(--accent-primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.completed && <LuCheck size={14} color="var(--accent-primary-text)" strokeWidth={3} />}
                  </div>
                  <span style={{
                    flex: 1, fontSize: '14px',
                    color: item.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                    textDecoration: item.completed ? 'line-through' : 'none',
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function SharedPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div style={{ height: '100vh', background: 'var(--bg-main)' }} />}>
        <SharedTodoContent />
      </Suspense>
    </ThemeProvider>
  );
}
