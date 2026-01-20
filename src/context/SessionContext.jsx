import { createContext, useState, useEffect, useMemo } from "react";
import { supabase } from "../utils/supabase";

export const SessionContext = createContext({
  session: null,
  isAdmin: false,
  sessionLoading: false,
  sessionMessage: null,
  sessionError: null,
  handleSignUp: () => {},
  handleSignIn: () => {},
  handleSignOut: () => {},
});

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionMessage, setSessionMessage] = useState(null);
  const [sessionError, setSessionError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data?.session ?? null);
      } catch (e) {
        // ignore
      }
    }

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      mounted = false;
      if (authListener && authListener.subscription && authListener.subscription.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const isAdmin = useMemo(() => {
    return Boolean(session?.user?.user_metadata?.admin);
  }, [session]);

  async function handleSignUp(email, password, username) {
    setSessionLoading(true);
    setSessionMessage(null);
    setSessionError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            admin: false,
          },
          emailRedirectTo: `${window.location.origin}/signin`,
        },
      });

      if (error) throw error;

      if (data.user) {
        setSessionMessage("Registration successful! Check your email to confirm your account.");
        window.location.href = "/signin";
      }
    } catch (error) {
      setSessionError(error.message);
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleSignIn(email, password) {
    setSessionLoading(true);
    setSessionMessage(null);
    setSessionError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setSessionMessage("Sign in successful!");
      }
    } catch (error) {
      setSessionError(error.message);
    } finally {
      setSessionLoading(false);
    }
  }

  async function handleSignOut() {
    setSessionLoading(true);
    setSessionMessage(null);
    setSessionError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setSession(null);
      window.location.href = "/";
    } catch (error) {
      setSessionError(error.message);
    } finally {
      setSessionLoading(false);
    }
  }

  const value = {
    session,
    isAdmin,
    sessionLoading,
    sessionMessage,
    sessionError,
    handleSignUp,
    handleSignIn,
    handleSignOut,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
