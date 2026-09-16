import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * ============================================================
 * CONVERSATIONS API
 * ============================================================
 *
 * GET  /api/conversations
 * POST /api/conversations
 *
 * Data source:
 * Supabase Database
 * ============================================================
 */

const CONVERSATION_SELECT =
  "id, name, fallback, online, created_at, updated_at";

/**
 * ============================================================
 * GET /api/conversations
 * ============================================================
 *
 * Load all conversations from Supabase.
 */
export async function GET() {
  /**
   * ----------------------------------------------------------
   * 1. Create Supabase admin client
   * ----------------------------------------------------------
   */
  const supabase = createSupabaseAdminClient();

  /**
   * ----------------------------------------------------------
   * 2. Read conversations
   * ----------------------------------------------------------
   */
  const { data, error } = await supabase
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .order("created_at", {
      ascending: true,
    });

  /**
   * ----------------------------------------------------------
   * 3. Handle database error
   * ----------------------------------------------------------
   */
  if (error) {
    console.error(
      "Failed to load conversations:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load conversations",
      },
      { status: 500 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. Return conversations
   * ----------------------------------------------------------
   */
  return NextResponse.json({
    success: true,
    data: data ?? [],
  });
}

/**
 * ============================================================
 * POST /api/conversations
 * ============================================================
 *
 * Create a new conversation in Supabase.
 */
export async function POST(request: Request) {
  /**
   * ----------------------------------------------------------
   * 1. Read request body
   * ----------------------------------------------------------
   */
  const body = await request.json();

  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : "";

  /**
   * ----------------------------------------------------------
   * 2. Validate conversation name
   * ----------------------------------------------------------
   */
  if (!name) {
    return NextResponse.json(
      {
        success: false,
        message: "Conversation name is required",
      },
      { status: 400 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 3. Build conversation data
   * ----------------------------------------------------------
   */
  const conversation = {
    id: crypto.randomUUID(),
    name,
    fallback: name.charAt(0).toUpperCase(),
    online: false,
  };

  /**
   * ----------------------------------------------------------
   * 4. Create Supabase admin client
   * ----------------------------------------------------------
   */
  const supabase = createSupabaseAdminClient();

  /**
   * ----------------------------------------------------------
   * 5. Insert conversation
   * ----------------------------------------------------------
   */
  const { data, error } = await supabase
    .from("conversations")
    .insert(conversation)
    .select(CONVERSATION_SELECT)
    .single();

  /**
   * ----------------------------------------------------------
   * 6. Handle database error
   * ----------------------------------------------------------
   */
  if (error) {
    console.error(
      "Failed to create conversation:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create conversation",
      },
      { status: 500 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 7. Return created conversation
   * ----------------------------------------------------------
   */
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 201 },
  );
}