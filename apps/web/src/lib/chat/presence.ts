import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function getCurrentUserId() {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export function subscribeToPresence(
  conversationId: string,
  userId: string,
  onPresenceChange: (state: unknown) => void,
) {

  const supabase = createSupabaseBrowserClient();

const existingChannel = supabase
  .getChannels()
  .find(
    (item) =>
      item.topic ===
      `realtime:presence:${conversationId}`,
  );

if (existingChannel) {
  void supabase.removeChannel(
    existingChannel,
  );
}

const channel = supabase.channel(
    `presence:${conversationId}`,
    {
      config: {
        presence: {
          key: userId,
        },
      },
    },
  );

  channel.on(
    "presence",
    {
      event: "sync",
    },
    () => {
      onPresenceChange(
        channel.presenceState(),
      );
    },
  );

  channel.subscribe(() => {
    channel.track({
      userId,
      onlineAt: new Date().toISOString(),
    });
  });

  return channel;
}
