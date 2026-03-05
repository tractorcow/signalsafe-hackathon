import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/survey/answers/[surveyId]
 * Returns all answers (sentiments + feedback) for the given surveyId, grouped by questionId.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ surveyId: string }> }
) {
  const { surveyId } = await params;

  const [sentiments, feedbackList] = await Promise.all([
    prisma.surveyQuestionSentiment.findMany({
      where: { surveyId },
      orderBy: [{ questionId: "asc" }, { sentimentKey: "asc" }],
    }),
    prisma.surveyQuestionFeedback.findMany({
      where: { surveyId },
      orderBy: [{ questionId: "asc" }, { feedbackKey: "asc" }],
    }),
  ]);

  const questionIds = [
    ...new Set([
      ...sentiments.map((s) => s.questionId),
      ...feedbackList.map((f) => f.questionId),
    ]),
  ].sort();

  const questions = questionIds.map((questionId) => {
    const questionSentiments = sentiments
      .filter((s) => s.questionId === questionId)
      .map(({ sentimentKey, sentimentStrength }) => ({
        sentimentKey,
        sentimentStrength,
      }));
    const questionFeedback = feedbackList
      .filter((f) => f.questionId === questionId)
      .map(({ feedbackKey, feedbackValue }) => ({
        feedbackKey,
        feedbackValue,
      }));
    return {
      questionId,
      sentiments: questionSentiments,
      feedback: questionFeedback,
    };
  });

  return NextResponse.json({
    surveyId,
    questions,
  });
}
