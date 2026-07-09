'use client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { saveUser, getUser } from '@/lib/store';

export default function SessionSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const localUser = getUser();
      const googleEmail = session.user.email || '';
      
      if (!localUser || localUser.email !== googleEmail) {
        saveUser({
          id: googleEmail,
          name: session.user.name || 'Google User',
          email: googleEmail,
          bio: 'Goals synced with Google Account',
          avatar: session.user.image || '👋',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }, [session, status]);

  return null;
}
