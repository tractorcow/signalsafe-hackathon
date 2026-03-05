import { NextResponse } from "next/server";
import { getQuestion } from "@/lib/survey";

type RouteParams = { params: Promise<{ questionId: string }> };

/**
 * GET /api/survey/questions/[questionId]
 * Returns a single question by id, or 404 if not found.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { questionId } = await params;
  const question = getQuestion(questionId);
  if (!question) {
    return NextResponse.json(
      { error: "Question not found", questionId },
      { status: 404 }
    );
  }
  return NextResponse.json(question);
}
