import { z } from "zod";

/**
 * MessageInputSchema
 *
 * Validates chat message input.
 *
 * Rules:
 * 1. Text can contain up to 4,000 characters.
 * 2. A message must contain either:
 *    - text content, OR
 *    - an image URL.
 * 3. Blank spaces are not considered valid text.
 */
export const MessageInputSchema = z
  .object({
    content: z.string().max(4000),
    imageUrl: z.string().nullable(),
  })
  .refine(
    ({ content, imageUrl }) =>
      content.trim().length > 0 || Boolean(imageUrl),
    {
      message: "Message content or image is required",
      path: ["content"],
    },
  );