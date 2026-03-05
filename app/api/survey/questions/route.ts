import { NextResponse } from "next/server";
import { getQuestions } from "@/lib/survey";

/**
 * GET /api/survey/questions
 * Returns all questions for the survey.
 */
export async function GET() {
  const questions = getQuestions();
  return NextResponse.json(questions);
}
