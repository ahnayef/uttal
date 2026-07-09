'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTodos, getUser, deleteTodo } from '@/lib/store';
import type { Todo, User } from '@/lib/types';
import TodoCard from '@/components/TodoCard';
import { getProgress, getDeadlineStatus } from '@/lib/utils';
import { LuPlus, LuLayoutList, LuCheck, LuClock } from 'react-icons/lu';

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [user, setUser]   = useState<User | null>(null);

  useEffect(() => {
    void (async () => {
      const u = getUser();
      setUser(u);
      if (u) {
        setTodos(await getTodos(u.id));
      }
    })();
  }, []);

  if (!user) return null;

  // Stats
  const total = todos.length;
  const completed = todos.filter(t => t.items.length > 0 && getProgress(t.items) === 100).length;
  const overdue = todos.filter(t => t.items.some(i => !i.completed && i.deadline && getDeadlineStatus(i.deadline) === 'overdue')).length;

  return (
    <div className="fade-in dashboard-page" style={{ paddingBottom: '80px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap', marginBottom: '64px' }}>
        <div>
          <span className="section-label">Overview</span>
          <h1 className="heading-primary">
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            Welcome back, {user.name.split(' ')[0]}. Here&apos;s your status.
          </p>
        </div>
        <Link href="/todos/new" className="luxury-button-primary" style={{ textDecoration: 'none' }}>
          New Todo <LuPlus size={16} />
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px', marginBottom: '48px'
      }}>
        {[
          { label: 'Total Projects', value: total, icon: <LuLayoutList size={20} color="var(--text-secondary)" /> },
          { label: 'Completed', value: completed, icon: <LuCheck size={20} color="var(--text-primary)" /> },
          { label: 'Tasks Overdue', value: overdue, icon: <LuClock size={20} color={overdue > 0 ? '#ef4444' : 'var(--text-secondary)'} /> },
        ].map((stat, i) => (
          <div key={i} className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'var(--accent-cyan-subtle)', border: '1px solid var(--accent-cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '6px' }}>{stat.value}</div>
              <div className="section-label" style={{ margin: 0 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Your Todos</h2>
        {todos.length > 0 && (
          <Link href="/todos" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}>
            View All &rarr;
          </Link>
        )}
      </div>

      {todos.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)', borderRadius: '16px'
        }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--bg-surface-elevated)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-secondary)' }}>
            <LuLayoutList size={24} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 8px' }}>No todos yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 24px' }}>Get started by creating your first project.</p>
          <Link href="/todos/new" className="luxury-button-secondary" style={{ textDecoration: 'none' }}>
            Create Todo
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'
        }}>
          {todos.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(todo => (
            <TodoCard 
              key={todo.id} 
              todo={todo} 
              onDelete={() => {
                void (async () => {
                  await deleteTodo(todo.id);
                  if (user) setTodos(await getTodos(user.id));
                })();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
