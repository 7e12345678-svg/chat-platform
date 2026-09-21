import { createClient } from "@supabase/supabase-js";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mockRequireUser = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/requireUser", () => ({
  requireUser: mockRequireUser,
}));

beforeEach(() => {
  vi.clearAllMocks();

  mockRequireUser.mockResolvedValue({
    id: "test-user-id",
    email: "test@example.com",
  });
});
import { GET, PATCH, POST } from "./route";
describe("POST /api/conversations/[conversationId]/messages", () => {

  it("POST returns 401 when user is not authenticated", async () => {
  mockRequireUser.mockResolvedValueOnce(null);

  const response = await POST(
    new Request(
      "http://localhost:3000/api/conversations/sopheak/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Unauthorized message",
        }),
      },
    ),
    {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    },
  );

  expect(response.status).toBe(401);

  const result = await response.json();

  expect(result.success).toBe(false);
  expect(result.message).toBe(
    "Authentication required",
  );
});

  beforeEach(() => {
  vi.clearAllMocks();

  mockRequireUser.mockResolvedValue({
    id: "test-user-id",
    email: "test@example.com",
  });
});

  it("creates a message for any conversation stored in Supabase", async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  // Create a conversation that exists only in Supabase.
  // This conversation is NOT part of messagesByConversation mock data.
  const conversationId = `tdd-${Date.now()}`;
  const testContent = `Supabase conversation message ${Date.now()}`;

  const { error: conversationError } = await supabase
    .from("conversations")
    .insert({
      id: conversationId,
      name: "TDD Supabase Conversation",
      fallback: "T",
      online: false,
    });

  expect(conversationError).toBeNull();

  try {
    const request = new Request(
      `http://localhost:3000/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: testContent,
        }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId,
      }),
    });

    expect(response.status).toBe(201);

    const { data, error } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, status")
      .eq("conversation_id", conversationId)
      .eq("content", testContent)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.conversation_id).toBe(conversationId);
    expect(data?.sender_id).toBe("test-user-id");
    expect(data?.content).toBe(testContent);
    expect(data?.status).toBe("sent");
  } finally {
    // Clean up test data.
    await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);
  }
});

  it("saves a new message into Supabase", async () => {
    const testContent = `TDD message ${Date.now()}`;
    const conversationId = "sopheak";

    const request = new Request(
      `http://localhost:3000/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: testContent,
        }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId,
      }),
    });

    expect(response.status).toBe(201);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );

    const { data, error } = await supabase
      .from("messages")
      .select(
        "id, conversation_id, sender_id, content, status",
      )
      .eq("conversation_id", conversationId)
      .eq("content", testContent)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    expect(data?.conversation_id).toBe(conversationId);
    expect(data?.sender_id).toBe("test-user-id");
    expect(data?.content).toBe(testContent);
    expect(data?.status).toBe("sent");
  });

  it("POST returns 404 for an unknown conversation", async () => {
    const conversationId = "unknown";

    const request = new Request(
      `http://localhost:3000/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Message to unknown conversation",
        }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId,
      }),
    });

    expect(response.status).toBe(404);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Conversation not found",
    );
  });
});

describe("GET /api/conversations/[conversationId]/messages", () => {
  it("reads messages from Supabase", async () => {
    const conversationId = "sopheak";
    const testContent = `GET TDD message ${Date.now()}`;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );

    const {
      data: insertedMessage,
      error: insertError,
    } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: "test-user-id",
        content: testContent,
        status: "sent",
      })
      .select(
        "id, conversation_id, sender_id, content, status, created_at",
      )
      .single();

    expect(insertError).toBeNull();
    expect(insertedMessage).not.toBeNull();

    const request = new Request(
      `http://localhost:3000/api/conversations/${conversationId}/messages`,
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({
        conversationId,
      }),
    });

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Array);

    const foundMessage = result.data.find(
      (message: { id: string }) =>
        message.id === insertedMessage!.id,
    );

    expect(foundMessage).toBeDefined();
    expect(foundMessage.text).toBe(testContent);
    expect(foundMessage.sender).toBe("me");
    expect(foundMessage.status).toBe("sent");
  });

  it("GET returns 404 for an unknown conversation", async () => {
    const conversationId = "unknown";

    const response = await GET(
      new Request(
        `http://localhost:3000/api/conversations/${conversationId}/messages`,
        {
          method: "GET",
        },
      ),
      {
        params: Promise.resolve({
          conversationId,
        }),
      },
    );

    expect(response.status).toBe(404);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Conversation not found",
    );
  });
});
    it("GET returns 401 when user is not authenticated", async () => {
  mockRequireUser.mockResolvedValueOnce(null);

  const response = await GET(
    new Request("http://localhost:3000"),
    {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    },
  );

  expect(response.status).toBe(401);

  const result = await response.json();

  expect(result.success).toBe(false);
  expect(result.message).toBe(
    "Authentication required",
  );
});

   /**
 * ============================================================
 * PATCH /api/conversations/[conversationId]/messages
 * ============================================================
 *
 * TDD:
 * Test that PATCH marks a message as read in Supabase.
 * ============================================================
 */
describe(
  "PATCH /api/conversations/[conversationId]/messages",
  () => {
    it("marks a message as read", async () => {
      const conversationId = "sopheak";
      const testContent = `READ TDD message ${Date.now()}`;

      // --------------------------------------------------------
      // 1. Create a sent message
      // --------------------------------------------------------

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
      );

      const {
        data: insertedMessage,
        error: insertError,
      } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: "other-user-id",
          content: testContent,
          status: "sent",
        })
        .select(
          "id, conversation_id, sender_id, content, status",
        )
        .single();

      expect(insertError).toBeNull();
      expect(insertedMessage).not.toBeNull();
      expect(insertedMessage?.status).toBe("sent");

      // --------------------------------------------------------
      // 2. Call PATCH API
      // --------------------------------------------------------

      const request = new Request(
        `http://localhost:3000/api/conversations/${conversationId}/messages`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageIds: [insertedMessage!.id],
          }),
        },
      );

      const response = await PATCH(request, {
        params: Promise.resolve({
          conversationId,
        }),
      });

      // --------------------------------------------------------
      // 3. Verify API response
      // --------------------------------------------------------

      expect(response.status).toBe(200);

      const result = await response.json();

      expect(result.success).toBe(true);

      // --------------------------------------------------------
      // 4. Verify Supabase
      // --------------------------------------------------------

      const {
        data: updatedMessage,
        error: readError,
      } = await supabase
        .from("messages")
        .select("id, status")
        .eq("id", insertedMessage!.id)
        .single();

      expect(readError).toBeNull();
      expect(updatedMessage?.status).toBe("read");
    });
  },
);

  it("does not mark my own message as read", async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const conversationId = `read-own-${Date.now()}`;

  const { data: conversation } = await supabase
    .from("conversations")
    .insert({
      id: conversationId,
      name: "Read Own Test",
      fallback: "R",
      online: false,
    })
    .select("id")
    .single();

  expect(conversation).not.toBeNull();

  const { data: insertedMessage, error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: "test-user-id",
      content: "My own message",
      status: "sent",
    })
    .select("id, status")
    .single();

  expect(insertError).toBeNull();
  expect(insertedMessage).not.toBeNull();

  const request = new Request(
    `http://localhost:3000/api/conversations/${conversationId}/messages`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageIds: [insertedMessage!.id],
      }),
    },
  );

  const response = await PATCH(request, {
    params: Promise.resolve({ conversationId }),
  });

  expect(response.status).toBe(200);

  const { data: messageAfterPatch } = await supabase
    .from("messages")
    .select("id, status")
    .eq("id", insertedMessage!.id)
    .single();

  expect(messageAfterPatch?.status).toBe("sent");
});
