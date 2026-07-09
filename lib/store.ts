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
    if (!raw) return {};
    const todos = JSON.parse(raw) as Record<string, Todo>;
    
    // Auto-cleanup deleted items older than 30 days
    let changed = false;
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    
    for (const id in todos) {
      const todo = todos[id];
      if (todo.deletedAt) {
        const delTime = new Date(todo.deletedAt).getTime();
        if (now - delTime > thirtyDaysMs) {
          delete todos[id];
          changed = true;
        }
      }
    }
    
    if (changed) {
      localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    }
    
    return todos;
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
    .filter(t => t.ownerId === userId && !t.deletedAt)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getTrashTodos(userId: string): Todo[] {
  const all = getAllTodos();
  return Object.values(all)
    .filter(t => t.ownerId === userId && !!t.deletedAt)
    .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
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
  if (all[todoId]) {
    all[todoId].deletedAt = new Date().toISOString();
    all[todoId].updatedAt = new Date().toISOString();
    persistTodos(all);
  }
}

export function hardDeleteTodo(todoId: string): void {
  const all = getAllTodos();
  delete all[todoId];
  persistTodos(all);
}

export function restoreTodo(todoId: string): void {
  const all = getAllTodos();
  if (all[todoId]) {
    delete all[todoId].deletedAt;
    all[todoId].updatedAt = new Date().toISOString();
    persistTodos(all);
  }
}
