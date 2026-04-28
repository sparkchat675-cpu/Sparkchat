import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { auth, signInWithGoogle } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface AppUser {
  id: string;
  name: string;
  username?: string;
  gender: string;
  age: number;
  country: string;
  avatar_url: string | null;
  bio?: string;
  interests?: string[];
  is_online: boolean;
  is_google_user: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  loginTemporary: (data: Omit<AppUser, 'id' | 'is_google_user' | 'avatar_url' | 'is_online'>) => void;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user with Supabase table
  const syncSupabaseProfile = async (id: string, metadata: any) => {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (profile) {
      setUser(profile as AppUser);
      await supabase.from('users').update({ is_online: true }).eq('id', id);
    } else {
      const baseName = (metadata.displayName || 'User').replace(/\s+/g, '').toLowerCase();
      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      const generatedUsername = `${baseName}${randomNumber}`;
      
      const newUser: AppUser = {
        id: id,
        name: metadata.displayName || 'User',
        username: generatedUsername,
        gender: 'Other',
        age: 18,
        country: 'Other',
        avatar_url: metadata.photoURL,
        is_online: true,
        is_google_user: true
      };
      await supabase.from('users').upsert(newUser);
      setUser(newUser);
    }
  };

  useEffect(() => {
    // 1. Initial check - check for temporary session first
    const tempUserJson = localStorage.getItem('temp_user');
    if (tempUserJson) {
      const tempUser = JSON.parse(tempUserJson);
      setUser(tempUser);
      supabase.from('users').upsert({ ...tempUser, is_online: true }).then();
      setLoading(false);
    }

    // 2. Listen to Firebase Auth state changes
    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        localStorage.removeItem('temp_user');
        await syncSupabaseProfile(firebaseUser.uid, firebaseUser);
      } else {
        const isTemp = !!localStorage.getItem('temp_user');
        if (!isTemp) setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeFirebase();
    };
  }, []);

  useEffect(() => {
    // 3. Presence tracking
    const updatePresence = async (online: boolean) => {
      if (user?.id) {
        await supabase.from('users').update({ is_online: online }).eq('id', user.id);
      }
    };

    if (user) {
      updatePresence(true);
      
      const handleVisibilityChange = () => {
        updatePresence(document.visibilityState === 'visible');
      };

      const handleBeforeUnload = () => {
        updatePresence(false);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updatePresence(false);
      };
    }
  }, [user?.id]);

  const loginTemporary = async (data: Omit<AppUser, 'id' | 'is_google_user' | 'avatar_url' | 'is_online'>) => {
    const tempId = crypto.randomUUID();
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`;
      
    const newUser: AppUser = {
      ...data,
      id: tempId,
      avatar_url: avatarUrl,
      is_online: true,
      is_google_user: false
    };
    
    setUser(newUser);
    localStorage.setItem('temp_user', JSON.stringify(newUser));
    
    try {
      await supabase.from('users').upsert(newUser);
    } catch (e) {
      console.warn("Guest sync failed:", e);
    }
  };

  const loginGoogle = async () => {
    try {
      await signInWithGoogle();
      // onAuthStateChanged will handle the state update
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const logout = async () => {
    if (auth.currentUser) {
      await signOut(auth);
    }
    
    if (user) {
      await supabase.from('users').update({ is_online: false }).eq('id', user.id);
    }
    
    setUser(null);
    localStorage.removeItem('temp_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginTemporary, loginGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
