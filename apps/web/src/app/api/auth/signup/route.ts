import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

/**
 * ============================================================
 * SIGNUP API
 * ============================================================
 *
 * POST /api/auth/signup
 *
 * Creates a new user through Supabase Auth.
 *
 * Request:
 * {
 *   email: string;
 *   password: string;
 * }
 *
 * Response:
 * {
 *   success: true;
 *   data: {
 *     user: ...
 *   }
 * }
 * ============================================================
 */

/**
 * ------------------------------------------------------------
 * Create a server-side Supabase client.
 * ------------------------------------------------------------
 *
 * We use the publishable key here because signup is a normal
 * public Auth operation.
 *
 * The secret key is NOT exposed to the browser.
 * ------------------------------------------------------------
 */
function createSupabaseAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/**
 * ============================================================
 * POST /api/auth/signup
 * ============================================================
 */
export async function POST(request: Request) {
  /**
   * ----------------------------------------------------------
   * 1. Read request body
   * ----------------------------------------------------------
   */
  const body = await request.json();

  const email =
    typeof body.email === "string"
      ? body.email.trim()
      : "";

  const password =
    typeof body.password === "string"
      ? body.password
      : "";

  /**
   * ----------------------------------------------------------
   * 2. Validate email
   * ----------------------------------------------------------
   */
  if (!email) {
    return NextResponse.json(
      {
        success: false,
        message: "Email is required",
      },
      { status: 400 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 3. Validate password
   * ----------------------------------------------------------
   */
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
   * 4. Create Supabase Auth client
   * ----------------------------------------------------------
   */
  const supabase = createSupabaseAuthClient();

  /**
   * ----------------------------------------------------------
   * 5. Create user with Supabase Auth
   * ----------------------------------------------------------
   */
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
    });

  /**
   * ----------------------------------------------------------
   * 6. Handle Supabase Auth error
   * ----------------------------------------------------------
   */
  if (error) {
    console.error(
      "Signup failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 400 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 7. Return created user
   * ----------------------------------------------------------
   */
  return NextResponse.json(
    {
      success: true,
      data: {
        user: data.user,
      },
    },
    { status: 201 },
  );
}