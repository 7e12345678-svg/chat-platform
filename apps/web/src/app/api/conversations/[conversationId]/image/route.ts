import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: {
    params: Promise<{
      conversationId: string;
    }>;
  },
) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required",
      },
      { status: 401 },
    );
  }

  const { conversationId } = await params;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        success: false,
        message: "Image file is required",
      },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unsupported image type",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      {
        success: false,
        message: "Image file is too large",
      },
      { status: 400 },
    );
  }

  /**
   * ----------------------------------------------------------
   * Check conversation membership
   * ----------------------------------------------------------
   */
  const supabase = createSupabaseAdminClient();

  const { data: membership, error: membershipError } =
    await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (membershipError) {
    console.error(
      "Failed to check conversation membership:",
      membershipError,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to check conversation membership",
      },
      { status: 500 },
    );
  }

  if (!membership) {
    return NextResponse.json(
      {
        success: false,
        message: "Conversation membership required",
      },
      { status: 403 },
    );
  }

  /**
   * ----------------------------------------------------------
   * Build a safe unique Storage path.
   * ----------------------------------------------------------
   */
  const safeFileName = file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "_",
  );

  const storagePath = [
    user.id,
    conversationId,
    `${crypto.randomUUID()}-${safeFileName}`,
  ].join("/");

  /**
   * ----------------------------------------------------------
   * Upload image to private Storage bucket.
   * ----------------------------------------------------------
   */
  const { data: uploadData, error: uploadError } =
    await supabase.storage
      .from("message-images")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

  if (uploadError) {
    console.error(
      "Failed to upload message image:",
      uploadError,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        path: uploadData.path,
      },
    },
    { status: 201 },
  );
}
