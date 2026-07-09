'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTodos, getUser, deleteTodo } from '@/lib/store';
import type { Todo, User } from '@/lib/types';
import TodoCard from '@/components/TodoCard';
import { getProgress } from '@/lib/utils';
import { LuPlus, LuSearch, LuChevronLeft, LuLayoutList } from 'react-icons/lu';

export default function AllTodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [user, setUser]   = useState<User | null>(null);

  // Search & Filter state
  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState<'updated' | 'created' | 'alpha' | 'tasks'>('updated');
  const [visibility, setVisibility] = useState<'all' | 'private' | 'public' | 'shared'>('all');
  const [progress, setProgress]   = useState<'all' | 'completed' | 'ongoing' | 'empty'>('all');

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

  // 1. Filter logic
  const filteredTodos = todos.filter(todo => {
    // Search query match
    const matchSearch = 
      todo.title.toLowerCase().includes(search.toLowerCase()) ||
      (todo.description && todo.description.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchSearch) return false;

    // Visibility match
    if (visibility !== 'all' && todo.visibility !== visibility) return false;

    // Progress match
    const pct = getProgress(todo.items);
    if (progress === 'completed' && (todo.items.length === 0 || pct < 100)) return false;
    if (progress === 'ongoing' && (todo.items.length === 0 || pct === 100)) return false;
    if (progress === 'empty' && todo.items.length > 0) return false;

    return true;
  });

  // 2. Sort logic
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'tasks') {
      return b.items.length - a.items.length;
    }
    return 0;
  });

  return (
    <div className="fade-in" style={{ paddingBottom: '80px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Back button & Header */}
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
            <h1 className="heading-primary" style={{ margin: '0 0 6px' }}>All Todos</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Search, filter, and organize your todos and projects.
            </p>
          </div>
          <Link href="/todos/new" className="luxury-button-primary" style={{ textDecoration: 'none' }}>
            New Todo <LuPlus size={16} />
          </Link>
        </div>
      </div>

      {/* Search & Filters Controls Panel */}
      <div className="luxury-card" style={{ 
        padding: '20px', 
        marginBottom: '32px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px' 
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <LuSearch size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '14px' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or notes..."
            className="luxury-input"
            style={{ paddingLeft: '44px', fontSize: '14px' }}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '24px', 
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '16px',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-tertiary)', fontWeight: '500' }}>Visibility:</span>
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value as 'all' | 'private' | 'public' | 'shared')}
                style={{
                  background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
                  borderRadius: '6px', color: 'var(--text-primary)', padding: '4px 8px',
                  outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="all">All</option>
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="shared">Shared</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-tertiary)', fontWeight: '500' }}>Status:</span>
              <select
                value={progress}
                onChange={e => setProgress(e.target.value as 'all' | 'completed' | 'ongoing' | 'empty')}
                style={{
                  background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
                  borderRadius: '6px', color: 'var(--text-primary)', padding: '4px 8px',
                  outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="all">All</option>
                <option value="ongoing">In Progress</option>
                <option value="completed">Completed</option>
                <option value="empty">No tasks</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-tertiary)', fontWeight: '500' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'updated' | 'created' | 'alpha' | 'tasks')}
              style={{
                background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: '6px', color: 'var(--text-primary)', padding: '4px 8px',
                outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="updated">Last Updated</option>
              <option value="created">Created Date</option>
              <option value="alpha">Alphabetical</option>
              <option value="tasks">Task Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Todos Grid */}
      {sortedTodos.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)', borderRadius: '16px'
        }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--bg-surface-elevated)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--text-secondary)' }}>
            <LuLayoutList size={20} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 4px' }}>No matches found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'
        }}>
          {sortedTodos.map(todo => (
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
