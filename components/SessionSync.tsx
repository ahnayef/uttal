'use client';
import { useEffect } from 'react';
import { clearUser, saveUser } from '@/lib/store';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function SessionSync() {
  useEffect(() => {
    const syncUser = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (sessionUser) {
        const email = sessionUser.email || '';
        saveUser({
          id: sessionUser.id,
          name: sessionUser.user_metadata.full_name || sessionUser.user_metadata.name || 'Google User',
          email,
          bio: 'Goals synced with Supabase Auth',
          avatar: sessionUser.user_metadata.avatar_url || '👋',
          createdAt: new Date().toISOString(),
        });
      } else {
        clearUser();
      }
    };

    void syncUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        saveUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'Google User',
          email: session.user.email || '',
          bio: 'Goals synced with Supabase Auth',
          avatar: session.user.user_metadata.avatar_url || '👋',
          createdAt: new Date().toISOString(),
        });
      } else {
        clearUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
