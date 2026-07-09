'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTodoById, saveTodo, deleteTodo, getUser } from '@/lib/store';
import type { Todo, User } from '@/lib/types';
import TodoItemList from '@/components/TodoItemList';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ShareModal from '@/components/ShareModal';
import { LuShare, LuTrash2, LuCheck, LuAlignLeft } from 'react-icons/lu';
import { generateShortId } from '@/lib/utils';

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [todo, setTodo] = useState<Todo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleVal, setEditTitleVal]     = useState('');
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'description'>('tasks');
  const [showShare, setShowShare] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [draftDescription, setDraftDescription] = useState('');

  useEffect(() => {
    void (async () => {
      setUser(getUser());
      const id = params.id;
      if (id instanceof Promise) {
        const resolvedId = await id;
        if (typeof resolvedId === 'string') {
          let t = await getTodoById(resolvedId);
          if (!t) { router.replace('/dashboard'); return; }
          if (t.visibility !== 'private' && !t.shareSlug) {
            t = await saveTodo({ ...t, shareSlug: generateShortId() });
          }
          setTodo(t);
          setEditTitleVal(t.title);
          setDraftDescription(t.description);
        }
      } else if (typeof id === 'string') {
        let t = await getTodoById(id);
        if (!t) { router.replace('/dashboard'); return; }
        if (t.visibility !== 'private' && !t.shareSlug) {
          t = await saveTodo({ ...t, shareSlug: generateShortId() });
        }
        setTodo(t);
        setEditTitleVal(t.title);
        setDraftDescription(t.description);
      }
    })();
  }, [params.id, router]);

  useEffect(() => {
    if (!todo || !isEditingDescription) return;
    if (draftDescription === todo.description) return;

    const timer = window.setTimeout(() => {
      void (async () => {
        const saved = await saveTodo({ ...todo, description: draftDescription, updatedAt: new Date().toISOString() });
        setTodo(saved);
      })();
    }, 500);

    return () => window.clearTimeout(timer);
  }, [draftDescription, isEditingDescription, todo]);

  if (!todo || !user) return null;

  const update = (updates: Partial<Todo>) => {
    void (async () => {
      const saved = await saveTodo({ ...todo, ...updates, updatedAt: new Date().toISOString() });
      setTodo(saved);
      if (typeof updates.description === 'string') {
        setDraftDescription(updates.description);
      }
    })();
  };

  const handleTitleSubmit = () => {
    if (editTitleVal.trim() && editTitleVal !== todo.title) {
      update({ title: editTitleVal.trim() });
    } else {
      setEditTitleVal(todo.title);
    }
    setIsEditingTitle(false);
  };

  const handleDelete = () => {
    if (confirm('Move this todo to trash? You can restore it later.')) {
      void (async () => {
        await deleteTodo(todo.id);
        router.push('/dashboard');
      })();
    }
  };

  return (
    <div className="fade-in dashboard-page" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header block */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1 }}>
            {/* Title */}
            {isEditingTitle ? (
              <input
                autoFocus
                value={editTitleVal}
                onChange={e => setEditTitleVal(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
                className="luxury-input"
                style={{ fontSize: '22px', fontWeight: '500', padding: '6px 12px', background: 'var(--bg-surface)' }}
              />
            ) : (
              <h1 
                onClick={() => setIsEditingTitle(true)}
                style={{ 
                  fontSize: '24px', fontWeight: '500', color: 'var(--text-primary)', 
                  margin: '0 0 6px', cursor: 'text', letterSpacing: '-0.02em',
                  padding: '4px 0', border: '1px solid transparent', borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
                title="Click to edit"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {todo.title}
              </h1>
            )}

            {/* Meta info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: todo.visibility === 'public' ? '#4ade80' : todo.visibility === 'shared' ? '#60a5fa' : 'var(--text-tertiary)' }} />
                <span style={{ textTransform: 'capitalize' }}>{todo.visibility}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowShare(true)} className="luxury-button-secondary">
              <LuShare size={16} /> Share
            </button>
            <button onClick={handleDelete} className="luxury-button-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
              <LuTrash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Progress Bar Card */}
      {todo.items.length > 0 && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '0 4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>Progress</span>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>
              {todo.items.filter(it => it.completed).length} of {todo.items.length} tasks ({Math.round((todo.items.filter(it => it.completed).length / todo.items.length) * 100)}%)
            </span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${Math.round((todo.items.filter(it => it.completed).length / todo.items.length) * 100)}%`, 
                height: '100%', 
                background: 'var(--text-primary)', 
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
              }} 
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ 
        display: 'flex', gap: '6px', marginBottom: '16px', 
        borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' 
      }}>
        {([
          { id: 'tasks', label: 'Tasks', icon: <LuCheck size={14} /> },
          { id: 'description', label: 'Details', icon: <LuAlignLeft size={14} /> },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 12px', borderRadius: '6px', 
              border: `1px solid ${activeTab === tab.id ? 'var(--border-subtle)' : 'transparent'}`,
              background: activeTab === tab.id ? 'var(--bg-surface-elevated)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if(activeTab !== tab.id) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { if(activeTab !== tab.id) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="luxury-card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'tasks' ? (
          <TodoItemList items={todo.items} onChange={items => update({ items })} />
        ) : (
          <div style={{ padding: '24px' }}>
            {isEditingDescription ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <MarkdownEditor 
                    key={todo.id}
                    initialValue={draftDescription} 
                    onChange={setDraftDescription} 
                    minHeight={200} 
                  />
                </div>
                <button
                  onClick={() => {
                    void (async () => {
                      if (draftDescription !== todo.description) {
                        const saved = await saveTodo({ ...todo, description: draftDescription, updatedAt: new Date().toISOString() });
                        setTodo(saved);
                      }
                      setIsEditingDescription(false);
                    })();
                  }}
                  className="luxury-button-secondary"
                  style={{ alignSelf: 'flex-end', padding: '6px 16px' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingDescription(true)} 
                style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                title="Click to edit"
              >
                {todo.description ? (
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <MarkdownRenderer content={todo.description} />
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', borderBottom: '1px dashed var(--border-strong)', padding: '4px 0' }}>
                    + Add project notes...
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showShare && (
        <ShareModal todo={todo} onUpdate={update} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
