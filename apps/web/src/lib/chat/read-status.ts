// ==========================================================
// Message Read / Seen Status
// ==========================================================

export type MessageReadStatus =
  | "sent"
  | "delivered"
  | "read";

interface MessageWithStatus {
  id: string;
  sender?: "me" | "other";
  status?: MessageReadStatus;
}

// ----------------------------------------------------------
// Mark a message as read
// ----------------------------------------------------------
export function markMessageAsRead(
  message: MessageWithStatus,
): MessageWithStatus {
  return {
    ...message,
    status: "read",
  };
}

// ----------------------------------------------------------
// Check whether a message has been read
// ----------------------------------------------------------
export function isMessageRead(
  message: MessageWithStatus,
): boolean {
  return message.status === "read";
}

  export function getUnreadIncomingMessageIds(
  messages: MessageWithStatus[],
): string[] {
  return messages
    .filter(
      (message) =>
        message.sender === "other" &&
        (message.status === "sent" ||
          message.status === "delivered"),
    )
    .map((message) => message.id);
}