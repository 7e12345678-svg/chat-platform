import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}));

import { GET } from "./route";

describe("GET /api/auth/session", () => {
  beforeEach(() => {
    getUserMock.mockReset();
  });

  it("returns the currently authenticated user", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "test-user-id",
          email: "test@gmail.com",
        },
      },
      error: null,
    });

    const response = await GET();

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.user).toBeDefined();
    expect(result.data.user.id).toBe("test-user-id");
    expect(result.data.user.email).toBe("test@gmail.com");
  });
});

