"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Member } from "@/types/member";

type AuthContextValue = {
  user: User | null;
  member: Member | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMember = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        setMember(null);
        return;
      }
      setMember(data as Member);
    },
    [supabase],
  );

  const refreshMember = useCallback(async () => {
    if (session?.user?.id) {
      await fetchMember(session.user.id);
    }
  }, [session, fetchMember]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user?.id) {
        fetchMember(initialSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.id) {
        fetchMember(newSession.user.id).finally(() => setLoading(false));
      } else {
        setMember(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchMember]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setMember(null);
  }, [supabase]);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    member,
    session,
    loading,
    signOut,
    refreshMember,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
