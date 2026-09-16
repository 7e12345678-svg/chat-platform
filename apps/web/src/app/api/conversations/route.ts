import { NextResponse } from "next/server";

/**
 * ============================================================
 * CONVERSATIONS API
 * ============================================================
 *
 * GET /api/conversations
 *
 * បច្ចុប្បន្នប្រើ mock data។
 * ពេល Database រួចរាល់ នឹងប្តូរទៅ Database query។
 */
export async function GET() {
  const conversations = [
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

  return NextResponse.json({
    success: true,
    data: conversations,
  });
}


