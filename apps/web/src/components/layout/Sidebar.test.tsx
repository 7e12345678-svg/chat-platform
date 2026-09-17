import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

import { Sidebar } from "./Sidebar";

describe("Sidebar logout", () => {
  beforeEach(() => {
    push.mockClear();

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          ),
        ),
      ),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders a logout button", () => {
    render(<Sidebar />);

    expect(
      screen.getByRole("button", { name: /logout/i }),
    ).toBeTruthy();
  });

  it("calls the logout API when logout is clicked", async () => {
    render(<Sidebar />);

    fireEvent.click(
      screen.getByRole("button", { name: /logout/i }),
    );

    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/auth/logout",
        {
          method: "POST",
        },
      );
    });
  });

  it("redirects to the login page after successful logout", async () => {
    render(<Sidebar />);

    fireEvent.click(
      screen.getByRole("button", { name: /logout/i }),
    );

    await vi.waitFor(() => {
      expect(push).toHaveBeenCalledWith("/auth/login");
    });
  });
});
