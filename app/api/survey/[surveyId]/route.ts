import { NextResponse } from "next/server";
import { getSurvey, getSurveyId } from "@/lib/survey";

type RouteParams = { params: Promise<{ surveyId: string }> };

/**
 * GET /api/survey/[surveyId]
 * Returns a single survey by id, or 404 if not found.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { surveyId } = await params;
  const currentId = getSurveyId();
  if (surveyId !== currentId) {
    return NextResponse.json(
      { error: "Survey not found", surveyId },
      { status: 404 }
    );
  }
  const survey = getSurvey();
  return NextResponse.json(survey);
}
