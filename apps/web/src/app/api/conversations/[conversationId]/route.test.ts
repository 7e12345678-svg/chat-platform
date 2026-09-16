import { describe, expect, it } from "vitest";

import {
  DELETE,
  GET,
  PATCH,
  POST,
} from "./route";

describe("/api/conversations/[conversationId]", () => {
  // ============================================================
  // GET — Existing conversation
  // ============================================================
  it("GET returns a conversation's messages", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/conversations/sopheak",
      ),
      {
        params: Promise.resolve({
          conversationId: "sopheak",
        }),
      },
    );

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  // ============================================================
  // GET — Unknown conversation
  // ============================================================
  it("GET returns 404 for an unknown conversation", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/conversations/unknown",
      ),
      {
        params: Promise.resolve({
          conversationId: "unknown",
        }),
      },
    );

    expect(response.status).toBe(404);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe("Conversation not found");
  });

  // ============================================================
  // POST — Create message
  // ============================================================
  it("POST creates a new message", async () => {
    const request = new Request(
      "http://localhost:3000/api/conversations/sopheak/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Hello from test",
        }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(201);

    const result = await response.json();

    expect(result.success).toBe(true);

    expect(result.data).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        sender: "me",
        text: "Hello from test",
        status: "sent",
      }),
    );
  });

  // ============================================================
  // POST — Empty message validation
  // ============================================================
  it("POST rejects an empty message", async () => {
    const request = new Request(
      "http://localhost:3000/api/conversations/sopheak/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "   ",
        }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe("Message text is required");
  });

  // ============================================================
  // PATCH — Update conversation name
  // ============================================================
  it("PATCH updates a conversation name", async () => {
    const request = new Request(
      "http://localhost:3000/api/conversations/sopheak",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Sopheak Updated",
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.name).toBe("Sopheak Updated");
    expect(result.data.id).toBe("sopheak");
    expect(result.data.fallback).toBe("S");
  });

  // ============================================================
  // PATCH — Empty conversation name validation
  // ============================================================
  it("PATCH rejects an empty conversation name", async () => {
    const request = new Request(
      "http://localhost:3000/api/conversations/sopheak",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "   ",
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Conversation name is required",
    );
  });

  // ============================================================
  // DELETE — Remove conversation
  // ============================================================
  it("DELETE removes a conversation", async () => {
    const response = await DELETE(
      new Request(
        "http://localhost:3000/api/conversations/sopheak",
        {
          method: "DELETE",
        },
      ),
      {
        params: Promise.resolve({
          conversationId: "sopheak",
        }),
      },
    );

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.id).toBe("sopheak");
  });
});

 it("PATCH returns 404 for an unknown conversation", async () => {
  const request = new Request(
    "http://localhost:3000/api/conversations/unknown",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Unknown",
      }),
    },
  );

  const response = await PATCH(request, {
    params: Promise.resolve({
      conversationId: "unknown",
    }),
  });

  expect(response.status).toBe(404);

  const result = await response.json();

  expect(result.success).toBe(false);
  expect(result.message).toBe("Conversation not found");
});

it("DELETE returns 404 for an unknown conversation", async () => {
  const response = await DELETE(
    new Request(
      "http://localhost:3000/api/conversations/unknown",
      {
        method: "DELETE",
      },
    ),
    {
      params: Promise.resolve({
        conversationId: "unknown",
      }),
    },
  );

  expect(response.status).toBe(404);

  const result = await response.json();

  expect(result.success).toBe(false);
  expect(result.message).toBe("Conversation not found");
});