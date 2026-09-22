export type DeliveryMessageStatus =
  | "sent"
  | "delivered"
  | "read";

interface MessageWithDeliveryStatus {
  id: string;
  sender: "me" | "other";
  status?: DeliveryMessageStatus;
}

export function getUndeliveredIncomingMessageIds(
  messages: MessageWithDeliveryStatus[],
): string[] {
  return messages
    .filter(
      (message) =>
        message.sender === "other" &&
        message.status === "sent",
    )
    .map((message) => message.id);
}

  export async function markMessagesAsDelivered(
  conversationId: string,
  messageIds: string[],
): Promise<void> {
  if (messageIds.length === 0) {
    return;
  }

  const response = await fetch(
    `/api/conversations/${conversationId}/messages`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageIds,
        status: "delivered",
      }),
    },
  );

  if (!response.ok) {
    const errorData =
      await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        "Failed to mark messages as delivered",
    );
  }
}
