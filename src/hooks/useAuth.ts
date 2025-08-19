import { useState, useEffect } from "react";
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (nome: string, telefone: string, password: string) => Promise<{ error: any }>;
  signIn: (identifier: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkUserRole = async (userId: string) => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      console.log('User roles query result:', { roles, error });
      const isUserAdmin = roles && roles.length > 0;
      console.log('Setting isAdmin to:', isUserAdmin);
      setIsAdmin(isUserAdmin);
      setLoading(false); // Only set loading to false after role check
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  // Set up auth state listener FIRST
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Keep loading true until role check completes
        setLoading(true);
        setTimeout(() => {
          checkUserRole(session.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    }
  );

  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        setTimeout(() => checkUserRole(session.user.id), 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (nome: string, telefone: string, password: string) => {
    // Normalize Brazilian phone to E.164 (+55XXXXXXXXXXX)
    const digits = (telefone || '').replace(/\D/g, '');
    const normalizedPhone = digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
    const { error } = await supabase.auth.signUp({
      phone: normalizedPhone,
      password,
      options: {
        data: { nome, telefone: normalizedPhone }
      }
    });
    return { error };
  };

  const signIn = async (identifier: string, password: string) => {
    // Decide if identifier is email or phone
    const isEmail = /@/.test(identifier);
    let creds: any;
    if (isEmail) {
      creds = { email: identifier, password };
    } else {
      const digits = (identifier || '').replace(/\D/g, '');
      const phone = digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
      creds = { phone, password };
    }
    const { error } = await supabase.auth.signInWithPassword(creds);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut
  };
};

export default useAuth;
