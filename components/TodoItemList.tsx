'use client';
import { useState } from 'react';
import type { TodoItem } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { LuTrash2, LuCheck } from 'react-icons/lu';

interface Props {
  items: TodoItem[];
  onChange: (items: TodoItem[]) => void;
}

export default function TodoItemList({ items, onChange }: Props) {
  const [newText, setNewText]     = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggle = (id: string) =>
    onChange(items.map(it => it.id === id ? { ...it, completed: !it.completed } : it));
  const remove = (id: string) => onChange(items.filter(it => it.id !== id));
  const add = () => {
    const t = newText.trim();
    if (!t) return;
    onChange([...items, { id: generateId(), text: t, completed: false, createdAt: new Date().toISOString() }]);
    setNewText('');
  };

  return (
    <div>
      {items.length === 0 && (
        <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
          No tasks added
        </div>
      )}

      {items.map((item, idx) => (
        <div
          key={item.id}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '14px 24px',
            borderBottom: idx < items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            background: hoveredId === item.id ? 'var(--bg-surface-hover)' : 'transparent',
            transition: 'background 0.2s',
          }}
        >
          {/* Checkbox */}
          <button
            type="button"
            onClick={() => toggle(item.id)}
            style={{
              width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
              border: `1px solid ${item.completed ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
              background: item.completed ? 'var(--accent-primary)' : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, transition: 'all 0.2s',
            }}
          >
            {item.completed && <LuCheck size={14} color="var(--accent-primary-text)" strokeWidth={3} />}
          </button>

          {/* Text */}
          <span
            onClick={() => toggle(item.id)}
            style={{ cursor: 'pointer', flex: 1, fontSize: '14px', color: item.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none', transition: 'all 0.2s' }}>
            {item.text}
          </span>

          {/* Delete */}
          <button
            type="button"
            onClick={() => remove(item.id)}
            style={{
              padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: hoveredId === item.id ? 'var(--text-secondary)' : 'transparent',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = hoveredId === item.id ? 'var(--text-secondary)' : 'transparent';
            }}
          >
            <LuTrash2 size={15} />
          </button>
        </div>
      ))}

      {/* Add row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '14px 24px',
        borderTop: items.length > 0 ? '1px solid var(--border-subtle)' : 'none',
      }}>
        <div style={{
          width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
          border: '1px dashed var(--border-strong)',
        }} />
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a new task..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: '14px',
          }}
        />
        {newText.trim() && (
          <button
            type="button"
            onClick={add}
            className="luxury-button-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
