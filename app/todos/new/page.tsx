'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveTodo, getUser } from '@/lib/store';
import type { User } from '@/lib/types';
import { generateId } from '@/lib/utils';
import MarkdownEditor from '@/components/MarkdownEditor';
import { LuPlus } from 'react-icons/lu';

export default function NewTodoPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace('/login'); return; }
    setUser(u);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const newTodo = {
      id: generateId(),
      ownerId: user.id,
      title: title.trim(),
      description,
      deadline: deadline || null,
      visibility: 'private' as const,
      sharedWith: [],
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveTodo(newTodo);
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
          <label className="section-label">Description (Optional)</label>
          <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <MarkdownEditor value={description} onChange={setDescription} minHeight={150} />
          </div>
        </div>

        <div>
          <label className="section-label">Deadline (Optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="luxury-input"
            style={{ width: '100%', display: 'block' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="submit" disabled={!title.trim()} className="luxury-button-primary">
            Create Todo <LuPlus size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
