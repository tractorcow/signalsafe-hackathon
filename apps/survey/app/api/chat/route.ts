import { NextResponse } from "next/server";
import { SURVEY_SYSTEM_PROMPT, buildSurveyTopicPrompt } from "@/lib/survey-system-prompt";
import { getSurvey } from "@/lib/survey";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: {
    messages: ChatMessage[];
    surveyId?: string;
    questionId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, surveyId, questionId } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages array is required" },
      { status: 400 }
    );
  }

  const survey = getSurvey();
  const question = survey.questions.find((q) => q.questionId === questionId);

  const systemContent = question
    ? `${SURVEY_SYSTEM_PROMPT}\n\n${buildSurveyTopicPrompt({
        surveyId: surveyId ?? survey.surveyId,
        questionId: questionId ?? question.questionId,
        topicPrompt: question.systemPrompt,
        introLine: question.introLine,
      })}`
    : SURVEY_SYSTEM_PROMPT;

  const apiMessages: ChatMessage[] = [
    { role: "system", content: systemContent },
    ...messages.map((m: ChatMessage) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
        messages: apiMessages,
        max_tokens: 1024,
        temperature: 0.7,
        provider: { zdr: true },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenRouter error:", res.status, errText);
      return NextResponse.json(
        { error: "LLM request failed", details: errText },
        { status: res.status >= 500 ? 502 : 400 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message ?? "Unknown OpenRouter error" },
        { status: 502 }
      );
    }

    const content =
      data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 500 }
    );
  }
}
