'use client';
import { useState, useRef } from 'react';
import type { TodoItem } from '@/lib/types';
import { generateId, getItemProgress, isItemComplete } from '@/lib/utils';
import { LuTrash2, LuCheck, LuChevronDown, LuChevronUp, LuCalendar, LuPlus, LuPencil, LuFileText, LuX } from 'react-icons/lu';
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
  const [activeTab, setActiveTab] = useState<'subtasks' | 'notes'>('subtasks');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [hoveredSubtaskId, setHoveredSubtaskId] = useState<string | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState<Record<string, string>>({});
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggle = (id: string) =>
    onChange(items.map(it => {
      if (it.id !== id) return it;
      const subtasks = it.subtasks ?? [];
      const completed = !isItemComplete(it);
      if (subtasks.length === 0) return { ...it, completed };
      return {
        ...it,
        completed,
        subtasks: subtasks.map(subtask => ({ ...subtask, completed })),
      };
    }));
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

  const addSubtask = (itemId: string) => {
    const text = (newSubtaskText[itemId] ?? '').trim();
    if (!text) return;

    onChange(items.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        completed: false,
        subtasks: [
          ...(item.subtasks ?? []),
          { id: generateId(), text, completed: false, createdAt: new Date().toISOString() },
        ],
      };
    }));
    setNewSubtaskText(prev => ({ ...prev, [itemId]: '' }));
  };

  const toggleSubtask = (itemId: string, subtaskId: string) => {
    onChange(items.map(item => {
      if (item.id !== itemId) return item;
      const subtasks = (item.subtasks ?? []).map(subtask =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      );
      return { ...item, completed: subtasks.length > 0 && subtasks.every(subtask => subtask.completed), subtasks };
    }));
  };

  const removeSubtask = (itemId: string, subtaskId: string) => {
    onChange(items.map(item => {
      if (item.id !== itemId) return item;
      const subtasks = (item.subtasks ?? []).filter(subtask => subtask.id !== subtaskId);
      return {
        ...item,
        completed: subtasks.length > 0 ? subtasks.every(subtask => subtask.completed) : item.completed,
        subtasks,
      };
    }));
  };

  const updateSubtask = (itemId: string, subtaskId: string, text: string) => {
    onChange(items.map(item => {
      if (item.id !== itemId) return item;
      const subtasks = (item.subtasks ?? []).map(subtask =>
        subtask.id === subtaskId ? { ...subtask, text } : subtask
      );
      return { ...item, subtasks };
    }));
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

      {items.map((item, idx) => {
        const subtasks = item.subtasks ?? [];
        const progress = getItemProgress(item);

        return (
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
                border: `1px solid ${progress === 100 ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                background: progress === 100 ? 'var(--accent-primary)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, transition: 'all 0.2s',
              }}
            >
              {progress === 100 && <LuCheck size={14} color="var(--accent-primary-text)" strokeWidth={3} />}
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
                    style={{ fontSize: '14px', color: progress === 100 ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: progress === 100 ? 'line-through' : 'none', transition: 'all 0.2s' }}>
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

            {subtasks.length > 0 && (
              <div
                title={`${subtasks.filter(subtask => subtask.completed).length} of ${subtasks.length} subtasks complete`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '118px',
                  color: 'var(--text-tertiary)',
                  fontSize: '12px',
                }}
              >
                <span style={{ whiteSpace: 'nowrap' }}>
                  {subtasks.filter(subtask => subtask.completed).length}/{subtasks.length}
                </span>
                <div style={{ width: '64px', height: '3px', borderRadius: '2px', background: 'var(--border-subtle)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: progress === 100 ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Countdown / Deadline Overlay */}
            {progress !== 100 && (
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
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('subtasks')}
                    style={{
                      background: 'none', border: 'none', padding: '0 0 8px 0', fontSize: '12px', fontWeight: '600',
                      color: activeTab === 'subtasks' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      borderBottom: activeTab === 'subtasks' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.04em',
                      marginBottom: '-1px'
                    }}
                  >
                    Subtasks {subtasks.length > 0 && <span style={{ color: 'var(--text-tertiary)', marginLeft: '4px', fontWeight: 'normal' }}>({subtasks.filter(s => s.completed).length}/{subtasks.length})</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('notes')}
                    style={{
                      background: 'none', border: 'none', padding: '0 0 8px 0', fontSize: '12px', fontWeight: '600',
                      color: activeTab === 'notes' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      borderBottom: activeTab === 'notes' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.04em',
                      display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '-1px'
                    }}
                  >
                    Notes {item.description && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />}
                  </button>
                </div>

                {activeTab === 'subtasks' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                  {subtasks.length > 0 && (
                    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
                      {subtasks.map((subtask, subtaskIdx) => (
                        <div
                          key={subtask.id}
                          onClick={() => toggleSubtask(item.id, subtask.id)}
                          onMouseEnter={() => setHoveredSubtaskId(subtask.id)}
                          onMouseLeave={() => setHoveredSubtaskId(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderBottom: subtaskIdx < subtasks.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            background: hoveredSubtaskId === subtask.id ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubtask(item.id, subtask.id);
                            }}
                            style={{
                              width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                              border: `1px solid ${subtask.completed ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                              background: subtask.completed ? 'var(--accent-primary)' : 'transparent',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: 0, transition: 'all 0.2s',
                            }}
                          >
                            {subtask.completed && <LuCheck size={12} color="var(--accent-primary-text)" strokeWidth={3} />}
                          </button>
                          
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {editingSubtaskId === subtask.id ? (
                              <input
                                value={subtask.text}
                                onChange={e => updateSubtask(item.id, subtask.id, e.target.value)}
                                onBlur={() => setEditingSubtaskId(null)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') setEditingSubtaskId(null);
                                }}
                                onClick={e => e.stopPropagation()}
                                autoFocus
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  borderBottom: '1px solid var(--text-primary)',
                                  color: 'var(--text-primary)',
                                  fontSize: '13px',
                                  outline: 'none',
                                  width: '100%',
                                  padding: '2px 0'
                                }}
                              />
                            ) : (
                              <>
                                <span
                                  style={{
                                    fontSize: '13px',
                                    color: subtask.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                                    textDecoration: subtask.completed ? 'line-through' : 'none',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  {subtask.text}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSubtaskId(subtask.id);
                                  }}
                                  style={{
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    padding: '4px', display: 'flex', alignItems: 'center',
                                    color: 'var(--text-tertiary)', opacity: hoveredSubtaskId === subtask.id ? 0.7 : 0,
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

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSubtask(item.id, subtask.id);
                            }}
                            style={{
                              padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer',
                              color: hoveredSubtaskId === subtask.id ? 'var(--text-tertiary)' : 'transparent', display: 'flex', borderRadius: '4px',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = hoveredSubtaskId === subtask.id ? 'var(--text-tertiary)' : 'transparent'; }}
                          >
                            <LuTrash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      value={newSubtaskText[item.id] ?? ''}
                      onChange={e => setNewSubtaskText(prev => ({ ...prev, [item.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addSubtask(item.id)}
                      placeholder="Add a subtask..."
                      className="luxury-input"
                      style={{
                        flex: 1,
                        minWidth: '180px',
                        fontSize: '13px',
                        padding: '8px 10px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addSubtask(item.id)}
                      disabled={!(newSubtaskText[item.id] ?? '').trim()}
                      className="luxury-button-secondary"
                      style={{
                        padding: '0 12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: (newSubtaskText[item.id] ?? '').trim() ? 1 : 0.5,
                        cursor: (newSubtaskText[item.id] ?? '').trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Add <LuPlus size={14} />
                    </button>
                  </div>
                </div>
                )}

                {activeTab === 'notes' && (
                  <div style={{ padding: '0 4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setEditingDescId(editingDescId === item.id ? null : item.id)}
                        className="luxury-button-secondary"
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                      >
                        {editingDescId === item.id ? 'Done' : item.description ? 'Edit' : 'Add Note'}
                      </button>
                    </div>

                    {editingDescId === item.id ? (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <MarkdownEditor
                          initialValue={item.description || ''}
                          onChange={val => updateItem(item.id, { description: val })}
                          minHeight={120}
                        />
                      </div>
                    ) : item.description ? (
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <MarkdownRenderer content={item.description} />
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', lineHeight: 1.5 }}>
                        No notes yet. Click "Add Note" to write something.
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
        );
      })}

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
