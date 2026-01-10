import { createContext, useEffect, useState, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null | undefined;
  signUpNewUser: (email: string, password: string) => Promise<{ success: boolean; error?: any; data?: any }>;
  signInUser: (email: string, password: string) => Promise<{ success: boolean; error?: any; data?: any }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Signup
  const signUpNewUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Error signing up:", error);
      return { success: false, error };
    }
    return { success: true, data };
  };

  // Signin
  const signInUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Error signing in:", error.message);
        return { success: false, error: error.message };
      }
      console.log("Sign-in successful:", data);
      return { success: true, data };
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
  };

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Signout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      signUpNewUser,
      signOut,
      signInUser,
      isLoading,
      isAuthenticated: !!session
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
