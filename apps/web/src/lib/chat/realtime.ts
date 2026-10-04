import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import type {
  RealtimePostgresChangesPayload,
  REALTIME_SUBSCRIBE_STATES,
} from "@supabase/supabase-js";

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  status: "sent" | "delivered" | "read";
  created_at: string;
}

interface MessageReactionRow {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

type RealtimeMessage = Record<string, unknown>;

/**
 * ============================================================
 * SUBSCRIBE TO MESSAGES
 *
 * Subscribe to INSERT + UPDATE events
 * for one conversation.
 * ============================================================
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: RealtimeMessage) => void,
) {
  const supabase =
    createSupabaseBrowserClient();

  const channelName =
    `messages:${conversationId}:${crypto.randomUUID()}`;

  const channel = supabase
    .channel(channelName)

    /* ======================================================
     * INSERT
     * ====================================================== */
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter:
          `conversation_id=eq.${conversationId}`,
      },
      (
        payload: RealtimePostgresChangesPayload<MessageRow>,
      ) => {
        console.log(
          "[Realtime INSERT]",
          payload.new,
        );

        onMessage(
          payload.new as RealtimeMessage,
        );
      },
    )

    /* ======================================================
     * UPDATE
     * ====================================================== */
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter:
          `conversation_id=eq.${conversationId}`,
      },
      (
        payload: RealtimePostgresChangesPayload<MessageRow>,
      ) => {
        console.log(
          "[Realtime UPDATE]",
          payload.new,
        );

        onMessage(
          payload.new as RealtimeMessage,
        );
      },
    );

  /* ========================================================
   * AUTHENTICATE REALTIME BEFORE SUBSCRIBE
   * ======================================================== */

  const connectRealtime = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error(
        "[Realtime AUTH] getSession failed:",
        error,
      );

      return;
    }

    console.log(
      "[Realtime AUTH]",
      {
        userId: session?.user?.id,
        hasAccessToken:
          Boolean(session?.access_token),
      },
    );

    if (!session?.access_token) {
      console.error(
        "[Realtime AUTH] No access token",
      );

      return;
    }

    /*
     * Force the current logged-in user's JWT
     * into Realtime before subscribing.
     */
    await supabase.realtime.setAuth(
      session.access_token,
    );

    channel.subscribe(
      (
        status: REALTIME_SUBSCRIBE_STATES,
      ) => {
        console.log(
          `[Realtime] message:${conversationId}`,
          status,
        );
      },
    );
  };

  void connectRealtime();

  return channel;
}

/**
 * ============================================================
 * SUBSCRIBE TO MESSAGE REACTIONS
 *
 * Watches INSERT + DELETE events for message_reactions.
 *
 * ChatArea receives the affected messageId and can reload
 * the reaction summary.
 * ============================================================
 */
export function subscribeToReactions(
  onReaction: (messageId?: string) => void,
) {
  const supabase =
    createSupabaseBrowserClient();

  const channelName =
    `message-reactions:${crypto.randomUUID()}`;

  const channel = supabase
    .channel(channelName)

    /* ======================================================
     * INSERT
     * ====================================================== */
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "message_reactions",
      },
      (
        payload: RealtimePostgresChangesPayload<MessageReactionRow>,
      ) => {
        const reaction =
          payload.new as MessageReactionRow;

        console.log(
          "[Realtime REACTION INSERT]",
          reaction,
        );

        onReaction(
          reaction.message_id,
        );
      },
    )

    /* ======================================================
     * DELETE
     * ====================================================== */
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "message_reactions",
      },
      (
        payload: RealtimePostgresChangesPayload<MessageReactionRow>,
      ) => {
        const reaction =
          payload.old as Partial<MessageReactionRow>;

        console.log(
          "[Realtime REACTION DELETE]",
          reaction,
        );

        onReaction(
          typeof reaction.message_id === "string"
            ? reaction.message_id
            : undefined,
        );
      },
    );

  /* ========================================================
   * AUTHENTICATE REALTIME BEFORE SUBSCRIBE
   * ======================================================== */

  const connectRealtime = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error(
        "[Realtime REACTION AUTH] getSession failed:",
        error,
      );

      return;
    }

    console.log(
      "[Realtime REACTION AUTH]",
      {
        userId: session?.user?.id,
        hasAccessToken:
          Boolean(session?.access_token),
      },
    );

    if (!session?.access_token) {
      console.error(
        "[Realtime REACTION AUTH] No access token",
      );

      return;
    }

    await supabase.realtime.setAuth(
      session.access_token,
    );

    channel.subscribe(
      (
        status: REALTIME_SUBSCRIBE_STATES,
      ) => {
        console.log(
          "[Realtime] message_reactions",
          status,
        );
      },
    );
  };

  void connectRealtime();

  return channel;
}