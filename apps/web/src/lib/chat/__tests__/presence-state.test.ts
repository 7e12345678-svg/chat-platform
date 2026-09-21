import { describe, expect, it } from "vitest";

import {
  getCurrentUserPresence,
  getRemotePresence,
} from "../presence-state";

describe("getRemotePresence", () => {
  it("returns online when another user is present", () => {
    const state = {
      "user-1": [
        {
          userId: "user-1",
          onlineAt: "2026-09-17T08:00:00.000Z",
        },
      ],
      "user-2": [
        {
          userId: "user-2",
          onlineAt: "2026-09-17T08:01:00.000Z",
        },
      ],
    };

    expect(
      getRemotePresence(state, "user-1"),
    ).toEqual({
      status: "online",
    });
  });

  it("returns offline when only the current user is present", () => {
    const state = {
      "user-1": [
        {
          userId: "user-1",
          onlineAt: "2026-09-17T08:00:00.000Z",
        },
      ],
    };

    expect(
      getRemotePresence(state, "user-1"),
    ).toEqual({
      status: "offline",
    });
  });
});

describe("getCurrentUserPresence", () => {
  it("returns online when the current user is present", () => {
    const state = {
      "user-1": [
        {
          userId: "user-1",
          onlineAt: "2026-09-17T08:00:00.000Z",
        },
      ],
      "user-2": [
        {
          userId: "user-2",
          onlineAt: "2026-09-17T08:01:00.000Z",
        },
      ],
    };

    expect(
      getCurrentUserPresence(state, "user-1"),
    ).toEqual({
      status: "online",
    });
  });

  it("returns offline when the current user is not present", () => {
    const state = {
      "user-2": [
        {
          userId: "user-2",
          onlineAt: "2026-09-17T08:01:00.000Z",
        },
      ],
    };

    expect(
      getCurrentUserPresence(state, "user-1"),
    ).toEqual({
      status: "offline",
    });
  });
});