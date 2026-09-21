import { describe, expect, it, vi } from "vitest";

import {
  broadcastTyping,
  subscribeToTyping,
} from "../typing";

const sendMock = vi.fn();

const channelMock = {
  send: sendMock,
  on: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
};

const createChannelMock = vi.fn(() => channelMock);

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    channel: createChannelMock,
  }),
}));

describe("broadcastTyping", () => {
  it("broadcasts the typing state", async () => {
  await broadcastTyping(
    channelMock,
    "user-1",
    true,
  );

  expect(sendMock).toHaveBeenCalledWith({
    type: "broadcast",
    event: "typing",
    payload: {
      userId: "user-1",
      isTyping: true,
    },
  });
});
});

describe("subscribeToTyping", () => {
  it("listens for typing broadcasts", () => {
    const onTyping = vi.fn();

    subscribeToTyping("sopheak", "user-1", onTyping);

    expect(channelMock.on).toHaveBeenCalledWith(
      "broadcast",
      { event: "typing" },
      expect.any(Function),
    );

    const handler = channelMock.on.mock.calls[0][2];

    handler({
      payload: {
        userId: "user-2",
        isTyping: true,
      },
    });

    expect(onTyping).toHaveBeenCalledWith(true);
  });
});

  it("ignores typing broadcasts from the current user", () => {
  const onTyping = vi.fn();

  subscribeToTyping("sopheak", "user-1", onTyping);

  const handler =
    channelMock.on.mock.calls[channelMock.on.mock.calls.length - 1][2];

  handler({
    payload: {
      userId: "user-1",
      isTyping: true,
    },
  });

  expect(onTyping).not.toHaveBeenCalled();
});