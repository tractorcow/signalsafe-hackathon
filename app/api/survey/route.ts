import { NextResponse } from "next/server";
import { getSurvey } from "@/lib/survey";

/**
 * GET /api/survey
 * Returns the full survey (surveyId + questions). Data from survey.json.
 */
export async function GET() {
  const survey = getSurvey();
  return NextResponse.json(survey);
}
