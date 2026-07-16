import type { TodoItem, DeadlineStatus } from './types';

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateShortId(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let value = '';

  for (const byte of bytes) {
    value += (byte % 36).toString(36);
  }

  return value.slice(0, length);
}

// ── Progress ──────────────────────────────────────────────────────────────────

export function getProgress(items: TodoItem[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + getItemProgress(item), 0);
  return Math.round(total / items.length);
}

export function getItemProgress(item: TodoItem): number {
  const subtasks = item.subtasks ?? [];
  if (subtasks.length === 0) return item.completed ? 100 : 0;
  return Math.round((subtasks.filter(subtask => subtask.completed).length / subtasks.length) * 100);
}

export function isItemComplete(item: TodoItem): boolean {
  return getItemProgress(item) === 100;
}

export function getCompletedItemCount(items: TodoItem[]): number {
  return items.filter(isItemComplete).length;
}

// ── Deadline ──────────────────────────────────────────────────────────────────

export function getDeadlineStatus(deadline?: string | null): DeadlineStatus {
  if (!deadline) return 'none';
  const now = new Date();
  const due = new Date(deadline);
  due.setHours(23, 59, 59, 999);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffMs < 0) return 'overdue';
  if (diffDays < 1) return 'critical';
  if (diffDays < 3) return 'urgent';
  if (diffDays < 7) return 'warning';
  return 'safe';
}

export type DeadlineColors = { bg: string; text: string; border: string };

export function getDeadlineColors(status: DeadlineStatus): DeadlineColors {
  const map: Record<DeadlineStatus, DeadlineColors> = {
    none:     { bg: 'rgba(148,163,184,0.08)', text: '#64748b', border: 'rgba(148,163,184,0.15)' },
    safe:     { bg: 'rgba(34,197,94,0.1)',    text: '#4ade80', border: 'rgba(34,197,94,0.25)'  },
    warning:  { bg: 'rgba(245,158,11,0.1)',   text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
    urgent:   { bg: 'rgba(249,115,22,0.1)',   text: '#fb923c', border: 'rgba(249,115,22,0.25)' },
    critical: { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', border: 'rgba(239,68,68,0.3)'   },
    overdue:  { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444', border: 'rgba(239,68,68,0.35)'  },
  };
  return map[status];
}

export function formatDeadline(deadline?: string | null): string {
  if (!deadline) return 'No deadline';
  const now = new Date();
  const due = new Date(deadline);
  due.setHours(23, 59, 59, 999);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs < 0) {
    const n = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return `Overdue by ${n}d`;
  }
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── User ──────────────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// ── Share URL ─────────────────────────────────────────────────────────────────

export function encodeTodo(todo: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(todo)));
}

export function decodeTodo(encoded: string): unknown {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}

export function generateShareUrl(todo: { shareSlug?: string }): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/shared/${todo.shareSlug ?? ''}`;
}
