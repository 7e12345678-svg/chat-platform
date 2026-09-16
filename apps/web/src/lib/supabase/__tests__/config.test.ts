import { describe, expect, it } from "vitest";

describe("Supabase configuration", () => {
  it("has the required public environment variables", () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeTruthy();
    expect(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBeTruthy();
  });
});
