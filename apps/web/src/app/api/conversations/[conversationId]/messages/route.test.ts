import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

describe("POST /api/conversations/[conversationId]/messages", () => {
  it("saves a new message into Supabase", async () => {
    // Unique content so this test does not conflict with old data.
    const testContent = `TDD message ${Date.now()}`;
    const conversationId = "sopheak";

    // Call our API route directly.
    const request = new Request(
      `http://localhost:3000/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: testContent,
        }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId,
      }),
    });

    expect(response.status).toBe(201);

    // Use the server-side secret key only inside the test.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );

    // Verify that the API actually saved the message in the database.
    const { data, error } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, status")
      .eq("conversation_id", conversationId)
      .eq("content", testContent)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    expect(data?.conversation_id).toBe(conversationId);
    expect(data?.sender_id).toBe("me");
    expect(data?.content).toBe(testContent);
    expect(data?.status).toBe("sent");
  });
});

   /**
 * ============================================================
 * GET /api/conversations/[conversationId]/messages
 * ============================================================
 *
 * TDD:
 * Test that GET reads messages from Supabase Database.
 * ============================================================
 */
describe("GET /api/conversations/[conversationId]/messages", () => {
  it("reads messages from Supabase", async () => {
    const conversationId = "sopheak";
    const testContent = `GET TDD message ${Date.now()}`;

    /**
     * Create a real database message first.
     *
     * This gives the GET endpoint something specific
     * to find in Supabase.
     */
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );

    const { data: insertedMessage, error: insertError } =
      await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: "me",
          content: testContent,
          status: "sent",
        })
        .select(
          "id, conversation_id, sender_id, content, status, created_at",
        )
        .single();

    expect(insertError).toBeNull();
    expect(insertedMessage).not.toBeNull();

    /**
     * Call the GET route.
     */
    const request = new Request(
      `http://localhost:3000/api/conversations/${conversationId}/messages`,
      {
        method: "GET",
      },
    );

    const response = await GET(request, {
      params: Promise.resolve({
        conversationId,
      }),
    });

    expect(response.status).toBe(200);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Array);

    /**
     * The GET response must contain
     * the message we inserted into Supabase.
     */
    const foundMessage = result.data.find(
      (message: { id: string }) =>
        message.id === insertedMessage!.id,
    );

    expect(foundMessage).toBeDefined();
    expect(foundMessage.text).toBe(testContent);
    expect(foundMessage.sender).toBe("me");
    expect(foundMessage.status).toBe("sent");
  });
});