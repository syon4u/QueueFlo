
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  role: string | null;
  signInWithGoogle: () => Promise<void>;
  // Updated return types to match the actual implementation
  signInWithEmail: (email: string, password: string) => Promise<{
    user: User | null;
    session: Session | null;
  } | undefined>;
  signUpWithEmail: (email: string, password: string) => Promise<{
    user: User | null;
    session: Session | null;
  } | undefined>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer Supabase calls with setTimeout
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email || 'no session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);
      
      // First check hardcoded admin emails for development convenience
      if (user?.email === 'syon4u@gmail.com' || 
          user?.email === 'syon4uu@gmail.com' || 
          user?.email?.toLowerCase().includes('syon') ||
          user?.email?.toLowerCase().includes('garrick')) {
        setRole('admin');
        console.log('Admin user detected via hardcoded check - setting admin role');
        setIsLoading(false);
        return;
      }

      // Try to get role from database using the fixed function
      const { data, error } = await supabase.rpc('get_user_role', { user_id: userId });

      if (error) {
        console.error('Error fetching user role:', error);
        
        // Check for role in the user_roles table directly as fallback
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();
        
        if (roleError || !roleData) {
          console.log('No role found in database, defaulting to customer');
          setRole('customer');
          setIsLoading(false);
          return;
        }
        
        console.log('Role found in database:', roleData.role);
        setRole(roleData.role);
        setIsLoading(false);
        return;
      }

      console.log('Role from RPC function:', data);
      setRole(data || 'customer');
      console.log(`Role set to ${data || 'customer'} from database`);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      setRole('customer');
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Start with Google OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Google OAuth is still disabled, but keep the function intact for when it's enabled
      console.error('Google auth might not be enabled yet in Supabase');
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw new Error(error.message || 'Google sign-in is not enabled. Please use email/password instead.');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Navigate to home after successful login
      navigate('/');
      return data;
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setSession(null);
      setRole(null);
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message || "There was an error signing out.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    role,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
