'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTrashTodos, getUser, restoreTodo, hardDeleteTodo } from '@/lib/store';
import type { Todo, User } from '@/lib/types';
import TodoCard from '@/components/TodoCard';
import { LuTrash2, LuRotateCcw, LuChevronLeft, LuInfo } from 'react-icons/lu';

export default function TrashPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [user, setUser]   = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (u) loadTrash(u.id);
  }, []);

  const loadTrash = (userId: string) => {
    setTodos(getTrashTodos(userId));
  };

  const handleRestore = (id: string) => {
    restoreTodo(id);
    if (user) loadTrash(user.id);
  };

  const handleHardDelete = (id: string) => {
    if (confirm('Permanently delete this project? This cannot be undone.')) {
      hardDeleteTodo(id);
      if (user) loadTrash(user.id);
    }
  };

  const handleEmptyTrash = () => {
    if (confirm('Permanently delete ALL items in the trash? This cannot be undone.')) {
      todos.forEach(t => hardDeleteTodo(t.id));
      if (user) loadTrash(user.id);
    }
  };

  if (!user) return null;

  return (
    <div className="fade-in" style={{ paddingBottom: '80px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboard" style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '6px', 
          color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none',
          marginBottom: '16px', transition: 'color 0.2s'
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}>
          <LuChevronLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="heading-primary" style={{ margin: '0 0 6px' }}>Trash</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Items here will be permanently deleted after 30 days.
            </p>
          </div>
          {todos.length > 0 && (
            <button onClick={handleEmptyTrash} className="luxury-button-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
              Empty Trash <LuTrash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Warning Alert Banner */}
      {todos.length > 0 && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 18px', borderRadius: '12px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          color: 'var(--text-primary)',
          fontSize: '13px',
          marginBottom: '32px'
        }}>
          <LuInfo size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span>Restoring a todo list will recover all of its tasks, descriptions, and deadlines immediately.</span>
        </div>
      )}

      {/* Grid */}
      {todos.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)', borderRadius: '16px'
        }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--bg-surface-elevated)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--text-secondary)' }}>
            <LuTrash2 size={20} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 4px' }}>Trash is empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>There are no soft-deleted todos to show.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'
        }}>
          {todos.map(todo => (
            <TodoCard 
              key={todo.id} 
              todo={todo} 
              inTrash={true}
              onRestore={() => handleRestore(todo.id)}
              onHardDelete={() => handleHardDelete(todo.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
