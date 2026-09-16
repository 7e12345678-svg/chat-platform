import { NextResponse } from "next/server";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

type ConversationId =
  | "sopheak"
  | "dara"
  | "vanna"
  | "development-team"
  | "family";

interface Message {
  id: string;
  sender: "me" | "other";
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
}

interface RouteContext {
  params: Promise<{
    conversationId: string;
  }>;
}

/**
 * ============================================================
 * MOCK MESSAGES
 * ============================================================
 *
 * បណ្តោះអាសន្នសម្រាប់ API testing។
 * ពេល Database រួចរាល់ នឹងប្តូរទៅ Database query។
 */
const messagesByConversation: Record<
  ConversationId,
  Message[]
> = {
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
};

/**
 * ============================================================
 * GET MESSAGES
 * ============================================================
 *
 * GET /api/conversations/[conversationId]/messages
 */
export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const { conversationId } = await params;

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

  return NextResponse.json({
    success: true,
    data: messages,
  });
}

/**
 * ============================================================
 * CREATE MESSAGE
 * ============================================================
 *
 * POST /api/conversations/[conversationId]/messages
 *
 * ទទួល message ថ្មីពី client។
 */
export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  const { conversationId } = await params;

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

  const body = await request.json();

  const text =
    typeof body.text === "string"
      ? body.text.trim()
      : "";

  if (!text) {
    return NextResponse.json(
      {
        success: false,
        message: "Message text is required",
      },
      { status: 400 },
    );
  }

  const newMessage = {
    id: `${conversationId}-${Date.now()}`,
    sender: "me" as const,
    text,
    time: new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    status: "sent" as const,
  };

  return NextResponse.json(
    {
      success: true,
      data: newMessage,
    },
    { status: 201 },
  );
}