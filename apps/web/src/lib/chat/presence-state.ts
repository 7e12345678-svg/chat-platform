import type { UserPresence } from "@/components/layout/ChatArea";

interface PresenceEntry {
  userId?: string;
  onlineAt?: string;
}

type PresenceState = Record<
  string,
  PresenceEntry[]
>;

export function getRemotePresence(
  state: PresenceState,
  currentUserId: string,
): UserPresence {
  const hasRemoteUser = Object.entries(state).some(
    ([userId, entries]) =>
      userId !== currentUserId &&
      entries.length > 0,
  );

  if (hasRemoteUser) {
    return {
      status: "online",
    };
  }

  return {
    status: "offline",
  };
}

  export function getCurrentUserPresence(
  state: PresenceState,
  currentUserId: string,
): UserPresence {
  const entries = state[currentUserId];

  if (entries && entries.length > 0) {
    return {
      status: "online",
    };
  }

  return {
    status: "offline",
  };
}