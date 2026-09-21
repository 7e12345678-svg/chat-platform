import type { Message } from "@/components/layout/ChatArea";

interface RealtimeMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  status: "sent" | "delivered" | "read";
  created_at: string;
}

export function appendMessage(
  messages: Message[],
  message: Message,
): Message[] {
  if (messages.some((item) => item.id === message.id)) {
    return messages;
  }

  return [...messages, message];
}

export function upsertMessage(
  messages: Message[],
  message: Message,
): Message[] {
  const existingIndex = messages.findIndex(
    (item) => item.id === message.id,
  );

  if (existingIndex === -1) {
    return [...messages, message];
  }

  return messages.map((item) =>
    item.id === message.id ? message : item,
  );
}

export function mapRealtimeMessage(
  message: RealtimeMessage,
  currentUserId?: string,
): Message {
  return {
    id: message.id,

    sender:
      message.sender_id === "me" ||
      (
        currentUserId !== undefined &&
        message.sender_id === currentUserId
      )
        ? "me"
        : "other",

    text: message.content,

    time: new Date(
      message.created_at,
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),

    status: message.status,
  };
}