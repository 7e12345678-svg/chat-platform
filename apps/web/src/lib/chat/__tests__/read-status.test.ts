import { describe, expect, it } from "vitest";
import {
  markMessageAsRead,
  isMessageRead,
  getUnreadIncomingMessageIds,
} from "@/lib/chat/read-status";

describe("read-status", () => {
  it("marks a message as read", () => {
    const message = {
      id: "message-1",
      status: "delivered" as const,
    };

    const result = markMessageAsRead(message);

    expect(result).toEqual({
      ...message,
      status: "read",
    });
  });

  it("detects a read message", () => {
    expect(
      isMessageRead({
        id: "message-1",
        status: "read",
      }),
    ).toBe(true);
  });

  it("detects an unread message", () => {
    expect(
      isMessageRead({
        id: "message-1",
        status: "delivered",
      }),
    ).toBe(false);
  });
});

 it("gets unread incoming message ids", () => {
  const messages = [
    {
      id: "message-1",
      sender: "other" as const,
      status: "sent" as const,
    },
    {
      id: "message-2",
      sender: "other" as const,
      status: "read" as const,
    },
    {
      id: "message-3",
      sender: "me" as const,
      status: "sent" as const,
    },
    {
      id: "message-4",
      sender: "other" as const,
      status: "delivered" as const,
    },
  ];

  const result = getUnreadIncomingMessageIds(messages);

  expect(result).toEqual([
    "message-1",
    "message-4",
  ]);
});