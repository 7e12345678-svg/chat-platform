import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser,
    },
  })),
}));

describe("auth middleware", () => {

   it("allows authenticated users to access /", async () => {
  getUser.mockResolvedValue({
    data: {
      user: {
        id: "user-123",
      },
    },
    error: null,
  });

  const { middleware } = await import("./middleware");

  const request = new NextRequest("http://localhost/");
  const response = await middleware(request);

  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users from / to /auth/login", async () => {
    getUser.mockResolvedValue({
      data: {
        user: null,
      },
      error: null,
    });

    const { middleware } = await import("./middleware");

    const request = new NextRequest("http://localhost/");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/auth/login",
    );
  });
});
 it("allows unauthenticated users to access /auth/login", async () => {
  getUser.mockResolvedValue({
    data: {
      user: null,
    },
    error: null,
  });

  const { middleware } = await import("./middleware");

  const request = new NextRequest("http://localhost/auth/login");
  const response = await middleware(request);

  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
});

  it("allows unauthenticated users to access /auth/signup", async () => {
  getUser.mockResolvedValue({
    data: {
      user: null,
    },
    error: null,
  });

  const { middleware } = await import("./middleware");

  const request = new NextRequest("http://localhost/auth/signup");
  const response = await middleware(request);

  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
});

  it("allows unauthenticated users to access API routes", async () => {
  getUser.mockResolvedValue({
    data: {
      user: null,
    },
    error: null,
  });

  const { middleware } = await import("./middleware");

  const request = new NextRequest("http://localhost/api/conversations");
  const response = await middleware(request);

  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
});

  it("does not match API and Next.js internal routes", async () => {
  const { config } = await import("./middleware");

  expect(config.matcher).toEqual([
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ]);
});
