import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

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

const getSessionMock = vi.fn();

const setAuthMock = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    channel: channelMock,

    auth: {
      getSession: getSessionMock,
    },

    realtime: {
      setAuth: setAuthMock,
    },
  }),
}));

describe("subscribeToMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getSessionMock.mockResolvedValue({
      data: {
        session: {
          access_token: "test-access-token",
          user: {
            id: "user-1",
          },
        },
      },
      error: null,
    });

    setAuthMock.mockResolvedValue(undefined);
  });

  it("subscribes to new messages for the selected conversation", async () => {
    const onMessage = vi.fn();

    subscribeToMessages(
      "sopheak",
      onMessage,
    );

    expect(channelMock).toHaveBeenCalled();

    expect(onMock).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter:
          "conversation_id=eq.sopheak",
      },
      expect.any(Function),
    );

    /*
     * Realtime auth is async:
     * getSession() → setAuth() → subscribe()
     */
    await new Promise((resolve) =>
      setTimeout(resolve, 0),
    );

    expect(getSessionMock).toHaveBeenCalled();

    expect(setAuthMock).toHaveBeenCalledWith(
      "test-access-token",
    );

    expect(subscribeMock).toHaveBeenCalled();
  });

  it("passes the inserted message to onMessage", () => {
    const onMessage = vi.fn();

    subscribeToMessages(
      "sopheak",
      onMessage,
    );

    const insertCallback =
      onMock.mock.calls[0][2];

    const message = {
      id: "message-1",
      conversation_id: "sopheak",
      sender_id: "user-1",
      content: "Hello realtime",
      status: "sent",
    };

    insertCallback({
      eventType: "INSERT",
      new: message,
    });

    expect(onMessage).toHaveBeenCalledWith(
      message,
    );
  });

  it("passes an updated message to onMessage", () => {
    const onMessage = vi.fn();

    subscribeToMessages(
      "sopheak",
      onMessage,
    );

    const updateCallback =
      onMock.mock.calls[1][2];

    const message = {
      id: "message-1",
      conversation_id: "sopheak",
      sender_id: "user-1",
      content: "Hello realtime",
      status: "read",
    };

    updateCallback({
      eventType: "UPDATE",
      new: message,
    });

    expect(onMessage).toHaveBeenCalledWith(
      message,
    );
  });

  it("subscribes to updated messages for the selected conversation", () => {
    const onMessage = vi.fn();

    subscribeToMessages(
      "sopheak",
      onMessage,
    );

    expect(onMock).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter:
          "conversation_id=eq.sopheak",
      },
      expect.any(Function),
    );
  });
});