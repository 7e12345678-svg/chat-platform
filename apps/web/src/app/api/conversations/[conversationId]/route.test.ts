import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  update: mockUpdate,
  delete: mockDelete,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

import { DELETE, GET, PATCH, POST } from "./route";

describe("/api/conversations/[conversationId]", () => {
  beforeEach(() => {
  vi.clearAllMocks();

  mockUpdate.mockReturnValue({
    eq: mockEq,
  });

  mockDelete.mockReturnValue({
    eq: mockEq,
  });

  mockEq.mockReturnValue({
    select: mockSelect,
  });

  mockSelect.mockReturnValue({
    single: mockSingle,
  });
});

  // ============================================================
  // Existing message GET behavior
  // ============================================================
  it("GET returns a conversation's messages", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/conversations/sopheak",
      ),
      {
        params: Promise.resolve({
          conversationId: "sopheak",
        }),
      },
    );

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  // ============================================================
  // Existing message POST behavior
  // ============================================================
  it("POST creates a new message", async () => {
    const request = new Request(
      "http://localhost:3000/api/conversations/sopheak/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Hello from test",
        }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(201);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(
      expect.objectContaining({
        sender: "me",
        text: "Hello from test",
        status: "sent",
      }),
    );
  });

  // ============================================================
  // PATCH — RED target
  // ============================================================
  it("PATCH updates a conversation in Supabase", async () => {
    const updatedConversation = {
      id: "sopheak",
      name: "Sopheak Updated",
      fallback: "S",
      online: true,
      created_at: "2026-09-16T01:00:00Z",
      updated_at: "2026-09-16T04:00:00Z",
    };

    mockSingle.mockResolvedValue({
      data: updatedConversation,
      error: null,
    });

    const request = new Request(
      "http://localhost:3000/api/conversations/sopheak",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Sopheak Updated",
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(updatedConversation);

    expect(mockFrom).toHaveBeenCalledWith("conversations");
    expect(mockUpdate).toHaveBeenCalledWith({
      name: "Sopheak Updated",
      fallback: "S",
    });
  });

  // ============================================================
  // PATCH — validation
  // ============================================================
  it("PATCH rejects an empty conversation name", async () => {
    const request = new Request(
      "http://localhost:3000/api/conversations/sopheak",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "   ",
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Conversation name is required",
    );

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  // ============================================================
  // DELETE — RED target
  // ============================================================
  it("DELETE removes a conversation from Supabase", async () => {
    const deletedConversation = {
      id: "sopheak",
      name: "Sopheak",
      fallback: "S",
      online: true,
      created_at: "2026-09-16T01:00:00Z",
      updated_at: "2026-09-16T04:00:00Z",
    };

    mockSingle.mockResolvedValue({
      data: deletedConversation,
      error: null,
    });

    const response = await DELETE(
      new Request(
        "http://localhost:3000/api/conversations/sopheak",
        {
          method: "DELETE",
        },
      ),
      {
        params: Promise.resolve({
          conversationId: "sopheak",
        }),
      },
    );

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(deletedConversation);

    expect(mockFrom).toHaveBeenCalledWith("conversations");
    expect(mockDelete).toHaveBeenCalled();
  });
});