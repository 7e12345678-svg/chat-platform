import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type RealtimeMessage = Record<string, unknown>;

export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: RealtimeMessage) => void,
) {
  const supabase = createSupabaseBrowserClient();

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new);
      },
    );

  channel.subscribe();

  return channel;
}