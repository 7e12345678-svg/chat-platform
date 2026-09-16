import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * ============================================================
 * GET /api/auth/session
 * ============================================================
 *
 * Get the currently authenticated Supabase user
 * from the server-side session.
 * ============================================================
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Get session failed:", error);

    return NextResponse.json({
      success: true,
      data: {
        user: null,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      user,
    },
  });
}