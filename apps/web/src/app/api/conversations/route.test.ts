import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockInsert = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

import { GET, POST } from "./route";

describe("/api/conversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // GET — Load conversations from Supabase
  // ============================================================
  it("GET returns conversations from Supabase", async () => {
    const databaseRows = [
      {
        id: "sopheak",
        name: "Sopheak",
        fallback: "S",
        online: true,
        created_at: "2026-09-16T01:00:00Z",
        updated_at: "2026-09-16T01:00:00Z",
      },
      {
        id: "dara",
        name: "Dara",
        fallback: "D",
        online: false,
        created_at: "2026-09-16T02:00:00Z",
        updated_at: "2026-09-16T02:00:00Z",
      },
    ];

    mockOrder.mockResolvedValue({
      data: databaseRows,
      error: null,
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
    });

    const response = await GET();

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(databaseRows);

    expect(mockFrom).toHaveBeenCalledWith("conversations");

    expect(mockSelect).toHaveBeenCalledWith(
      "id, name, fallback, online, created_at, updated_at",
    );

    expect(mockOrder).toHaveBeenCalledWith("created_at", {
      ascending: true,
    });
  });

  // ============================================================
  // POST — Create conversation in Supabase
  // ============================================================
  it("POST creates a conversation in Supabase", async () => {
    const createdConversation = {
      id: "conversation-test-1",
      name: "Test Conversation",
      fallback: "T",
      online: false,
      created_at: "2026-09-16T03:00:00Z",
      updated_at: "2026-09-16T03:00:00Z",
    };

    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: createdConversation,
          error: null,
        }),
      }),
    });

    const request = new Request(
      "http://localhost:3000/api/conversations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Conversation",
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(201);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(createdConversation);

    expect(mockFrom).toHaveBeenCalledWith("conversations");

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Conversation",
        fallback: "T",
        online: false,
      }),
    );
  });

  // ============================================================
  // POST — Validation
  // ============================================================
  it("POST rejects an empty conversation name", async () => {
    const request = new Request(
      "http://localhost:3000/api/conversations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "   ",
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Conversation name is required",
    );

    expect(mockInsert).not.toHaveBeenCalled();
  });
});