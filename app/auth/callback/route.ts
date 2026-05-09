import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Database } from "@/types/database/database.types";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Using a more robust approach for profile creation
        const { error: upsertError } = await supabase
          .from("customers")
          .upsert({
            id: user.id,
            full_name: user.user_metadata.full_name || user.email?.split("@")[0] || "Người dùng",
            phone: user.user_metadata.phone || "",
            role: user.user_metadata.role || "STAFF",
            tenant_id: user.user_metadata.tenant_id || "default",
          } as any); // Cast to any here is safer than global disable as it's targeted

        if (upsertError) console.error("Profile Upsert Error:", upsertError.message);
      }

      // Next.js 16 redirect optimization
      const redirectUrl = new URL(next, origin);
      return NextResponse.redirect(redirectUrl);
    } else {
      console.error("Auth Callback Error:", error.message);
      const errorUrl = new URL("/auth/auth-error", origin);
      errorUrl.searchParams.set("error", error.name);
      errorUrl.searchParams.set("error_description", error.message);
      return NextResponse.redirect(errorUrl);
    }
  }

  const fallbackErrorUrl = new URL("/auth/auth-error", origin);
  fallbackErrorUrl.searchParams.set("error", "no_code");
  fallbackErrorUrl.searchParams.set("error_description", "No authentication code found");
  return NextResponse.redirect(fallbackErrorUrl);
}