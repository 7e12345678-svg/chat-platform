import { describe, expect, it } from "vitest";

import {
  appendMessage,
  mapRealtimeMessage,
  upsertMessage,
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

describe("upsertMessage", () => {
  const existingMessage = {
    id: "message-1",
    sender: "me" as const,
    text: "Hello",
    time: "3:00 PM",
    status: "sent" as const,
  };

  it("updates an existing message", () => {
    const updatedMessage = {
      ...existingMessage,
      status: "read" as const,
    };

    const result = upsertMessage(
      [existingMessage],
      updatedMessage,
    );

    expect(result).toEqual([updatedMessage]);
  });

  it("adds a message when it does not exist", () => {
    const newMessage = {
      id: "message-2",
      sender: "other" as const,
      text: "New message",
      time: "3:01 PM",
      status: "sent" as const,
    };

    const result = upsertMessage(
      [existingMessage],
      newMessage,
    );

    expect(result).toEqual([
      existingMessage,
      newMessage,
    ]);
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

it("maps the current user's realtime message to me using user id", () => {
  const message = {
    id: "msg-uuid-1",
    conversation_id: "sopheak",
    sender_id: "user-123",
    content: "Hello realtime",
    status: "sent" as const,
    created_at: "2026-09-21T04:00:00.000Z",
  };

  const result = mapRealtimeMessage(
    message,
    "user-123",
  );

  expect(result.sender).toBe("me");
});
