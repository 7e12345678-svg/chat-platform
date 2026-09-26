import {beforeEach, describe, expect, it, vi,} from "vitest";

const mockRequireUser = vi.hoisted(() => vi.fn());

const mockMaybeSingle = vi.hoisted(() => vi.fn());

const mockStorageUpload = vi.hoisted(() => vi.fn());

const mockStorageFrom = vi.hoisted(() =>
  vi.fn(() => ({
    upload: mockStorageUpload,
  })),
);

const mockSupabase = vi.hoisted(() => {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: mockMaybeSingle,
  };
  

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);

  return {
    from: vi.fn(() => builder),
    storage: {
  from: mockStorageFrom,
},
  };
});

vi.mock("@/lib/auth/requireUser", () => ({
  requireUser: mockRequireUser,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: () => mockSupabase,
}));

import { POST } from "./route";

describe(
  "POST /api/conversations/[conversationId]/image",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mockRequireUser.mockResolvedValue({
        id: "test-user-id",
        email: "test@example.com",
      });
    });

    it(
      "returns 401 when user is not authenticated",
      async () => {
        mockRequireUser.mockResolvedValueOnce(null);

        const request = new Request(
          "http://localhost:3000/api/conversations/sopheak/image",
          {
            method: "POST",
          },
        );

        const response = await POST(request, {
          params: Promise.resolve({
            conversationId: "sopheak",
          }),
        });

        expect(response.status).toBe(401);

        const result = await response.json();

        expect(result.success).toBe(false);
        expect(result.message).toBe(
          "Authentication required",
        );
      },
    );

    it(
      "returns 400 when no image file is provided",
      async () => {
        const formData = new FormData();

        const request = new Request(
          "http://localhost:3000/api/conversations/sopheak/image",
          {
            method: "POST",
            body: formData,
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
        expect(result.message).toBe(
          "Image file is required",
        );
      },
    );

    it(
  "returns 400 when the uploaded file is not an allowed image type",
  async () => {
    const file = new File(
      ["hello"],
      "notes.txt",
      { type: "text/plain" },
    );

    const formData = {
      get: vi.fn().mockReturnValue(file),
    };

    const request = {
      formData: vi
        .fn()
        .mockResolvedValue(formData),
    } as unknown as Request;

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Unsupported image type",
    );
  },
);

it(
  "returns 400 when the uploaded image is larger than 5 MB",
  async () => {
    const file = new File(
      [
        new Uint8Array(
          5 * 1024 * 1024 + 1,
        ),
      ],
      "large-image.png",
      {
        type: "image/png",
      },
    );

    const formData = {
      get: vi.fn().mockReturnValue(file),
    };

    const request = {
      formData: vi
        .fn()
        .mockResolvedValue(formData),
    } as unknown as Request;

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(400);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Image file is too large",
    );
  },
);

it(
  "returns 403 when the user is not a member of the conversation",
  async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const file = new File(
      ["fake image"],
      "photo.png",
      {
        type: "image/png",
      },
    );

    const formData = {
      get: vi.fn().mockReturnValue(file),
    };

    const request = {
      formData: vi
        .fn()
        .mockResolvedValue(formData),
    } as unknown as Request;

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(403);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Conversation membership required",
    );
  },
);

it(
  "uploads a valid image to the user's conversation storage folder",
  async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        conversation_id: "sopheak",
      },
      error: null,
    });

    mockStorageUpload.mockResolvedValueOnce({
  data: {
    path: "test-user-id/sopheak/abc123-photo.png",
  },
  error: null,
});

    const file = new File(
      ["fake image"],
      "photo.png",
      {
        type: "image/png",
      },
    );

    const formData = {
      get: vi.fn().mockReturnValue(file),
    };

    const request = {
      formData: vi
        .fn()
        .mockResolvedValue(formData),
    } as unknown as Request;

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(201);

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.path).toMatch(
      /^test-user-id\/sopheak\/.+-photo\.png$/,
    );

    expect(mockStorageFrom).toHaveBeenCalledWith(
      "message-images",
    );

    expect(mockStorageUpload).toHaveBeenCalledTimes(1);
  },
);

    

  it(
  "returns 500 when image upload fails",
  async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        conversation_id: "sopheak",
      },
      error: null,
    });

    mockStorageUpload.mockResolvedValueOnce({
      data: null,
      error: {
        message: "Storage upload failed",
      },
    });

    const file = new File(
      ["fake image"],
      "photo.png",
      {
        type: "image/png",
      },
    );

    const formData = {
      get: vi.fn().mockReturnValue(file),
    };

    const request = {
      formData: vi
        .fn()
        .mockResolvedValue(formData),
    } as unknown as Request;

    const response = await POST(request, {
      params: Promise.resolve({
        conversationId: "sopheak",
      }),
    });

    expect(response.status).toBe(500);

    const result = await response.json();

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Failed to upload image",
    );
  },
);

  },
);
