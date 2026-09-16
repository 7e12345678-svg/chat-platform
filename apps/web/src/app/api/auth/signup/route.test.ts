import { beforeEach, describe, expect, it, vi } from "vitest";

const signUpMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: signUpMock,
    },
  })),
}));

import { POST } from "./route";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new user with email and password", async () => {
    const email = `test-${Date.now()}@gmail.com`;
    const password = "TestPassword123!";

    // Mock successful Supabase signup.
    signUpMock.mockResolvedValue({
      data: {
        user: {
          id: "test-user-id",
          email,
        },
      },
      error: null,
    });

    const request = new Request(
      "http://localhost:3000/api/auth/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(201);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.user).toBeDefined();
    expect(result.data.user.email).toBe(email);

    // Verify Supabase received the correct credentials.
    expect(signUpMock).toHaveBeenCalledTimes(1);
    expect(signUpMock).toHaveBeenCalledWith({
      email,
      password,
    });
  });
});