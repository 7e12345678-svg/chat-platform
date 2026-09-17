import "@testing-library/jest-dom/vitest";

import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import LoginPage from "./page";

afterEach(() => {
  cleanup();
});

describe("/auth/login", () => {

    it("submits the email and password to the login API", async () => {
  const user = userEvent.setup();

  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            user: {
              id: "test-user-id",
              email: "test@example.com",
            },
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

  render(<LoginPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "test@example.com",
  );

  await user.type(
    screen.getByLabelText(/password/i),
    "Password123!",
  );

  fireEvent.submit(
  screen.getByRole("button", {
    name: /login/i,
  }).closest("form")!,
);

  expect(fetchMock).toHaveBeenCalledWith(
    "/api/auth/login",
    expect.objectContaining({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
      }),
    }),
  );

  fetchMock.mockRestore();
});

  it("renders the email, password, and login controls", () => {
    render(<LoginPage />);

    expect(
      screen.getByLabelText(/email/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/password/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /login/i,
      }),
    ).toBeInTheDocument();
  });
});

  it("redirects to the chat after a successful login", async () => {
  const user = userEvent.setup();

  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: "test-user-id",
            email: "test@example.com",
          },
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    ),
  );

  const originalLocation = window.location;

  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...originalLocation,
      href: "/auth/login",
    },
  });

  render(<LoginPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "test@example.com",
  );

  await user.type(
    screen.getByLabelText(/password/i),
    "Password123!",
  );

  fireEvent.submit(
    screen.getByRole("button", {
      name: /login/i,
    }).closest("form")!,
  );

  await vi.waitFor(() => {
    expect(window.location.href).toBe("/");
  });

  fetchMock.mockRestore();
});

  it("shows an error when login fails", async () => {
  const user = userEvent.setup();

  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          message: "Invalid email or password",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

  render(<LoginPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "wrong@example.com",
  );

  await user.type(
    screen.getByLabelText(/password/i),
    "WrongPassword",
  );

  fireEvent.submit(
    screen.getByRole("button", {
      name: /login/i,
    }).closest("form")!,
  );

  expect(
    await screen.findByText("Invalid email or password"),
  ).toBeInTheDocument();

  fetchMock.mockRestore();
});

  it("shows a loading state while login is in progress", async () => {
  const user = userEvent.setup();

  let resolveFetch!: (response: Response) => void;

  const fetchPromise = new Promise<Response>((resolve) => {
    resolveFetch = resolve;
  });

  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockReturnValue(fetchPromise);

  render(<LoginPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "test@example.com",
  );

  await user.type(
    screen.getByLabelText(/password/i),
    "Password123!",
  );

  fireEvent.submit(
    screen.getByRole("button", {
      name: /login/i,
    }).closest("form")!,
  );

  expect(
    screen.getByRole("button", {
      name: /logging in/i,
    }),
  ).toBeDisabled();

  resolveFetch(
    new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: "test-user-id",
            email: "test@example.com",
          },
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    ),
  );

  fetchMock.mockRestore();
});

  it("requires email and password before submitting", async () => {
  const user = userEvent.setup();

  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
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
    );

  render(<LoginPage />);

  fireEvent.submit(
    screen.getByRole("button", {
      name: /login/i,
    }).closest("form")!,
  );

  expect(
    await screen.findByText("Email is required"),
  ).toBeInTheDocument();

  expect(
    screen.getByText("Password is required"),
  ).toBeInTheDocument();

  expect(fetchMock).not.toHaveBeenCalled();

  fetchMock.mockRestore();
});

  it("rejects an invalid email format", async () => {
  const user = userEvent.setup();

  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
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
    );

  render(<LoginPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "invalid-email",
  );

  await user.type(
    screen.getByLabelText(/password/i),
    "Password123!",
  );

  fireEvent.submit(
    screen.getByRole("button", {
      name: /login/i,
    }).closest("form")!,
  );

  expect(
    await screen.findByText("Enter a valid email"),
  ).toBeInTheDocument();

  expect(fetchMock).not.toHaveBeenCalled();

  fetchMock.mockRestore();
});
  it("rejects a password shorter than 8 characters", async () => {
  const user = userEvent.setup();

  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
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
    );

  render(<LoginPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "test@example.com",
  );

  await user.type(
    screen.getByLabelText(/password/i),
    "1234567",
  );

  fireEvent.submit(
    screen.getByRole("button", {
      name: /login/i,
    }).closest("form")!,
  );

  expect(
    await screen.findByText(
      "Password must be at least 8 characters",
    ),
  ).toBeInTheDocument();

  expect(fetchMock).not.toHaveBeenCalled();

  fetchMock.mockRestore();
});

​​it("renders the premium auth branding and welcome content", () => {
  render(<LoginPage />);

  expect(screen.getAllByText("Chat Platform").length).toBeGreaterThan(0);
  expect(
    screen.getByRole("heading", {
      name: /communication.*without limits/i,
       }),
  ).toBeTruthy();

  expect(
    screen.getByRole("heading", { name: /welcome back/i }),
  ).toBeTruthy();

  expect(
    screen.getByText("Sign in to continue to Chat Platform"),
  ).toBeTruthy();
});

it("renders premium login options", () => {
  render(<LoginPage />);

  expect(screen.getByText("Remember me")).toBeTruthy();
  expect(screen.getByText("Forgot password?")).toBeTruthy();

  expect(
    screen.getByRole("link", { name: /create account/i }),
  ).toBeTruthy();
});