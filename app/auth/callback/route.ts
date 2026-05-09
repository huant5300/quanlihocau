import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
        // Auto-create or update profile in 'customers' table
        // This ensures the profile exists for the dashboard to function correctly
        await (supabase.from("customers") as any).upsert({
          id: user.id,
          full_name: user.user_metadata.full_name || user.email?.split("@")[0] || "Người dùng",
          phone: user.user_metadata.phone || "",
          role: user.user_metadata.role || "STAFF",
          tenant_id: user.user_metadata.tenant_id || "default",
        }, {
          onConflict: 'id'
        });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${appUrl}${next}`);
      } else {
        const forwardedHost = request.headers.get("x-forwarded-host");
        if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        }
        return NextResponse.redirect(`${appUrl}${next}`);
      }
    } else {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
      console.error("Auth Callback Error:", error.message);
      return NextResponse.redirect(`${appUrl}/auth/auth-error?error=${encodeURIComponent(error.name)}&error_description=${encodeURIComponent(error.message)}`);
    }
  }

  // Return the user to an error page with instructions
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
  return NextResponse.redirect(`${appUrl}/auth/auth-error?error=no_code&error_description=No+authentication+code+found`);
}