import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    conversationId: string;
  }>;
}

/* ============================================================
 * GET ALL REACTIONS FOR A CONVERSATION
 *
 * GET /api/conversations/:conversationId/reactions
 *
 * Loads reactions for all messages with ONE request.
 * ============================================================ */

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const user = await requireUser();

  /* ----------------------------------------------------------
   * 1. Authentication
   * ---------------------------------------------------------- */

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required",
      },
      { status: 401 },
    );
  }

  const { conversationId } = await params;

  const supabase = createSupabaseAdminClient();

  /* ----------------------------------------------------------
   * 2. Verify conversation membership
   * ---------------------------------------------------------- */

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    console.error(
      "Failed to verify conversation membership:",
      membershipError,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify conversation access",
      },
      { status: 500 },
    );
  }

  if (!membership) {
    return NextResponse.json(
      {
        success: false,
        message: "Conversation access denied",
      },
      { status: 403 },
    );
  }

  /* ----------------------------------------------------------
   * 3. Get message IDs for this conversation
   * ---------------------------------------------------------- */

  const {
    data: messages,
    error: messagesError,
  } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId);

  if (messagesError) {
    console.error(
      "Failed to load conversation messages:",
      messagesError,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load conversation messages",
      },
      { status: 500 },
    );
  }

  const messageIds = (messages ?? []).map(
    (message) => message.id,
  );

  if (messageIds.length === 0) {
    return NextResponse.json({
      success: true,
      data: {},
    });
  }

  /* ----------------------------------------------------------
   * 4. Load all reactions in ONE database query
   * ---------------------------------------------------------- */

  const {
    data: reactionRows,
    error: reactionsError,
  } = await supabase
    .from("message_reactions")
    .select(
      "message_id, emoji, user_id, created_at",
    )
    .in("message_id", messageIds)
    .order("created_at", {
      ascending: true,
    });

  if (reactionsError) {
    console.error(
      "Failed to load conversation reactions:",
      reactionsError,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load conversation reactions",
      },
      { status: 500 },
    );
  }

  /* ----------------------------------------------------------
   * 5. Group reactions by message
   * ---------------------------------------------------------- */

  const grouped: Record<
    string,
    Record<
      string,
      {
        emoji: string;
        count: number;
        reacted: boolean;
      }
    >
  > = {};

  for (const reaction of reactionRows ?? []) {
    if (!grouped[reaction.message_id]) {
      grouped[reaction.message_id] = {};
    }

    const existing =
      grouped[reaction.message_id][reaction.emoji];

    if (existing) {
      existing.count += 1;

      if (reaction.user_id === user.id) {
        existing.reacted = true;
      }

      continue;
    }

    grouped[reaction.message_id][reaction.emoji] = {
      emoji: reaction.emoji,
      count: 1,
      reacted: reaction.user_id === user.id,
    };
  }

  /* ----------------------------------------------------------
   * 6. Convert to frontend format
   * ---------------------------------------------------------- */

  const data: Record<
    string,
    {
      emoji: string;
      count: number;
      reacted: boolean;
    }[]
  > = {};

  for (const [messageId, emojiMap] of Object.entries(
    grouped,
  )) {
    data[messageId] = Object.values(emojiMap);
  }

  return NextResponse.json({
    success: true,
    data,
  });
}
