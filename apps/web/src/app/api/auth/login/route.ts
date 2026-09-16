import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * ============================================================
 * POST /api/auth/login
 * ============================================================
 *
 * Login with Email + Password.
 *
 * The Supabase Server Client uses Next.js cookies so the
 * authenticated session can persist between requests.
 * ============================================================
 */
export async function POST(request: Request) {
  const body = await request.json();

  /**
   * ----------------------------------------------------------
   * 1. Read and validate email
   * ----------------------------------------------------------
   */
  const email =
    typeof body.email === "string"
      ? body.email.trim()
      : "";

  /**
   * ----------------------------------------------------------
   * 2. Read and validate password
   * ----------------------------------------------------------
   */
  const password =
    typeof body.password === "string"
      ? body.password
      : "";

  if (!email) {
    return NextResponse.json(
      {
        success: false,
        message: "Email is required",
      },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      {
        success: false,
        message: "Password is required",
      },
      { status: 400 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 3. Create Supabase Server Client
   * ----------------------------------------------------------
   *
   * This client is connected to Next.js cookies.
   */
  const supabase = await createSupabaseServerClient();

  /**
   * ----------------------------------------------------------
   * 4. Login with Supabase Auth
   * ----------------------------------------------------------
   */
  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  /**
   * ----------------------------------------------------------
   * 5. Handle login error
   * ----------------------------------------------------------
   */
  if (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 401 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 6. Make sure user exists
   * ----------------------------------------------------------
   */
  if (!data.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
      },
      { status: 401 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 7. Return authenticated user
   * ----------------------------------------------------------
   *
   * The session is persisted through the Supabase SSR
   * cookie mechanism configured in createSupabaseServerClient().
   */
  return NextResponse.json({
    success: true,
    data: {
      user: data.user,
      session: data.session,
    },
  });
}