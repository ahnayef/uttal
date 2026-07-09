import { createClient } from '@/utils/supabase/client';
import { generateShortId } from '@/lib/utils';
import type { User, Todo } from './types';

const USER_KEY = 'uttal_user';
const TODOS_TABLE = 'todos';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type TodoRow = {
  id: string;
  share_slug: string | null;
  title: string;
  description: string;
  items: Todo['items'];
  visibility: Todo['visibility'];
  shared_with: string[];
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    shareSlug: row.share_slug ?? undefined,
    title: row.title,
    description: row.description ?? '',
    items: row.items ?? [],
    visibility: row.visibility,
    sharedWith: row.shared_with ?? [],
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
  };
}

function toRow(todo: Todo): TodoRow {
  return {
    id: todo.id,
    share_slug: todo.shareSlug ?? null,
    title: todo.title,
    description: todo.description ?? '',
    items: todo.items,
    visibility: todo.visibility,
    shared_with: todo.sharedWith ?? [],
    owner_id: todo.ownerId,
    created_at: todo.createdAt,
    updated_at: todo.updatedAt,
    deleted_at: todo.deletedAt ?? null,
  };
}

async function fetchTodosForUser(userId: string): Promise<Todo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TODOS_TABLE)
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  const todos = (data ?? []).map(row => toTodo(row as TodoRow));
  const expiredIds = todos
    .filter(todo => todo.deletedAt && Date.now() - new Date(todo.deletedAt).getTime() > THIRTY_DAYS_MS)
    .map(todo => todo.id);

  if (expiredIds.length > 0) {
    await supabase.from(TODOS_TABLE).delete().in('id', expiredIds);
  }

  return todos.filter(todo => !todo.deletedAt || Date.now() - new Date(todo.deletedAt).getTime() <= THIRTY_DAYS_MS);
}

async function fetchTodoByColumn(column: 'id' | 'share_slug', value: string): Promise<Todo | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from(TODOS_TABLE).select('*').eq(column, value).maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toTodo(data as TodoRow) : null;
}

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
}

// ── Todos ─────────────────────────────────────────────────────────────────────

export async function getTodos(userId: string): Promise<Todo[]> {
  const todos = await fetchTodosForUser(userId);
  return todos
    .filter(todo => !todo.deletedAt)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getTrashTodos(userId: string): Promise<Todo[]> {
  const todos = await fetchTodosForUser(userId);
  return todos
    .filter(todo => !!todo.deletedAt)
    .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
}

export async function getTodoById(todoId: string): Promise<Todo | null> {
  return fetchTodoByColumn('id', todoId);
}

export async function getTodoByShareSlug(shareSlug: string): Promise<Todo | null> {
  return fetchTodoByColumn('share_slug', shareSlug);
}

export async function saveTodo(todo: Todo): Promise<Todo> {
  const supabase = createClient();
  const timestamp = new Date().toISOString();
  const payload = toRow({
    ...todo,
    shareSlug: todo.shareSlug ?? generateShortId(),
    updatedAt: timestamp,
  });

  const { error } = await supabase.from(TODOS_TABLE).upsert(payload);
  if (error) {
    throw error;
  }

  return toTodo(payload);
}

export async function deleteTodo(todoId: string): Promise<void> {
  const supabase = createClient();
  const timestamp = new Date().toISOString();
  const { error } = await supabase
    .from(TODOS_TABLE)
    .update({ deleted_at: timestamp, updated_at: timestamp })
    .eq('id', todoId);

  if (error) {
    throw error;
  }
}

export async function hardDeleteTodo(todoId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from(TODOS_TABLE).delete().eq('id', todoId);

  if (error) {
    throw error;
  }
}

export async function restoreTodo(todoId: string): Promise<void> {
  const supabase = createClient();
  const timestamp = new Date().toISOString();
  const { error } = await supabase
    .from(TODOS_TABLE)
    .update({ deleted_at: null, updated_at: timestamp })
    .eq('id', todoId);

  if (error) {
    throw error;
  }
}
