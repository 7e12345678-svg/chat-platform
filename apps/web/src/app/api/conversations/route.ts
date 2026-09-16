import { NextResponse } from "next/server";

/**
 * ============================================================
 * CONVERSATIONS API
 * ============================================================
 *
 * GET  /api/conversations
 * POST /api/conversations
 *
 * បច្ចុប្បន្នប្រើ in-memory mock data។
 * ពេល Database រួចរាល់ នឹងប្តូរទៅ Database query។
 * ============================================================
 */

interface Conversation {
  id: string;
  name: string;
  fallback: string;
  online: boolean;
}

/**
 * ============================================================
 * MOCK CONVERSATIONS
 * ============================================================
 */
const conversations: Conversation[] = [
  {
    id: "sopheak",
    name: "Sopheak",
    fallback: "S",
    online: true,
  },
  {
    id: "dara",
    name: "Dara",
    fallback: "D",
    online: true,
  },
  {
    id: "vanna",
    name: "Vanna",
    fallback: "V",
    online: false,
  },
  {
    id: "development-team",
    name: "ក្រុមអភិវឌ្ឍន៍",
    fallback: "D",
    online: true,
  },
  {
    id: "family",
    name: "គ្រួសារ",
    fallback: "F",
    online: false,
  },
];

/**
 * ============================================================
 * GET /api/conversations
 * ============================================================
 *
 * Return all conversations.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: conversations,
  });
}

/**
 * ============================================================
 * POST /api/conversations
 * ============================================================
 *
 * Create a new conversation.
 *
 * Request:
 * {
 *   name: string;
 * }
 */
export async function POST(request: Request) {
  /**
   * ----------------------------------------------------------
   * 1. Read request body
   * ----------------------------------------------------------
   */
  const body = await request.json();

  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : "";

  /**
   * ----------------------------------------------------------
   * 2. Validate conversation name
   * ----------------------------------------------------------
   */
  if (!name) {
    return NextResponse.json(
      {
        success: false,
        message: "Conversation name is required",
      },
      { status: 400 },
    );
  }

  /**
   * ----------------------------------------------------------
   * 3. Create new conversation
   * ----------------------------------------------------------
   */
  const newConversation: Conversation = {
    id: `conversation-${Date.now()}`,
    name,
    fallback: name.charAt(0).toUpperCase(),
    online: false,
  };

  /**
   * ----------------------------------------------------------
   * 4. Store conversation
   * ----------------------------------------------------------
   */
  conversations.push(newConversation);

  /**
   * ----------------------------------------------------------
   * 5. Return created conversation
   * ----------------------------------------------------------
   */
  return NextResponse.json(
    {
      success: true,
      data: newConversation,
    },
    { status: 201 },
  );
}