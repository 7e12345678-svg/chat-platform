import { describe, expect, it, vi } from "vitest";

const signOut = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      signOut,
    },
  })),
}));

import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  it("logs out the current user and returns success", async () => {
    signOut.mockResolvedValue({
      error: null,
    });

    const request = new Request(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
      },
    );

    const response = await POST();

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
