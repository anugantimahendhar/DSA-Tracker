import React, { createContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { authService } from '../../services/auth.service';

export interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | 'guest';
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  isConfigured: boolean;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, default_lang?: string) => Promise<{ confirmationRequired?: boolean }>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('dsa_tracker_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const fetchProfile = async (sessionUser?: any): Promise<UserProfile | null> => {
    try {
      const profile = await authService.getMe();
      setUser(profile);
      localStorage.setItem('dsa_tracker_user', JSON.stringify(profile));
      return profile;
    } catch {
      if (sessionUser) {
        const metadata = sessionUser.user_metadata || {};
        const fallbackProfile: UserProfile = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          role: metadata.role || 'user',
          default_language: metadata.default_language || 'python',
          created_at: sessionUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(fallbackProfile);
        localStorage.setItem('dsa_tracker_user', JSON.stringify(fallbackProfile));
        return fallbackProfile;
      }
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            localStorage.setItem('dsa_tracker_token', data.session.access_token);
            await fetchProfile(data.session.user);
          } else {
            setUser(null);
            localStorage.removeItem('dsa_tracker_token');
            localStorage.removeItem('dsa_tracker_user');
          }
        } else {
          // Dev mode fallback
          const token = localStorage.getItem('dsa_tracker_token');
          if (token) {
            await fetchProfile();
          } else {
            setUser(null);
          }
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        localStorage.setItem('dsa_tracker_token', session.access_token);
        await fetchProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('dsa_tracker_token');
        localStorage.removeItem('dsa_tracker_user');
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (email: string, pass: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data.session) {
        localStorage.setItem('dsa_tracker_token', data.session.access_token);
        await fetchProfile(data.user);
      }
    } else {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.detail || 'Invalid login credentials.');
      }
      localStorage.setItem('dsa_tracker_token', resData.session.access_token);
      localStorage.setItem('dsa_tracker_user', JSON.stringify(resData.user));
      setUser(resData.user);
    }
    setIsAuthModalOpen(false);
  };

  const register = async (email: string, pass: string, default_lang: string = 'python') => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            role: 'user',
            default_language: default_lang,
          },
        },
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data.session) {
        localStorage.setItem('dsa_tracker_token', data.session.access_token);
        await fetchProfile(data.user);
        setIsAuthModalOpen(false);
        return { confirmationRequired: false };
      } else if (data.user) {
        return { confirmationRequired: true };
      }
    } else {
      const res = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, default_language: default_lang }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.detail || 'Registration failed.');
      }
      localStorage.setItem('dsa_tracker_token', resData.session.access_token);
      localStorage.setItem('dsa_tracker_user', JSON.stringify(resData.user));
      setUser(resData.user);
      setIsAuthModalOpen(false);
      return { confirmationRequired: false };
    }
    return { confirmationRequired: false };
  };


  const googleLogin = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Google OAuth requires Supabase configuration in frontend/.env.');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } finally {
      localStorage.removeItem('dsa_tracker_token');
      localStorage.removeItem('dsa_tracker_user');
      setUser(null);
    }
  };

  const role: UserRole | 'guest' = user ? user.role : 'guest';
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        isConfigured: isSupabaseConfigured,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth } from './useAuth';