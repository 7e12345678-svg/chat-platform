import { describe, expect, it } from "vitest";

import {
  appendMessage,
  mapRealtimeMessage,
} from "../messages";

describe("appendMessage", () => {
  const existingMessage = {
    id: "message-1",
    sender: "me" as const,
    text: "Hello",
    time: "3:00 PM",
    status: "sent" as const,
  };

  it("appends a new message", () => {
    const result = appendMessage([], existingMessage);

    expect(result).toEqual([existingMessage]);
  });

  it("does not append a duplicate message", () => {
    const result = appendMessage(
      [existingMessage],
      existingMessage,
    );

    expect(result).toEqual([existingMessage]);
  });
});

describe("mapRealtimeMessage", () => {
  it("maps a database message to frontend Message format", () => {
    const result = mapRealtimeMessage({
      id: "message-2",
      conversation_id: "sopheak",
      sender_id: "user-2",
      content: "Hello realtime",
      status: "sent",
      created_at: "2026-09-17T08:15:00.000Z",
    });

    expect(result).toEqual({
      id: "message-2",
      sender: "other",
      text: "Hello realtime",
      time: expect.any(String),
      status: "sent",
    });
  });

  it("maps sender_id me to me", () => {
    const result = mapRealtimeMessage({
      id: "message-3",
      conversation_id: "sopheak",
      sender_id: "me",
      content: "My message",
      status: "sent",
      created_at: "2026-09-17T08:20:00.000Z",
    });

    expect(result.sender).toBe("me");
  });
});
