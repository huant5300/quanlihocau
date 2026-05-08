"use client";

import React, { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { UserRole } from "@/types/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch additional profile data (role, tenant_id) from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, tenant_id, full_name, avatar_url")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: profile?.full_name || session.user.user_metadata.full_name,
          avatar_url: profile?.avatar_url || session.user.user_metadata.avatar_url,
          role: (profile?.role as UserRole) || "STAFF", // Default to STAFF
          tenant_id: profile?.tenant_id,
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, tenant_id")
            .eq("id", session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: (profile?.role as UserRole) || "STAFF",
            tenant_id: profile?.tenant_id,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUser, setLoading]);

  return <>{children}</>;
}
