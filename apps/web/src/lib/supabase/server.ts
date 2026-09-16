import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Create a Supabase client for Next.js Server Components / Route Handlers.
 *
 * This client reads the Supabase URL and publishable key from
 * apps/web/.env.local and uses Next.js cookies for Supabase sessions.
 * 
 */

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              },
            );
          } catch {
            
            // Cookie writes can fail in some Server Component contexts.
            // Route Handlers can still update cookies when needed.
          }
        },
      },
    },
  );
}

/**
 * ============================================================
 * SUPABASE ADMIN CLIENT
 * ============================================================
 *
 * ប្រើសម្រាប់ Server-side operations ដែលត្រូវការ
 * SUPABASE_SECRET_KEY។
 *
 * IMPORTANT:
 * - មិនត្រូវប្រើ client នេះនៅ Browser
 * - មិនត្រូវដាក់ secret key ជា NEXT_PUBLIC_
 * - ប្រើតែ Server-side code ប៉ុណ្ណោះ
 * ============================================================
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}