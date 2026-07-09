'use client';
import Link from 'next/link';
import type { Todo } from '@/lib/types';
import { getProgress, getDeadlineStatus, formatDeadline } from '@/lib/utils';
import { LuGlobe, LuLock, LuUsers } from 'react-icons/lu';

const VIS_ICON = { 
  public: <LuGlobe size={14} />, 
  private: <LuLock size={14} />, 
  shared: <LuUsers size={14} /> 
};

export default function TodoCard({ todo }: { todo: Todo }) {
  const progress = getProgress(todo.items);
  const dlStatus = getDeadlineStatus(todo.deadline);
  const done     = todo.items.filter(i => i.completed).length;
  const complete = progress === 100 && todo.items.length > 0;

  const dlStyles = {
    none:     { color: 'var(--text-tertiary)', border: 'transparent' },
    safe:     { color: 'var(--text-secondary)', border: 'var(--border-subtle)' },
    warning:  { color: 'var(--text-primary)', border: 'var(--border-strong)' },
    urgent:   { color: 'var(--accent-primary-text)', border: 'transparent', bg: 'var(--accent-primary)' },
    critical: { color: 'var(--accent-primary-text)', border: 'transparent', bg: 'var(--accent-primary)' },
    overdue:  { color: 'var(--accent-primary-text)', border: 'transparent', bg: 'var(--accent-primary)' },
  }[dlStatus];

  return (
    <Link href={`/todos/${todo.id}`} style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
      <article
        className="luxury-card"
        style={{
          width: '100%',
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: '14px',
          position: 'relative', overflow: 'hidden',
          padding: '22px 24px',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
        }}
      >
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.4', margin: 0, flex: 1, letterSpacing: '-0.01em' }}>
            {todo.title}
          </h3>
          <span style={{ color: 'var(--text-tertiary)', display: 'flex', marginTop: '2px' }} title={todo.visibility}>
            {VIS_ICON[todo.visibility]}
          </span>
        </div>

        {/* Description preview */}
        {todo.description && (
          <p style={{
            fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {todo.description.replace(/[#*`>\[\]_~]/g, '').trim()}
          </p>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {todo.items.length === 0 ? 'Empty' : `${done} / ${todo.items.length}`}
            </span>
            <span style={{ fontSize: '12px', fontWeight: complete ? '600' : '400', color: complete ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {progress}%
            </span>
          </div>
          <div style={{ height: '3px', background: 'var(--bg-surface-hover)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: complete ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Deadline + footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', opacity: 0.8 }}>
          {todo.deadline ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '6px',
              border: `1px solid ${dlStyles.border}`,
              background: dlStyles.bg || 'transparent',
              fontSize: '11px', fontWeight: '500', color: dlStyles.color,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {formatDeadline(todo.deadline)}
            </span>
          ) : (
            <span />
          )}
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {new Date(todo.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </article>
    </Link>
  );
}
