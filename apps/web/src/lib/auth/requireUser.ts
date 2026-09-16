import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Require an authenticated Supabase user.
 *
 * Returns:
 * - User object when authenticated
 * - null when no valid session exists
 */
export async function requireUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}