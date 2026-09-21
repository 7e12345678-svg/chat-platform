import { describe, expect, it, vi } from "vitest";

import {
  getCurrentUserId,
  subscribeToPresence,
} from "../presence";

const subscribeMock = vi.fn(
  (callback: (status: string) => void) => {
    callback("SUBSCRIBED");
  },
);

const trackMock = vi.fn();

const presenceStateMock = vi.fn(() => ({
  "user-1": [
    {
      userId: "user-1",
      onlineAt: "2026-09-17T08:00:00.000Z",
    },
  ],
}));

const presenceChannel = {
  on: vi.fn(),
  subscribe: subscribeMock,
  track: trackMock,
  untrack: vi.fn(),
  presenceState: presenceStateMock,
};

const channelMock = vi.fn(
  () => presenceChannel,
);

const getChannelsMock = vi.fn(
  () => [] as Array<{ topic: string }>,
);

const removeChannelMock = vi.fn();

const getUserMock = vi.fn(
  async (): Promise<{
    data: {
      user: {
        id: string;
      } | null;
    };
    error: null;
  }> => ({
    data: {
      user: {
        id: "user-1",
      },
    },
    error: null,
  }),
);

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    channel: channelMock,
    getChannels: getChannelsMock,
    removeChannel: removeChannelMock,

    auth: {
      getUser: getUserMock,
    },
  }),
}));

describe("subscribeToPresence", () => {
  it("creates a presence channel for the conversation", () => {
    subscribeToPresence(
      "sopheak",
      "user-1",
      vi.fn(),
    );

    expect(channelMock).toHaveBeenCalledWith(
      "presence:sopheak",
      {
        config: {
          presence: {
            key: "user-1",
          },
        },
      },
    );
  });

  it("removes an existing presence channel before subscribing again", () => {
    getChannelsMock.mockReturnValue([
      {
        topic:
          "realtime:presence:sopheak",
      },
    ]);

    subscribeToPresence(
      "sopheak",
      "user-1",
      vi.fn(),
    );

    expect(
      removeChannelMock,
    ).toHaveBeenCalled();
  });

  it("tracks the current user as online", () => {
    subscribeToPresence(
      "sopheak",
      "user-1",
      vi.fn(),
    );

    expect(trackMock).toHaveBeenCalledWith({
      userId: "user-1",
      onlineAt: expect.any(String),
    });
  });

  it("reports the latest presence state when presence sync occurs", () => {
    const onPresenceChange = vi.fn();

    subscribeToPresence(
      "sopheak",
      "user-1",
      onPresenceChange,
    );

    const syncHandler =
      presenceChannel.on.mock.calls.find(
        ([event, config]) =>
          event === "presence" &&
          config?.event === "sync",
      )?.[2];

    expect(syncHandler).toEqual(
      expect.any(Function),
    );

    syncHandler();

    expect(
      presenceStateMock,
    ).toHaveBeenCalled();

    expect(
      onPresenceChange,
    ).toHaveBeenCalledWith({
      "user-1": [
        {
          userId: "user-1",
          onlineAt:
            "2026-09-17T08:00:00.000Z",
        },
      ],
    });
  });
});

describe("getCurrentUserId", () => {
  it("gets the authenticated user id", async () => {
    expect(
      await getCurrentUserId(),
    ).toBe("user-1");
  });

  it("returns null when there is no authenticated user", async () => {
    getUserMock.mockImplementationOnce(
      async () => ({
        data: {
          user: null,
        },
        error: null,
      }),
    );

    expect(
      await getCurrentUserId(),
    ).toBeNull();
  });
});