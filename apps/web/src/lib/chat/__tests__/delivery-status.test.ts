import { describe, expect, it } from "vitest";

import {
  getUndeliveredIncomingMessageIds,
} from "@/lib/chat/delivery-status";

describe("delivery-status", () => {
  it("gets incoming sent message ids that need delivery confirmation", () => {
    const messages = [
      {
        id: "message-1",
        sender: "other" as const,
        status: "sent" as const,
      },
      {
        id: "message-2",
        sender: "other" as const,
        status: "delivered" as const,
      },
      {
        id: "message-3",
        sender: "other" as const,
        status: "read" as const,
      },
      {
        id: "message-4",
        sender: "me" as const,
        status: "sent" as const,
      },
    ];

    const result =
      getUndeliveredIncomingMessageIds(messages);

    expect(result).toEqual([
      "message-1",
    ]);
  });
});
