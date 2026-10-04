import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mockRequireUser = vi.hoisted(() => vi.fn());
const mockCreateSupabaseAdminClient = vi.hoisted(() =>
  vi.fn(),
);

vi.mock("@/lib/auth/requireUser", () => ({
  requireUser: mockRequireUser,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient:
    mockCreateSupabaseAdminClient,
}));

import { GET } from "./route";

interface QueryResult {
  data: unknown;
  error: unknown;
}

function createQueryMock(result: QueryResult) {
  const query: Record<string, unknown> = {};

  query.select = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.in = vi.fn(() => query);

  query.maybeSingle = vi.fn(async () => result);

  query.order = vi.fn(async () => result);

  query.then = (
    resolve: (value: QueryResult) => unknown,
    reject?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(resolve, reject);

  return query;
}

function setupSupabaseMock({
  membership = {
    data: { user_id: "test-user-id" },
    error: null,
  },
  messages = {
    data: [{ id: "message-1" }],
    error: null,
  },
  reactions = {
    data: [],
    error: null,
  },
}: {
  membership?: QueryResult;
  messages?: QueryResult;
  reactions?: QueryResult;
} = {}) {
  const membershipQuery = createQueryMock(
    membership,
  );

  const messagesQuery = createQueryMock(
    messages,
  );

  const reactionsQuery = createQueryMock(
    reactions,
  );

  const fromMock = vi.fn((table: string) => {
    switch (table) {
      case "conversation_members":
        return membershipQuery;

      case "messages":
        return messagesQuery;

      case "message_reactions":
        return reactionsQuery;

      default:
        throw new Error(
          `Unexpected table: ${table}`,
        );
    }
  });

  mockCreateSupabaseAdminClient.mockReturnValue({
    from: fromMock,
  });

  return {
    fromMock,
    membershipQuery,
    messagesQuery,
    reactionsQuery,
  };
}

function createRequest() {
  return new Request(
    "http://localhost:3000/api/conversations/sopheak/reactions",
    {
      method: "GET",
    },
  );
}

function createContext(
  conversationId = "sopheak",
) {
  return {
    params: Promise.resolve({
      conversationId,
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  mockRequireUser.mockResolvedValue({
    id: "test-user-id",
    email: "test@example.com",
  });
});

describe(
  "GET /api/conversations/[conversationId]/reactions",
  () => {
    it(
      "returns 401 when user is not authenticated",
      async () => {
        mockRequireUser.mockResolvedValueOnce(
          null,
        );

        const response = await GET(
          createRequest(),
          createContext(),
        );

        expect(response.status).toBe(401);

        const result = await response.json();

        expect(result.success).toBe(false);
        expect(result.message).toBe(
          "Authentication required",
        );
      },
    );

    it(
      "returns 403 when user is not a conversation member",
      async () => {
        setupSupabaseMock({
          membership: {
            data: null,
            error: null,
          },
        });

        const response = await GET(
          createRequest(),
          createContext(),
        );

        expect(response.status).toBe(403);

        const result = await response.json();

        expect(result.success).toBe(false);
        expect(result.message).toBe(
          "Conversation access denied",
        );
      },
    );

    it(
      "returns an empty object when conversation has no messages",
      async () => {
        setupSupabaseMock({
          messages: {
            data: [],
            error: null,
          },
        });

        const response = await GET(
          createRequest(),
          createContext(),
        );

        expect(response.status).toBe(200);

        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.data).toEqual({});
      },
    );

    it(
      "groups reactions by message and emoji",
      async () => {
        setupSupabaseMock({
          messages: {
            data: [
              { id: "message-1" },
              { id: "message-2" },
            ],
            error: null,
          },
          reactions: {
            data: [
              {
                message_id: "message-1",
                emoji: "❤️",
                user_id: "test-user-id",
                created_at:
                  "2026-10-04T06:00:00.000Z",
              },
              {
                message_id: "message-1",
                emoji: "❤️",
                user_id: "other-user-id",
                created_at:
                  "2026-10-04T06:01:00.000Z",
              },
              {
                message_id: "message-1",
                emoji: "😂",
                user_id: "other-user-id",
                created_at:
                  "2026-10-04T06:02:00.000Z",
              },
              {
                message_id: "message-2",
                emoji: "🔥",
                user_id: "other-user-id",
                created_at:
                  "2026-10-04T06:03:00.000Z",
              },
            ],
            error: null,
          },
        });

        const response = await GET(
          createRequest(),
          createContext(),
        );

        expect(response.status).toBe(200);

        const result = await response.json();

        expect(result.success).toBe(true);

        expect(result.data).toEqual({
          "message-1": [
            {
              emoji: "❤️",
              count: 2,
              reacted: true,
            },
            {
              emoji: "😂",
              count: 1,
              reacted: false,
            },
          ],
          "message-2": [
            {
              emoji: "🔥",
              count: 1,
              reacted: false,
            },
          ],
        });
      },
    );
  },
);