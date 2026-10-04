import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * ============================================================
 * MESSAGE REACTIONS API
 * ============================================================
 *
 * GET    → Get reactions for a message
 * POST   → Add a reaction
 * DELETE → Remove my reaction
 *
 * Route:
 * /api/conversations/[conversationId]/messages/[messageId]/reactions
 * ============================================================
 */

interface RouteContext {
  params: Promise<{
    conversationId: string;
    messageId: string;
  }>;
}

/**
 * ============================================================
 * ALLOWED REACTIONS
 * ============================================================
 *
 * Keep the first version limited to the reactions already
 * used by the chat UI.
 * ============================================================
 */

const ALLOWED_REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🔥",
] as const;

type AllowedReaction = (typeof ALLOWED_REACTIONS)[number];

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

/**
 * Check whether an emoji is supported.
 */
function isAllowedReaction(
  emoji: unknown,
): emoji is AllowedReaction {
  return (
    typeof emoji === "string" &&
    ALLOWED_REACTIONS.includes(
      emoji as AllowedReaction,
    )
  );
}

/**
 * ============================================================
 * VERIFY MESSAGE ACCESS
 * ============================================================
 *
 * Make sure:
 * 1. Message exists
 * 2. Message belongs to conversation
 * 3. Current user belongs to conversation
 * ============================================================
 */

async function verifyMessageAccess(
  conversationId: string,
  messageId: string,
  userId: string,
) {
  const supabase =
    createSupabaseAdminClient();

  /**
   * ----------------------------------------------------------
   * 1. Load message
   * ----------------------------------------------------------
   */

  const {
    data: message,
    error: messageError,
  } = await supabase
    .from("messages")
    .select(
      "id, conversation_id",
    )
    .eq("id", messageId)
    .eq(
      "conversation_id",
      conversationId,
    )
    .maybeSingle();

  if (messageError) {
    console.error(
      "Failed to load message:",
      messageError,
    );

    return {
      ok: false as const,
      status: 500,
      message:
        "Failed to load message",
    };
  }

  if (!message) {
    return {
      ok: false as const,
      status: 404,
      message:
        "Message not found",
    };
  }

  /**
   * ----------------------------------------------------------
   * 2. Verify conversation membership
   * ----------------------------------------------------------
   */

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from(
      "conversation_members",
    )
    .select("conversation_id")
    .eq(
      "conversation_id",
      conversationId,
    )
    .eq(
      "user_id",
      userId,
    )
    .maybeSingle();

  if (membershipError) {
    console.error(
      "Failed to verify conversation membership:",
      membershipError,
    );

    return {
      ok: false as const,
      status: 500,
      message:
        "Failed to verify conversation membership",
    };
  }

  if (!membership) {
    return {
      ok: false as const,
      status: 403,
      message:
        "You are not a member of this conversation",
    };
  }

  return {
    ok: true as const,
  };
}

/**
 * ============================================================
 * GET / REACTIONS
 * ============================================================
 */

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  /**
   * ----------------------------------------------------------
   * 1. Authentication
   * ----------------------------------------------------------
   */

  const user = await requireUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Authentication required",
      },
      { status: 401 },
    );
  }

  const {
    conversationId,
    messageId,
  } = await params;

  /**
   * ----------------------------------------------------------
   * 2. Verify access
   * ----------------------------------------------------------
   */

  const access =
    await verifyMessageAccess(
      conversationId,
      messageId,
      user.id,
    );

  if (!access.ok) {
    return NextResponse.json(
      {
        success: false,
        message: access.message,
      },
      { status: access.status },
    );
  }

  /**
   * ----------------------------------------------------------
   * 3. Load reactions
   * ----------------------------------------------------------
   */

  const supabase =
    createSupabaseAdminClient();

  const {
    data: reactions,
    error,
  } = await supabase
    .from("message_reactions")
    .select(
      "id, message_id, user_id, emoji, created_at",
    )
    .eq(
      "message_id",
      messageId,
    )
    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  if (error) {
    console.error(
      "Failed to load message reactions:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load message reactions",
      },
      { status: 500 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. Convert rows → reaction summary
   * ----------------------------------------------------------
   */

  const summary =
    ALLOWED_REACTIONS.map(
      (emoji) => {
        const emojiReactions =
          reactions.filter(
            (reaction) =>
              reaction.emoji ===
              emoji,
          );

        return {
          emoji,
          count:
            emojiReactions.length,
          reacted:
            emojiReactions.some(
              (reaction) =>
                reaction.user_id ===
                user.id,
            ),
        };
      },
    ).filter(
      (reaction) =>
        reaction.count > 0,
    );

  return NextResponse.json({
    success: true,
    data: summary,
  });
}

/**
 * ============================================================
 * POST / ADD REACTION
 * ============================================================
 */

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  /**
   * ----------------------------------------------------------
   * 1. Authentication
   * ----------------------------------------------------------
   */

  const user = await requireUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Authentication required",
      },
      { status: 401 },
    );
  }

  const {
    conversationId,
    messageId,
  } = await params;

  /**
   * ----------------------------------------------------------
   * 2. Read request body
   * ----------------------------------------------------------
   */

  const body =
    await request.json();

  const emoji = body?.emoji;

  /**
   * ----------------------------------------------------------
   * 3. Validate emoji
   * ----------------------------------------------------------
   */

  if (!isAllowedReaction(emoji)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Unsupported reaction",
      },
      { status: 400 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. Verify access
   * ----------------------------------------------------------
   */

  const access =
    await verifyMessageAccess(
      conversationId,
      messageId,
      user.id,
    );

  if (!access.ok) {
    return NextResponse.json(
      {
        success: false,
        message: access.message,
      },
      { status: access.status },
    );
  }

  /**
   * ----------------------------------------------------------
   * 5. Insert reaction
   * ----------------------------------------------------------
   */

  const supabase =
    createSupabaseAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from("message_reactions")
    .insert({
      message_id:
        messageId,
      user_id: user.id,
      emoji,
    })
    .select(
      "id, message_id, user_id, emoji, created_at",
    )
    .single();

  /**
   * ----------------------------------------------------------
   * 6. Handle duplicate reaction
   * ----------------------------------------------------------
   */

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reaction already exists",
        },
        { status: 409 },
      );
    }

    console.error(
      "Failed to add message reaction:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to add message reaction",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 201 },
  );
}

/**
 * ============================================================
 * DELETE / REMOVE MY REACTION
 * ============================================================
 */

export async function DELETE(
  request: Request,
  { params }: RouteContext,
) {
  /**
   * ----------------------------------------------------------
   * 1. Authentication
   * ----------------------------------------------------------
   */

  const user = await requireUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Authentication required",
      },
      { status: 401 },
    );
  }

  const {
    conversationId,
    messageId,
  } = await params;

  /**
   * ----------------------------------------------------------
   * 2. Read emoji
   * ----------------------------------------------------------
   */

  const body =
    await request.json();

  const emoji = body?.emoji;

  if (!isAllowedReaction(emoji)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Unsupported reaction",
      },
      { status: 400 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 3. Verify access
   * ----------------------------------------------------------
   */

  const access =
    await verifyMessageAccess(
      conversationId,
      messageId,
      user.id,
    );

  if (!access.ok) {
    return NextResponse.json(
      {
        success: false,
        message: access.message,
      },
      { status: access.status },
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. Delete only my reaction
   * ----------------------------------------------------------
   */

  const supabase =
    createSupabaseAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from("message_reactions")
    .delete()
    .eq(
      "message_id",
      messageId,
    )
    .eq(
      "user_id",
      user.id,
    )
    .eq(
      "emoji",
      emoji,
    )
    .select(
      "id, message_id, user_id, emoji",
    );

  if (error) {
    console.error(
      "Failed to remove message reaction:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to remove message reaction",
      },
      { status: 500 },
    );
  }

  if (data.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Reaction not found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}