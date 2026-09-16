import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * ============================================================
 * MESSAGES API
 * ============================================================
 *
 * GET  /api/conversations/[conversationId]/messages
 * POST /api/conversations/[conversationId]/messages
 *
 * 19.5.3:
 * POST message → Supabase Database
 * ============================================================
 */

interface RouteContext {
  params: Promise<{
    conversationId: string;
  }>;
}

/**
 * ============================================================
 * GET MESSAGES
 * ============================================================
 *
 * បច្ចុប្បន្ន GET នៅតែប្រើ mock data។
 *
 * 19.5.4 យើងនឹងប្តូរ GET ទៅ Database។
 * ============================================================
 */
const messagesByConversation = {
  sopheak: [
    {
      id: "sopheak-1",
      sender: "other",
      text: "សួស្តី! អ្នកសុខសប្បាយទេ?",
      time: "10:24 AM",
      status: "read",
    },
    {
      id: "sopheak-2",
      sender: "me",
      text: "ខ្ញុំសុខសប្បាយទេ! អរគុណដែលបានសួរ។",
      time: "10:25 AM",
      status: "read",
    },
    {
      id: "sopheak-3",
      sender: "other",
      text: "តើអ្នកកំពុងធ្វើការលើគម្រោងថ្មីមែនទេ?",
      time: "10:26 AM",
      status: "read",
    },
    {
      id: "sopheak-4",
      sender: "me",
      text: "បាទ/ចាស ខ្ញុំកំពុងបង្កើតវេទិកាជជែកឥឡូវនេះ។",
      time: "10:27 AM",
      status: "read",
    },
    {
      id: "sopheak-5",
      sender: "other",
      text: "ល្អណាស់! វាមើលទៅគួរឱ្យចាប់អារម្មណ៍។",
      time: "10:28 AM",
      status: "read",
    },
  ],

  dara: [
    {
      id: "dara-1",
      sender: "other",
      text: "សួស្តី! ថ្ងៃស្អែកអ្នកទំនេរទេ?",
      time: "9:40 AM",
      status: "read",
    },
    {
      id: "dara-2",
      sender: "me",
      text: "បាទ/ចាស ខ្ញុំគិតថាខ្ញុំទំនេរ។",
      time: "9:42 AM",
      status: "read",
    },
    {
      id: "dara-3",
      sender: "other",
      text: "ល្អណាស់។ ជួបគ្នាថ្ងៃស្អែក!",
      time: "9:43 AM",
      status: "read",
    },
  ],

  vanna: [
    {
      id: "vanna-1",
      sender: "other",
      text: "អរគុណសម្រាប់ជំនួយរបស់អ្នក។",
      time: "8:20 AM",
      status: "read",
    },
    {
      id: "vanna-2",
      sender: "me",
      text: "មិនអីទេ!",
      time: "8:22 AM",
      status: "read",
    },
  ],

  "development-team": [
    {
      id: "team-1",
      sender: "other",
      text: "មុខងារថ្មីរួចរាល់ហើយ។",
      time: "8:00 AM",
      status: "read",
    },
    {
      id: "team-2",
      sender: "me",
      text: "ល្អណាស់! ខ្ញុំនឹងពិនិត្យវានៅថ្ងៃនេះ។",
      time: "8:05 AM",
      status: "read",
    },
    {
      id: "team-3",
      sender: "other",
      text: "សូមប្រាប់យើងប្រសិនបើអ្នករកឃើញបញ្ហាណាមួយ។",
      time: "8:06 AM",
      status: "read",
    },
  ],

  family: [
    {
      id: "family-1",
      sender: "other",
      text: "អាហារពេលល្ងាចនៅម៉ោង 7:00 យប់។",
      time: "7:10 AM",
      status: "read",
    },
    {
      id: "family-2",
      sender: "me",
      text: "បាន ខ្ញុំនឹងទៅទីនោះ។",
      time: "7:12 AM",
      status: "read",
    },
    {
      id: "family-3",
      sender: "other",
      text: "ជួបគ្នាយប់នេះ!",
      time: "7:13 AM",
      status: "read",
    },
  ],
} as const;

type ConversationId = keyof typeof messagesByConversation;

/**
 * ============================================================
 * GET MESSAGES FROM SUPABASE
 * ============================================================
 *
 * GET /api/conversations/[conversationId]/messages
 *
 * Flow:
 * 1. Get conversationId
 * 2. Query messages from Supabase
 * 3. Sort by created_at ASC
 * 4. Convert Database row → Frontend Message format
 * 5. Return messages
 * ============================================================
 */
export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const { conversationId } = await params;

  /**
   * ----------------------------------------------------------
   * 1. Create server-side Supabase admin client
   * ----------------------------------------------------------
   */
  const supabase = createSupabaseAdminClient();

  /**
   * ----------------------------------------------------------
   * 2. Read messages from Database
   * ----------------------------------------------------------
   *
   * Only return messages belonging to this conversation.
   *
   * ascending = oldest → newest
   */
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, sender_id, content, status, created_at",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", {
      ascending: true,
    });

  /**
   * ----------------------------------------------------------
   * 3. Handle Database error
   * ----------------------------------------------------------
   */
  if (error) {
    console.error(
      "Failed to load messages:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load messages",
      },
      { status: 500 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. Convert Database rows → Frontend Message format
   * ----------------------------------------------------------
   */
  const messages = data.map((message) => ({
    id: message.id,
    sender:
      message.sender_id === "me"
        ? ("me" as const)
        : ("other" as const),
    text: message.content,
    time: new Date(
      message.created_at,
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    status: message.status as
      | "sent"
      | "delivered"
      | "read",
  }));

  /**
   * ----------------------------------------------------------
   * 5. Return messages
   * ----------------------------------------------------------
   */
  return NextResponse.json({
    success: true,
    data: messages,
  });
}

/**
 * ============================================================
 * POST / CREATE MESSAGE
 * ============================================================
 *
 * Flow:
 *
 * 1. Get conversationId
 * 2. Validate conversation
 * 3. Read text from request
 * 4. Validate text
 * 5. Insert message into Supabase
 * 6. Return saved message
 * ============================================================
 */
export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  const { conversationId } = await params;

  /**
   * ----------------------------------------------------------
   * 1. Check conversation
   * ----------------------------------------------------------
   */
  const messages =
    messagesByConversation[
      conversationId as ConversationId
    ];

  if (!messages) {
    return NextResponse.json(
      {
        success: false,
        message: "Conversation not found",
      },
      { status: 404 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 2. Read request body
   * ----------------------------------------------------------
   */
  const body = await request.json();

  const text =
    typeof body.text === "string"
      ? body.text.trim()
      : "";

  /**
   * ----------------------------------------------------------
   * 3. Validate message text
   * ----------------------------------------------------------
   */
  if (!text) {
    return NextResponse.json(
      {
        success: false,
        message: "Message text is required",
      },
      { status: 400 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 4. Create Supabase admin client
   * ----------------------------------------------------------
   *
   * ប្រើ server-only secret key។
   *
   * IMPORTANT:
   * SUPABASE_SECRET_KEY
   * មិនត្រូវដាក់ NEXT_PUBLIC_ ទេ។
   * ----------------------------------------------------------
   */
  const supabase = createSupabaseAdminClient();

  /**
   * ----------------------------------------------------------
   * 5. Save message into Database
   * ----------------------------------------------------------
   */
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: "me",
      content: text,
      status: "sent",
    })
    .select(
      "id, conversation_id, sender_id, content, status, created_at",
    )
    .single();

  /**
   * ----------------------------------------------------------
   * 6. Handle Database error
   * ----------------------------------------------------------
   */
  if (error) {
    console.error(
      "Failed to save message:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save message",
      },
      { status: 500 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 7. Convert Database row → Frontend Message format
   * ----------------------------------------------------------
   */
  const savedMessage = {
    id: data.id,
    sender: "me" as const,
    text: data.content,
    time: new Date(
      data.created_at,
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    status: data.status as
      | "sent"
      | "delivered"
      | "read",
  };

  /**
   * ----------------------------------------------------------
   * 8. Return saved message
   * ----------------------------------------------------------
   */
  return NextResponse.json(
    {
      success: true,
      data: savedMessage,
    },
    { status: 201 },
  );
}