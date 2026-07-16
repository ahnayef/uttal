'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Todo } from '@/lib/types';
import { getProgress, getCompletedItemCount } from '@/lib/utils';
import { LuGlobe, LuLock, LuUsers, LuTrash2, LuRotateCcw } from 'react-icons/lu';

const VIS_ICON = { 
  public: <LuGlobe size={14} />, 
  private: <LuLock size={14} />, 
  shared: <LuUsers size={14} /> 
};

interface Props {
  todo: Todo;
  onDelete?: () => void;
  onRestore?: () => void;
  onHardDelete?: () => void;
  inTrash?: boolean;
}

export default function TodoCard({ todo, onDelete, onRestore, onHardDelete, inTrash = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const [renderedAt] = useState(() => Date.now());
  const progress = getProgress(todo.items);
  const done     = getCompletedItemCount(todo.items);
  const complete = progress === 100 && todo.items.length > 0;

  const cardContent = (
    <article
      className="luxury-card"
      style={{
        width: '100%',
        cursor: inTrash ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column', gap: '14px',
        position: 'relative', overflow: 'hidden',
        padding: '22px 24px',
        height: '100%',
        transform: hovered && !inTrash ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered && !inTrash ? 'var(--shadow-lg)' : 'none',
        transition: 'all 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.4', margin: 0, flex: 1, letterSpacing: '-0.01em' }}>
          {todo.title}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {inTrash ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRestore?.();
                }}
                title="Restore Todo"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', display: 'flex', padding: '4px',
                  borderRadius: '4px', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
              >
                <LuRotateCcw size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onHardDelete?.();
                }}
                title="Delete Permanently"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#ef4444', display: 'flex', padding: '4px',
                  borderRadius: '4px', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <LuTrash2 size={14} />
              </button>
            </div>
          ) : (
            <>
              {hovered && onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                  title="Move to Trash"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)', display: 'flex', padding: '4px',
                    borderRadius: '4px', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
                >
                  <LuTrash2 size={14} />
                </button>
              )}
              <span style={{ color: 'var(--text-tertiary)', display: 'flex', marginTop: '2px' }} title={todo.visibility}>
                {VIS_ICON[todo.visibility]}
              </span>
            </>
          )}
        </div>
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

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', opacity: 0.8 }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {todo.items.length} {todo.items.length === 1 ? 'Task' : 'Tasks'}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {inTrash && todo.deletedAt ? (
            <span style={{ color: '#f59e0b', fontWeight: '500' }}>
              {Math.max(1, 30 - Math.floor((renderedAt - new Date(todo.deletedAt).getTime()) / (24 * 60 * 60 * 1000)))}d left
            </span>
          ) : (
            new Date(todo.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          )}
        </span>
      </div>
    </article>
  );

  if (inTrash) {
    return (
      <div style={{ display: 'block', height: '100%' }}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={`/todos/${todo.id}`} style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
      {cardContent}
    </Link>
  );
}
