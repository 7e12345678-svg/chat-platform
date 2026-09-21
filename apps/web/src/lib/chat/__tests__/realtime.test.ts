import { describe, expect, it, vi } from "vitest";

import { subscribeToMessages } from "../realtime";

const subscribeMock = vi.fn();

const channel = {
  on: vi.fn(),
  subscribe: subscribeMock,
};

const onMock = channel.on;

onMock.mockImplementation(
  (
    _event: string,
    _config: object,
    _callback: (payload: {
      eventType: string;
      new: Record<string, unknown>;
    }) => void,
  ) => channel,
);

const channelMock = vi.fn(() => channel);

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    channel: channelMock,
  }),
}));

describe("subscribeToMessages", () => {
  it("subscribes to new messages for the selected conversation", () => {
    const onMessage = vi.fn();

    subscribeToMessages("sopheak", onMessage);

    expect(channelMock).toHaveBeenCalled();

    expect(onMock).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: "conversation_id=eq.sopheak",
      },
      expect.any(Function),
    );

    expect(subscribeMock).toHaveBeenCalled();
  });

  it("passes the inserted message to onMessage", () => {
    const onMessage = vi.fn();

    subscribeToMessages("sopheak", onMessage);

    const callback = onMock.mock.calls[0][2];

    const message = {
      id: "message-1",
      conversation_id: "sopheak",
      sender_id: "user-1",
      content: "Hello realtime",
      status: "sent",
    };

    callback({
      eventType: "INSERT",
      new: message,
    });

    expect(onMessage).toHaveBeenCalledWith(message);
  });
});

  it("passes an updated message to onMessage", () => {
  const onMessage = vi.fn();

  subscribeToMessages("sopheak", onMessage);

  const callback = onMock.mock.calls[0][2];

  const message = {
    id: "message-1",
    conversation_id: "sopheak",
    sender_id: "user-1",
    content: "Hello realtime",
    status: "read",
  };

  callback({
    eventType: "UPDATE",
    new: message,
  });

  expect(onMessage).toHaveBeenCalledWith(message);
});

  it("subscribes to updated messages for the selected conversation", () => {
  const onMessage = vi.fn();

  subscribeToMessages("sopheak", onMessage);

  expect(onMock).toHaveBeenCalledWith(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "messages",
      filter: "conversation_id=eq.sopheak",
    },
    expect.any(Function),
  );
});