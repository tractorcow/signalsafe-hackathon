import { NextResponse } from "next/server";
import { getSurvey } from "@/lib/survey";

/**
 * GET /api/survey/all
 * Returns all surveys. Currently a single survey from survey.json.
 */
export async function GET() {
  const survey = getSurvey();
  return NextResponse.json([survey]);
}
