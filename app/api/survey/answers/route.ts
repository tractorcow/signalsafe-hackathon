import { NextResponse } from "next/server";
import {
  writeSurveyAnswer,
  type SurveyAnswerPayload,
} from "@/app/lib/survey-answer";
import { SENTIMENT_KEYS } from "@/lib/sentiments";
import type { SentimentKeyType } from "@/lib/sentiments";

function isSentimentKey(key: string): key is SentimentKeyType {
  return (SENTIMENT_KEYS as readonly string[]).includes(key);
}

/**
 * POST /api/survey/answers
 * Body: SurveyAnswerPayload
 * - surveyId: string
 * - questionId: string
 * - sentiment: Record<string, number> (sentiment key -> strength 0–1)
 * - feedback: Record<string, string>
 * Writes to SurveyQuestionSentiment and SurveyQuestionFeedback.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const payload = body as SurveyAnswerPayload;
  const { surveyId, questionId, sentiment, feedback } = payload;

  if (
    typeof surveyId !== "string" ||
    !surveyId ||
    typeof questionId !== "string" ||
    !questionId
  ) {
    return NextResponse.json(
      { error: "surveyId and questionId are required strings" },
      { status: 400 }
    );
  }

  if (typeof sentiment !== "object" || sentiment === null) {
    return NextResponse.json(
      { error: "sentiment must be an object" },
      { status: 400 }
    );
  }

  if (typeof feedback !== "object" || feedback === null) {
    return NextResponse.json(
      { error: "feedback must be an object" },
      { status: 400 }
    );
  }

  const normalizedSentiment: Record<string, number> = {};
  for (const [key, value] of Object.entries(sentiment)) {
    if (isSentimentKey(key) && typeof value === "number" && !Number.isNaN(value)) {
      normalizedSentiment[key] = value;
    }
  }

  const normalizedFeedback: Record<string, string> = {};
  for (const [key, value] of Object.entries(feedback)) {
    if (typeof key === "string" && key) {
      normalizedFeedback[key] = typeof value === "string" ? value : String(value ?? "");
    }
  }

  try {
    const result = await writeSurveyAnswer({
      surveyId,
      questionId,
      sentiment: normalizedSentiment,
      feedback: normalizedFeedback,
    });
    return NextResponse.json({
      ok: true,
      sentimentCount: result.sentimentCount,
      feedbackCount: result.feedbackCount,
    });
  } catch (err) {
    console.error("writeSurveyAnswer error:", err);
    return NextResponse.json(
      { error: "Failed to save survey answer" },
      { status: 500 }
    );
  }
}
