'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveTodo, getUser } from '@/lib/store';
import type { User, TodoItem } from '@/lib/types';
import { generateId } from '@/lib/utils';
import TodoItemList from '@/components/TodoItemList';
import { LuPlus } from 'react-icons/lu';

export default function NewTodoPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<TodoItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void (async () => {
      const u = getUser();
      if (!u) {
        router.replace('/login');
        return;
      }
      setUser(u);
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || items.length === 0 || !user) return;

    const newTodo = {
      id: generateId(),
      ownerId: user.id,
      title: title.trim(),
      description,
      visibility: 'private' as const,
      sharedWith: [],
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveTodo(newTodo);
    router.push(`/todos/${newTodo.id}`);
  };

  return (
    <div className="fade-in" style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '80px' }}>
      <div style={{ marginBottom: '56px' }}>
        <span className="section-label">Create</span>
        <h1 className="heading-primary">
          New Todo
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
          Start a new list, project, or goal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="luxury-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label className="section-label">Title</label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="E.g., Q3 Marketing Campaign"
            className="luxury-input"
            style={{ fontSize: '20px' }}
            required
          />
        </div>

        <div>
          <label className="section-label">Tasks (Required)</label>
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
            <TodoItemList items={items} onChange={setItems} />
          </div>
        </div>

        <div>
          <label className="section-label">Project Notes (Optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="luxury-input"
            placeholder="Brief description or context..."
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="submit" disabled={!title.trim() || items.length === 0} className="luxury-button-primary">
            Create Todo <LuPlus size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
