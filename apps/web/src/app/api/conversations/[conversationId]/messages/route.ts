import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * ============================================================
 * MESSAGES API
 * ============================================================
 *
 * GET  /api/conversations/[conversationId]/messages
 * POST /api/conversations/[conversationId]/messages
 *
 * 19.5.3:
 * POST message → Supabase Database
 * ============================================================
 */

interface RouteContext {
  params: Promise<{
    conversationId: string;
  }>;
}

/**
 * ============================================================
 * GET MESSAGES FROM SUPABASE
 * ============================================================
 *
 * GET /api/conversations/[conversationId]/messages
 *
 * Flow:
 * 1. Get conversationId
 * 2. Query messages from Supabase
 * 3. Sort by created_at ASC
 * 4. Convert Database row → Frontend Message format
 * 5. Return messages
 * ============================================================
 */
export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const { conversationId } = await params;

  /**
   * ----------------------------------------------------------
   * 1. Create server-side Supabase admin client
   * ----------------------------------------------------------
   */
  const supabase = createSupabaseAdminClient();

    /**
   * ----------------------------------------------------------
   * 2. Verify conversation exists
   * ----------------------------------------------------------
   */
  const {
    data: conversation,
    error: conversationError,
  } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError) {
    console.error(
      "Failed to load conversation:",
      conversationError,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load conversation",
      },
      { status: 500 },
    );
  }

  if (!conversation) {
    return NextResponse.json(
      {
        success: false,
        message: "Conversation not found",
      },
      { status: 404 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 2. Read messages from Database
   * ----------------------------------------------------------
   *
   * Only return messages belonging to this conversation.
   *
   * ascending = oldest → newest
   */
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, sender_id, content, status, created_at",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", {
      ascending: true,
    });

  /**
   * ----------------------------------------------------------
   * 3. Handle Database error
   * ----------------------------------------------------------
   */
  if (error) {
    console.error(
      "Failed to load messages:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load messages",
      },
      { status: 500 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. Convert Database rows → Frontend Message format
   * ----------------------------------------------------------
   */
  const messages = data.map((message) => ({
    id: message.id,
    sender:
      message.sender_id === "me"
        ? ("me" as const)
        : ("other" as const),
    text: message.content,
    time: new Date(
      message.created_at,
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    status: message.status as
      | "sent"
      | "delivered"
      | "read",
  }));

  /**
   * ----------------------------------------------------------
   * 5. Return messages
   * ----------------------------------------------------------
   */
  return NextResponse.json({
    success: true,
    data: messages,
  });
}

/**
 * ============================================================
 * POST / CREATE MESSAGE
 * ============================================================
 *
 * Flow:
 *
 * 1. Get conversationId
 * 2. Validate conversation
 * 3. Read text from request
 * 4. Validate text
 * 5. Insert message into Supabase
 * 6. Return saved message
 * ============================================================
 */
export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  const { conversationId } = await params;

  /**
   * ----------------------------------------------------------
   * 1. Check conversation
   * ----------------------------------------------------------
   */
  const supabase = createSupabaseAdminClient();

const { data: conversation, error: conversationError } =
  await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .maybeSingle();

if (conversationError) {
  console.error(
    "Failed to load conversation:",
    conversationError,
  );

  return NextResponse.json(
    {
      success: false,
      message: "Failed to load conversation",
    },
    { status: 500 },
  );
}

if (!conversation) {
  return NextResponse.json(
    {
      success: false,
      message: "Conversation not found",
    },
    { status: 404 },
  );
}

  /**
   * ----------------------------------------------------------
   * 2. Read request body
   * ----------------------------------------------------------
   */
  const body = await request.json();

  const text =
    typeof body.text === "string"
      ? body.text.trim()
      : "";

  /**
   * ----------------------------------------------------------
   * 3. Validate message text
   * ----------------------------------------------------------
   */
  if (!text) {
    return NextResponse.json(
      {
        success: false,
        message: "Message text is required",
      },
      { status: 400 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 5. Save message into Database
   * ----------------------------------------------------------
   */
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: "me",
      content: text,
      status: "sent",
    })
    .select(
      "id, conversation_id, sender_id, content, status, created_at",
    )
    .single();

  /**
   * ----------------------------------------------------------
   * 6. Handle Database error
   * ----------------------------------------------------------
   */
  if (error) {
    console.error(
      "Failed to save message:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save message",
      },
      { status: 500 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 7. Convert Database row → Frontend Message format
   * ----------------------------------------------------------
   */
  const savedMessage = {
    id: data.id,
    sender: "me" as const,
    text: data.content,
    time: new Date(
      data.created_at,
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    status: data.status as
      | "sent"
      | "delivered"
      | "read",
  };

  /**
   * ----------------------------------------------------------
   * 8. Return saved message
   * ----------------------------------------------------------
   */
  return NextResponse.json(
    {
      success: true,
      data: savedMessage,
    },
    { status: 201 },
  );
}