import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RealtimeMessage = Record<string, unknown>;

/**
 * Subscribe to INSERT and UPDATE events
 * for a specific conversation.
 *
 * IMPORTANT:
 * A NEW realtime channel is created every time
 * this function is called.
 *
 * This prevents React Strict Mode and conversation
 * switching from reusing an already-unsubscribed channel.
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: RealtimeMessage) => void,
) {
  // Create the Supabase browser client using the
  // existing helper from this project.
  const supabase = createSupabaseBrowserClient();

  /**
   * Create a unique channel name.
   *
   * Example:
   * messages:sopheak:xxxxxxxx
   */
  const channelName =
    `messages:${conversationId}:${crypto.randomUUID()}`;

  /**
   * Create a completely new channel.
   */
  const channel = supabase
    .channel(channelName)

    /**
     * NEW MESSAGE
     */
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(
          payload.new as RealtimeMessage,
        );
      },
    )

    /**
     * MESSAGE UPDATED
     *
     * Example:
     * sent -> delivered
     * delivered -> read
     */
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(
          payload.new as RealtimeMessage,
        );
      },
    );

  /**
   * Start the realtime subscription.
   */
  channel.subscribe();

  /**
   * Return the channel.
   *
   * page.tsx will call:
   *
   * channel.unsubscribe();
   *
   * during cleanup.
   */
  return channel;
}