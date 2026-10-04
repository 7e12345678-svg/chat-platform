import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  DELETE,
  GET,
  POST,
} from "./route";

const {
  requireUserMock,
  createSupabaseAdminClientMock,
} =
  vi.hoisted(() => ({
    requireUserMock: vi.fn(),
    createSupabaseAdminClientMock:
      vi.fn(),
  }));

vi.mock("@/lib/auth/requireUser", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient:
    createSupabaseAdminClientMock,
}));

const messageId =
  "11111111-1111-1111-1111-111111111111";

function makeParams() {
  return {
    params: Promise.resolve({
      conversationId: "conversation-1",
      messageId,
    }),
  };
}

function createSupabaseMock() {
  const messageMaybeSingleMock =
    vi.fn();

  const membershipMaybeSingleMock =
    vi.fn();

  const reactionOrderMock =
    vi.fn();

  const reactionInsertSingleMock =
    vi.fn();

  const reactionDeleteSelectMock =
    vi.fn();

  const fromMock = vi.fn();

  fromMock.mockImplementation(
    (table: string) => {
      if (table === "messages") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle:
                  messageMaybeSingleMock,
              })),
            })),
          })),
        };
      }

      if (
        table === "conversation_members"
      ) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle:
                  membershipMaybeSingleMock,
              })),
            })),
          })),
        };
      }

      if (
        table === "message_reactions"
      ) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order:
                reactionOrderMock,
            })),
          })),

          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single:
                reactionInsertSingleMock,
            })),
          })),

          delete: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  select:
                    reactionDeleteSelectMock,
                })),
              })),
            })),
          })),
        };
      }

      throw new Error(
        `Unexpected table: ${table}`,
      );
    },
  );

  return {
    fromMock,
    messageMaybeSingleMock,
    membershipMaybeSingleMock,
    reactionOrderMock,
    reactionInsertSingleMock,
    reactionDeleteSelectMock,
  };
}

describe(
  "Message Reactions API",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      "returns 401 when user is not authenticated",
      async () => {
        requireUserMock.mockResolvedValue(
          null,
        );

        const response =
          await GET(
            new Request(
              "http://localhost/api/test",
            ),
            makeParams(),
          );

        expect(
          response.status,
        ).toBe(401);
      },
    );

    it(
      "gets reactions for a message",
      async () => {
        requireUserMock.mockResolvedValue({
          id: "user-1",
        });

        const supabase =
          createSupabaseMock();

        createSupabaseAdminClientMock.mockReturnValue(
          {
            from: supabase.fromMock,
          },
        );

        supabase.messageMaybeSingleMock.mockResolvedValue({
          data: {
            id: messageId,
            conversation_id:
              "conversation-1",
          },
          error: null,
        });

        supabase.membershipMaybeSingleMock.mockResolvedValue({
          data: {
            conversation_id:
              "conversation-1",
          },
          error: null,
        });

        supabase.reactionOrderMock.mockResolvedValue({
          data: [
            {
              id: "reaction-1",
              message_id: messageId,
              user_id: "user-1",
              emoji: "👍",
              created_at:
                "2026-09-29T00:00:00Z",
            },
            {
              id: "reaction-2",
              message_id: messageId,
              user_id: "user-2",
              emoji: "👍",
              created_at:
                "2026-09-29T00:01:00Z",
            },
            {
              id: "reaction-3",
              message_id: messageId,
              user_id: "user-2",
              emoji: "❤️",
              created_at:
                "2026-09-29T00:02:00Z",
            },
          ],
          error: null,
        });

        const response =
          await GET(
            new Request(
              "http://localhost/api/test",
            ),
            makeParams(),
          );

        expect(
          response.status,
        ).toBe(200);

        const result =
          await response.json();

        expect(
          result.success,
        ).toBe(true);

        expect(
          result.data,
        ).toContainEqual({
          emoji: "👍",
          count: 2,
          reacted: true,
        });

        expect(
          result.data,
        ).toContainEqual({
          emoji: "❤️",
          count: 1,
          reacted: false,
        });
      },
    );

    it(
      "rejects unsupported reaction",
      async () => {
        requireUserMock.mockResolvedValue({
          id: "user-1",
        });

        const response =
          await POST(
            new Request(
              "http://localhost/api/test",
              {
                method: "POST",
                body: JSON.stringify({
                  emoji: "🚀",
                }),
              },
            ),
            makeParams(),
          );

        expect(
          response.status,
        ).toBe(400);
      },
    );

    it(
      "adds a valid reaction",
      async () => {
        requireUserMock.mockResolvedValue({
          id: "user-1",
        });

        const supabase =
          createSupabaseMock();

        createSupabaseAdminClientMock.mockReturnValue(
          {
            from: supabase.fromMock,
          },
        );

        supabase.messageMaybeSingleMock.mockResolvedValue({
          data: {
            id: messageId,
            conversation_id:
              "conversation-1",
          },
          error: null,
        });

        supabase.membershipMaybeSingleMock.mockResolvedValue({
          data: {
            conversation_id:
              "conversation-1",
          },
          error: null,
        });

        supabase.reactionInsertSingleMock.mockResolvedValue({
          data: {
            id: "reaction-1",
            message_id: messageId,
            user_id: "user-1",
            emoji: "❤️",
            created_at:
              "2026-09-29T00:00:00Z",
          },
          error: null,
        });

        const response =
          await POST(
            new Request(
              "http://localhost/api/test",
              {
                method: "POST",
                body: JSON.stringify({
                  emoji: "❤️",
                }),
              },
            ),
            makeParams(),
          );

        expect(
          response.status,
        ).toBe(201);

        const result =
          await response.json();

        expect(
          result.success,
        ).toBe(true);

        expect(
          result.data.emoji,
        ).toBe("❤️");
      },
    );

    it(
      "returns 409 for duplicate reaction",
      async () => {
        requireUserMock.mockResolvedValue({
          id: "user-1",
        });

        const supabase =
          createSupabaseMock();

        createSupabaseAdminClientMock.mockReturnValue(
          {
            from: supabase.fromMock,
          },
        );

        supabase.messageMaybeSingleMock.mockResolvedValue({
          data: {
            id: messageId,
            conversation_id:
              "conversation-1",
          },
          error: null,
        });

        supabase.membershipMaybeSingleMock.mockResolvedValue({
          data: {
            conversation_id:
              "conversation-1",
          },
          error: null,
        });

        supabase.reactionInsertSingleMock.mockResolvedValue({
          data: null,
          error: {
            code: "23505",
          },
        });

        const response =
          await POST(
            new Request(
              "http://localhost/api/test",
              {
                method: "POST",
                body: JSON.stringify({
                  emoji: "👍",
                }),
              },
            ),
            makeParams(),
          );

        expect(
          response.status,
        ).toBe(409);
      },
    );

    it(
      "removes my reaction",
      async () => {
        requireUserMock.mockResolvedValue({
          id: "user-1",
        });

        const supabase =
          createSupabaseMock();

        createSupabaseAdminClientMock.mockReturnValue(
          {
            from: supabase.fromMock,
          },
        );

        supabase.messageMaybeSingleMock.mockResolvedValue({
          data: {
            id: messageId,
            conversation_id:
              "conversation-1",
          },
          error: null,
        });

        supabase.membershipMaybeSingleMock.mockResolvedValue({
          data: {
            conversation_id:
              "conversation-1",
          },
          error: null,
        });

        supabase.reactionDeleteSelectMock.mockResolvedValue({
          data: [
            {
              id: "reaction-1",
              message_id: messageId,
              user_id: "user-1",
              emoji: "😂",
            },
          ],
          error: null,
        });

        const response =
          await DELETE(
            new Request(
              "http://localhost/api/test",
              {
                method: "DELETE",
                body: JSON.stringify({
                  emoji: "😂",
                }),
              },
            ),
            makeParams(),
          );

        expect(
          response.status,
        ).toBe(200);

        const result =
          await response.json();

        expect(
          result.success,
        ).toBe(true);
      },
    );
  },
);
