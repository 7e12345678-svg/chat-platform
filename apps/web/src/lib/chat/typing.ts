import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface TypingPayload {
  userId: string;
  isTyping: boolean;
}

export async function broadcastTyping(
  channel: Pick<
    ReturnType<
      ReturnType<typeof createSupabaseBrowserClient>["channel"]
    >,
    "send"
  >,
  userId: string,
  isTyping: boolean,
){
  await channel.send({
    type: "broadcast",
    event: "typing",
    payload: {
      userId,
      isTyping,
    },
  });
}

export function subscribeToTyping(
  conversationId: string,
  userId: string,
  onTyping: (isTyping: boolean) => void,
) {
  const supabase = createSupabaseBrowserClient();
  const channel = supabase.channel(`typing:${conversationId}`);

  channel.on(
  "broadcast",
  { event: "typing" },
  (payload) => {
    const typingPayload = payload.payload as TypingPayload;

    // Ignore typing events sent by the current user.
    if (typingPayload.userId === userId) {
      return;
    }

    onTyping(Boolean(typingPayload.isTyping));
  },
);

  channel.subscribe();

  return channel;
}