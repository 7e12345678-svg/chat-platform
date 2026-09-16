import { describe, expect, it } from "vitest";

import { MessageInputSchema } from "@/lib/chat/validation";

describe("MessageInputSchema", () => {
  it("rejects a blank message with no image", () => {
    expect(
      MessageInputSchema.safeParse({ content: "   ", imageUrl: null }).success,
    ).toBe(false);
  });

  it("accepts an image-only message", () => {
    expect(
      MessageInputSchema.safeParse({
        content: "",
        imageUrl: "message-images/user-1/photo.png",
      }).success,
    ).toBe(true);
  });

  it("rejects text longer than 4,000 characters", () => {
    expect(
      MessageInputSchema.safeParse({
        content: "a".repeat(4001),
        imageUrl: null,
      }).success,
    ).toBe(false);
  });
});
