import { describe, expect, it } from "vitest";

import { GET, POST } from "./route";

describe("/api/conversations", () => {
  it("GET returns the current conversations", async () => {
    const response = await GET();

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);

    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        fallback: expect.any(String),
        online: expect.any(Boolean),
      }),
    );
  });

  it("POST creates a new conversation", async () => {
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
    expect(result.data).toBeDefined();
    expect(result.data.name).toBe("Test Conversation");
    expect(result.data.id).toEqual(expect.any(String));
    expect(result.data.fallback).toBe("T");
    expect(result.data.online).toBe(false);
  });
});

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
});
