import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
/**
 * ============================================================
 * MOCK NEXT.JS COOKIES
 * ============================================================
 *
 * Vitest calls the Route Handler directly, so there is no
 * real Next.js request scope.
 *
 * This mock provides the cookie store required by
 * createSupabaseServerClient().
 * ============================================================
 */
const cookieStore = {
  getAll: vi.fn(() => []),
  set: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import { POST } from "./route";

describe("POST /api/auth/login", () => {
  /**
   * ============================================================
   * TEST 1 — Login with Email + Password
   * ============================================================
   */
  it("logs in an existing user with email and password", async () => {
    const email = `login-${Date.now()}@gmail.com`;
    const password = "TestPassword123!";

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );

    const {
      data: createdUser,
      error: createError,
    } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    expect(createError).toBeNull();
    expect(createdUser.user).not.toBeNull();

    const request = new Request(
      "http://localhost:3000/api/auth/login",
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

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.user).toBeDefined();
    expect(result.data.user.email).toBe(email);
  });

  /**
   * ============================================================
   * TEST 2 — Login returns Supabase Session
   * ============================================================
   */
  it("returns a session when login succeeds", async () => {
    const email = `session-${Date.now()}@gmail.com`;
    const password = "TestPassword123!";

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );

    const {
      data: createdUser,
      error: createError,
    } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    expect(createError).toBeNull();
    expect(createdUser.user).not.toBeNull();

    const request = new Request(
      "http://localhost:3000/api/auth/login",
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

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.user).toBeDefined();

    // Session must exist after successful login.
    expect(result.data.session).toBeDefined();

    // Access token is required for an authenticated session.
    expect(result.data.session.access_token).toBeDefined();

    // Refresh token is required to refresh the session.
    expect(result.data.session.refresh_token).toBeDefined();

    // A successful login must persist the session in cookies.
// A successful login must persist the session in cookies.
expect(cookieStore.set).toHaveBeenCalled();

const cookieCalls = cookieStore.set.mock.calls;

expect(cookieCalls.length).toBeGreaterThan(0);

const cookieNames = cookieCalls.map(([name]) => name);

expect(cookieNames.some((name) => name.startsWith("sb-"))).toBe(true);
  });
});