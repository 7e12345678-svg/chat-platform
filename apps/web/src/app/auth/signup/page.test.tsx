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

import SignupPage from "./page";

afterEach(() => {
  cleanup();
});

describe("/auth/signup", () => {
  it("renders the signup controls", () => {
    render(<SignupPage />);

    expect(
      screen.getByLabelText(/email/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^password$/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/confirm password/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /create account/i,
      }),
    ).toBeInTheDocument();
  });
});

  it("submits the signup data to the signup API", async () => {
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

  render(<SignupPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "test@example.com",
  );

  await user.type(
    screen.getByLabelText(/^password$/i),
    "Password123!",
  );

  await user.type(
    screen.getByLabelText(/confirm password/i),
    "Password123!",
  );

  fireEvent.submit(
    screen.getByRole("button", {
      name: /create account/i,
    }).closest("form")!,
  );

  expect(fetchMock).toHaveBeenCalledWith(
    "/api/auth/signup",
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

  it("redirects after a successful signup", async () => {
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

  const originalLocation = window.location;

  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...originalLocation,
      href: "/auth/signup",
    },
  });

  render(<SignupPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "test@example.com",
  );

  await user.type(
    screen.getByLabelText(/^password$/i),
    "Password123!",
  );

  await user.type(
    screen.getByLabelText(/confirm password/i),
    "Password123!",
  );

  fireEvent.submit(
    screen.getByRole("button", {
      name: /create account/i,
    }).closest("form")!,
  );

  await vi.waitFor(() => {
    expect(window.location.href).toBe("/");
  });

  fetchMock.mockRestore();
});

  it("shows an error when signup fails", async () => {
  const user = userEvent.setup();

  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          message: "Email is already registered",
        }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

  render(<SignupPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "test@example.com",
  );

  await user.type(
    screen.getByLabelText(/^password$/i),
    "Password123!",
  );

  await user.type(
    screen.getByLabelText(/confirm password/i),
    "Password123!",
  );

  fireEvent.submit(
    screen.getByRole("button", {
      name: /create account/i,
    }).closest("form")!,
  );

  expect(
    await screen.findByText("Email is already registered"),
  ).toBeInTheDocument();

  fetchMock.mockRestore();
});
   it("shows a loading state while signup is in progress", async () => {
  const user = userEvent.setup();

  let resolveFetch!: (response: Response) => void;

  const fetchPromise = new Promise<Response>((resolve) => {
    resolveFetch = resolve;
  });

  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockReturnValue(fetchPromise);

  render(<SignupPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "test@example.com",
  );

  await user.type(
    screen.getByLabelText(/^password$/i),
    "Password123!",
  );

  await user.type(
    screen.getByLabelText(/confirm password/i),
    "Password123!",
  );

  fireEvent.submit(
    screen.getByRole("button", {
      name: /create account/i,
    }).closest("form")!,
  );

  expect(
    screen.getByRole("button", {
      name: /creating account/i,
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
   it("rejects mismatched passwords", async () => {
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

  render(<SignupPage />);

  await user.type(
    screen.getByLabelText(/email/i),
    "test@example.com",
  );

  await user.type(
    screen.getByLabelText(/^password$/i),
    "Password123!",
  );

  await user.type(
    screen.getByLabelText(/confirm password/i),
    "Password456!",
  );

  fireEvent.submit(
    screen.getByRole("button", {
      name: /create account/i,
    }).closest("form")!,
  );

  expect(
    await screen.findByText("Passwords do not match"),
  ).toBeInTheDocument();

  expect(fetchMock).not.toHaveBeenCalled();

  fetchMock.mockRestore();
});
  it("requires email and password before submitting", async () => {
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

  render(<SignupPage />);

  fireEvent.submit(
    screen.getByRole("button", {
      name: /create account/i,
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
​​it("renders the premium signup branding and welcome content", () => {
  render(<SignupPage />);

  expect(screen.getAllByText("Chat Platform").length).toBeGreaterThan(0);

  expect(
    screen.getByRole("heading", {
      name: /communication.*without limits/i,
    }),
  ).toBeTruthy();

  expect(
    screen.getByRole("heading", {
      name: /create your account/i,
    }),
  ).toBeTruthy();
});

it("renders premium signup options", () => {
  render(<SignupPage />);

  expect(
    screen.getByRole("button", {
      name: /create account/i,
    }),
  ).toBeTruthy();

  expect(
    screen.getByRole("button", {
      name: /continue with google/i,
    }),
  ).toBeTruthy();

  expect(
    screen.getByRole("button", {
      name: /continue with apple/i,
    }),
  ).toBeTruthy();

  expect(screen.getByRole("link", { name: /sign in/i })).toBeTruthy();
});