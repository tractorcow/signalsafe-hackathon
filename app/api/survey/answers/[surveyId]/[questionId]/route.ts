import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/survey/answers/[surveyId]/[questionId]
 * Returns answers (sentiments + feedback) for the given surveyId and questionId.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ surveyId: string; questionId: string }> }
) {
  const { surveyId, questionId } = await params;

  const [sentiments, feedbackList] = await Promise.all([
    prisma.surveyQuestionSentiment.findMany({
      where: { surveyId, questionId },
      orderBy: { sentimentKey: "asc" },
    }),
    prisma.surveyQuestionFeedback.findMany({
      where: { surveyId, questionId },
      orderBy: { feedbackKey: "asc" },
    }),
  ]);

  return NextResponse.json({
    surveyId,
    questionId,
    sentiments: sentiments.map(({ sentimentKey, sentimentStrength }) => ({
      sentimentKey,
      sentimentStrength,
    })),
    feedback: feedbackList.map(({ feedbackKey, feedbackValue }) => ({
      feedbackKey,
      feedbackValue,
    })),
  });
}
