import { NextResponse } from "next/server";
import { SENTIMENT_KEYS, SENTIMENT_LABELS } from "@/lib/sentiments";

/**
 * GET /api/sentiments
 * Returns sentiment keys (enum values) and their display labels.
 */
export async function GET() {
  return NextResponse.json({
    keys: SENTIMENT_KEYS,
    labels: SENTIMENT_LABELS,
  });
}
