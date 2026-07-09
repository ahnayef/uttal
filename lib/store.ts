import type { User, Todo } from './types';

const USER_KEY = 'uttal_user';
const TODOS_KEY = 'uttal_todos';

// ── User ──────────────────────────────────────────────────────────────────────

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TODOS_KEY);
}

// ── Todos ─────────────────────────────────────────────────────────────────────

function getAllTodos(): Record<string, Todo> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TODOS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Todo>) : {};
  } catch {
    return {};
  }
}

function persistTodos(todos: Record<string, Todo>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

export function getTodos(userId: string): Todo[] {
  const all = getAllTodos();
  return Object.values(all)
    .filter(t => t.ownerId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getTodoById(todoId: string): Todo | null {
  return getAllTodos()[todoId] ?? null;
}

export function saveTodo(todo: Todo): void {
  const all = getAllTodos();
  all[todo.id] = { ...todo, updatedAt: new Date().toISOString() };
  persistTodos(all);
}

export function deleteTodo(todoId: string): void {
  const all = getAllTodos();
  delete all[todoId];
  persistTodos(all);
}
