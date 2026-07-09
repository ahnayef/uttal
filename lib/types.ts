export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string; // emoji or initials
  createdAt: string;
}

export interface TodoItem {
  id: string;
  text: string;
  description?: string;
  deadline?: string | null;
  completed: boolean;
  createdAt: string;
}

export type Visibility = 'public' | 'private' | 'shared';

export interface Todo {
  id: string;
  title: string;
  description: string; // markdown content
  items: TodoItem[];
  visibility: Visibility;
  sharedWith: string[]; // email addresses
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type DeadlineStatus = 'none' | 'safe' | 'warning' | 'urgent' | 'critical' | 'overdue';
