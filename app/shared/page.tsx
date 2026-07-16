'use client';
import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Todo } from '@/lib/types';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { LuCheck, LuLock, LuGlobe, LuUsers } from 'react-icons/lu';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getItemProgress } from '@/lib/utils';

function SharedTodoContent() {
  const searchParams = useSearchParams();
  const { todo, error } = useMemo((): { todo: Todo | null; error: string } => {
    const data = searchParams.get('data');
    if (!data) return { todo: null, error: 'Invalid link' };
    try {
      return { todo: JSON.parse(atob(data)) as Todo, error: '' };
    } catch {
      return { todo: null, error: 'Corrupt link data' };
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
              {todo.items.map((item, idx) => {
                const subtasks = item.subtasks ?? [];
                const progress = getItemProgress(item);

                return (
                  <div key={item.id} style={{
                    padding: '16px 24px',
                    borderBottom: idx < todo.items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                        border: `1px solid ${progress === 100 ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                        background: progress === 100 ? 'var(--accent-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {progress === 100 && <LuCheck size={14} color="var(--accent-primary-text)" strokeWidth={3} />}
                      </div>
                      <span style={{
                        flex: 1, fontSize: '14px',
                        color: progress === 100 ? 'var(--text-secondary)' : 'var(--text-primary)',
                        textDecoration: progress === 100 ? 'line-through' : 'none',
                      }}>
                        {item.text}
                      </span>
                      {subtasks.length > 0 && (
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {subtasks.filter(subtask => subtask.completed).length}/{subtasks.length}
                        </span>
                      )}
                    </div>

                    {subtasks.length > 0 && (
                      <div style={{ marginTop: '12px', marginLeft: '34px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ height: '3px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                        </div>
                        {subtasks.map(subtask => (
                          <div key={subtask.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                            <div style={{
                              width: '14px', height: '14px', borderRadius: '4px', flexShrink: 0,
                              border: `1px solid ${subtask.completed ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                              background: subtask.completed ? 'var(--accent-primary)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {subtask.completed && <LuCheck size={10} color="var(--accent-primary-text)" strokeWidth={3} />}
                            </div>
                            <span style={{
                              color: subtask.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                              textDecoration: subtask.completed ? 'line-through' : 'none',
                            }}>
                              {subtask.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
