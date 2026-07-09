'use client';
import { useState, useRef } from 'react';
import type { TodoItem } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { LuTrash2, LuCheck, LuChevronDown, LuChevronUp, LuCalendar, LuPlus, LuPencil } from 'react-icons/lu';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import LiveCountdown from '@/components/LiveCountdown';

interface Props {
  items: TodoItem[];
  onChange: (items: TodoItem[]) => void;
}

export default function TodoItemList({ items, onChange }: Props) {
  const [newText, setNewText]     = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingDescId, setEditingDescId]   = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggle = (id: string) =>
    onChange(items.map(it => it.id === id ? { ...it, completed: !it.completed } : it));
  const remove = (id: string) => onChange(items.filter(it => it.id !== id));
  const add = () => {
    const t = newText.trim();
    if (!t) return;
    onChange([...items, { id: generateId(), text: t, completed: false, createdAt: new Date().toISOString() }]);
    setNewText('');
  };

  const updateItem = (id: string, updates: Partial<TodoItem>) => {
    onChange(items.map(it => it.id === id ? { ...it, ...updates } : it));
  };

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      toggle(id);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        setExpandedId(prev => {
          if (prev === id) {
            setEditingDescId(null);
            return null;
          }
          return id;
        });
      }, 220);
    }
  };

  return (
    <div>
      {items.length === 0 && (
        <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
          No tasks added
        </div>
      )}

      {items.map((item, idx) => (
        <div key={item.id} style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
          <div
            onClick={(e) => handleRowClick(item.id, e)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '14px 24px',
                flexWrap: 'wrap',
              background: hoveredId === item.id || expandedId === item.id ? 'var(--bg-surface-hover)' : 'transparent',
              transition: 'background 0.2s',
              cursor: 'pointer',
              userSelect: 'none',
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
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editingTitleId === item.id ? (
                <input
                  value={item.text}
                  onChange={e => updateItem(item.id, { text: e.target.value })}
                  onBlur={() => setEditingTitleId(null)}
                  onKeyDown={e => e.key === 'Enter' && setEditingTitleId(null)}
                  onClick={e => e.stopPropagation()}
                  autoFocus
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--text-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%',
                    padding: '2px 0'
                  }}
                />
              ) : (
                <>
                  <span
                    style={{ fontSize: '14px', color: item.completed ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTitleId(item.id);
                    }}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      padding: '4px', display: 'flex', alignItems: 'center',
                      color: 'var(--text-tertiary)', opacity: hoveredId === item.id ? 0.7 : 0,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}
                  >
                    <LuPencil size={12} />
                  </button>
                </>
              )}
            </div>

            {/* Countdown / Deadline Overlay */}
            {!item.completed && (
              <div 
                style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '24px', cursor: 'pointer', marginLeft: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  const input = e.currentTarget.querySelector('input');
                  if (input && 'showPicker' in input) {
                    try { input.showPicker(); } catch {}
                  }
                }}
              >
                {item.deadline ? (
                  <LiveCountdown deadline={item.deadline} />
                ) : (
                  <div style={{ opacity: hoveredId === item.id ? 1 : 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center' }}>
                    <LuCalendar size={14} color="var(--text-tertiary)" />
                  </div>
                )}
                <input
                  type="date"
                  value={item.deadline || ''}
                  onChange={e => updateItem(item.id, { deadline: e.target.value || null })}
                  style={{
                    position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%',
                    pointerEvents: 'none'
                  }}
                  title={item.deadline ? "Edit deadline" : "Add deadline"}
                />
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={() => {
                  setExpandedId(prev => {
                    if (prev === item.id) {
                      setEditingDescId(null);
                      return null;
                    }
                    return item.id;
                  });
                }}
                style={{
                  padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', transition: 'all 0.2s',
                }}
              >
                {expandedId === item.id ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
              </button>
              <button
                type="button"
                onClick={() => remove(item.id)}
                style={{
                  padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: hoveredId === item.id ? 'var(--text-secondary)' : 'transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = hoveredId === item.id ? 'var(--text-secondary)' : 'transparent'; }}
              >
                <LuTrash2 size={15} />
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedId === item.id && (
            <div style={{ padding: '8px 24px 24px 58px', background: 'transparent' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  {editingDescId === item.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <MarkdownEditor 
                          initialValue={item.description || ''} 
                          onChange={val => updateItem(item.id, { description: val })} 
                          minHeight={80} 
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '4px' }}>
                        <button 
                          onClick={() => setEditingDescId(null)}
                          className="luxury-button-secondary"
                          style={{ padding: '4px 12px', fontSize: '12px' }}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setEditingDescId(item.id)} 
                      style={{ cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
                    >
                      {item.description ? (
                         <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                           <MarkdownRenderer content={item.description} />
                         </div>
                      ) : (
                         <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', borderBottom: '1px dashed var(--border-strong)' }}>
                           + Add notes...
                         </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add row */}
      <div style={{
        display: 'flex', 
        gap: '12px',
        padding: '16px 24px',
        background: 'var(--bg-surface-hover)',
        borderTop: items.length > 0 ? '1px solid var(--border-subtle)' : 'none',
        flexWrap: 'wrap',
      }}>
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Write a task title..."
          className="luxury-input"
          style={{
            flex: 1,
            fontSize: '14px',
            padding: '10px 14px',
          }}
        />
        <button
          type="button"
          onClick={add}
          disabled={!newText.trim()}
          className="luxury-button-primary"
          style={{ 
            padding: '0 16px', 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            height: '42px',
            opacity: newText.trim() ? 1 : 0.5,
            cursor: newText.trim() ? 'pointer' : 'not-allowed',
            width: '100%',
            maxWidth: '160px',
          }}
        >
          Add Task <LuPlus size={16} />
        </button>
      </div>
    </div>
  );
}
