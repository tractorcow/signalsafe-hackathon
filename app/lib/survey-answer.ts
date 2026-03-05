import { prisma } from "@/lib/db";
import { SENTIMENT_KEYS } from "@/lib/sentiments";
import type { SentimentKeyType } from "@/lib/sentiments";

export type SurveyAnswerPayload = {
  surveyId: string;
  questionId: string;
  sentiment: Record<string, number>;
  feedback: Record<string, string>;
};

function isSentimentKey(key: string): key is SentimentKeyType {
  return (SENTIMENT_KEYS as readonly string[]).includes(key);
}

function clampStrength(value: number): number {
  return Math.max(0, Math.min(1, Number(value)));
}

/**
 * Writes a single survey answer into both SurveyQuestionSentiment and SurveyQuestionFeedback.
 * - sentiment: object of sentiment key -> strength (0–1); only valid SentimentKey keys are stored.
 * - feedback: key-value pairs; each entry is stored as one SurveyQuestionFeedback row (feedbackKey, feedbackValue).
 */
export async function writeSurveyAnswer(payload: SurveyAnswerPayload): Promise<{
  sentimentCount: number;
  feedbackCount: number;
}> {
  const { surveyId, questionId, sentiment, feedback } = payload;

  const sentimentRows = Object.entries(sentiment)
    .filter(([key]) => isSentimentKey(key))
    .map(([key, value]) => ({
      surveyId,
      questionId,
      sentimentKey: key as SentimentKeyType,
      sentimentStrength: clampStrength(value),
    }));

  const feedbackRows = Object.entries(feedback).map(([feedbackKey, feedbackValue]) => ({
    surveyId,
    questionId,
    feedbackKey,
    feedbackValue: feedbackValue ?? "",
  }));

  await prisma.$transaction(async (tx) => {
    for (const row of sentimentRows) {
      await tx.surveyQuestionSentiment.upsert({
        where: {
          surveyId_questionId_sentimentKey: {
            surveyId,
            questionId,
            sentimentKey: row.sentimentKey,
          },
        },
        create: row,
        update: { sentimentStrength: row.sentimentStrength },
      });
    }
    await tx.surveyQuestionFeedback.createMany({
      data: feedbackRows,
    });
  });

  return {
    sentimentCount: sentimentRows.length,
    feedbackCount: feedbackRows.length,
  };
}
