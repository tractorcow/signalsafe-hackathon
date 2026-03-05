import { NextResponse } from "next/server";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

type SurveyQuestion = {
  questionId: string;
  systemPrompt: string;
  introLine: string;
  listOfFeedback: string[];
};

type Survey = {
  surveyId: string;
  questions: SurveyQuestion[];
};

function loadSurvey(): Survey {
  const path = join(process.cwd(), "data", "survey.json");
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as Survey;
}

const SUMMARY_JSON_FORMAT = `{
  "sentiment": "positive" | "negative" | "mixed",
  "summary": "One or two sentences capturing the general response.",
  "doneWell": ["Brief point 1", "Brief point 2"],
  "couldImprove": ["Brief point 1", "Brief point 2"]
}`;

function buildSystemPrompt(survey: Survey): string {
  const questionIds = survey.questions.map((q) => q.questionId).join(", ");
  const questionsText = survey.questions
    .map(
      (q) =>
        `- ${q.questionId}: ${q.introLine} (explore: ${q.listOfFeedback.join(", ")})`
    )
    .join("\n");
  const totalTopics = survey.questions.length;

  return `You are a friendly, conversational survey agent for Rush. You will have a conversation with a Rush employee and guide them through a discussion on their feelings.

Your goal in this discussion is to measure:
1. Sentiment — their positive or negative feelings.
2. Feedback on what has been done well.
3. Feedback on what can be done better or differently in the future.

There are exactly ${totalTopics} topics that must be covered. Topic IDs: ${questionIds}.
You must not finish the survey until you have received at least one answer for every topic. Do not output [SURVEY_COMPLETE] until all ${totalTopics} topics have been covered.

Survey topics and main questions (use these to guide the conversation; rephrase in your own words so it feels natural):
${questionsText}

Guidelines:
- Ask sufficient questions until you have captured an appropriate level of detail to answer the three goals above.
- Try to limit the conversation to three or four replies maximum per topic. Once you have enough detail, move on.
- Be warm and concise. One question or short follow-up at a time.
- After you have captured the answer for a topic, you will summarise the general response and post it in JSON format to an endpoint. Format the summary for each topic as follows (use this structure when submitting):

${SUMMARY_JSON_FORMAT}

- In your replies to the user, output only the assistant's next message text. No labels, no quotes, no "Agent:" prefix. Do not output JSON in the chat — the JSON summary is for the backend only.
- If the user has just opened the survey, give a brief welcome and ask your first question (you may start with any topic from the list; vary which one you start with).
- When you have covered all ${totalTopics} topics and are concluding the entire survey, end your final message with exactly [SURVEY_COMPLETE] (no space before it). On the next line, list every topic you have received at least one answer for as: [COVERED: id1, id2, id3, ...] using the exact topic IDs from the list above (e.g. q1-overall-sentiment, q2-org-direction). The backend will only mark the survey complete if all topics are in this list.`;
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not set" },
        { status: 500 }
      );
    }

    const { messages } = (await req.json()) as {
      messages: { role: "agent" | "user"; content: string }[];
    };

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const survey = loadSurvey();
    const systemPrompt = buildSystemPrompt(survey);

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(messages.length === 0
        ? [
            {
              role: "user" as const,
              content: "[The user has just opened the survey. Say a brief welcome and ask your first question.]",
            },
          ]
        : messages.map((m) => ({
            role: m.role === "agent" ? "assistant" as const : ("user" as const),
            content: m.content,
          }))),
    ];

    const completion = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
      messages: openaiMessages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const raw =
      completion.choices[0]?.message?.content?.trim() ||
      "Thanks for sharing. Is there anything else you'd like to add?";

    const requiredQuestionIds = new Set(
      survey.questions.map((q) => q.questionId)
    );
    const coveredMatch = raw.match(/\[COVERED:\s*([^\]]+)\]/i);
    const coveredIds = coveredMatch
      ? new Set(
          coveredMatch[1]
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
        )
    : new Set<string>();
    const allCovered =
      requiredQuestionIds.size > 0 &&
      [...requiredQuestionIds].every((id) =>
        coveredIds.has(id.toLowerCase())
      );

    const hasCompleteMarker = raw.includes("[SURVEY_COMPLETE]");
    const surveyComplete =
      hasCompleteMarker && allCovered;

    let content = raw
      .replace(/\s*\[SURVEY_COMPLETE\]\s*/i, "")
      .replace(/\s*\[COVERED:\s*[^\]]+\]\s*/gi, "")
      .trim();

    return NextResponse.json({ content, surveyComplete });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get AI response" },
      { status: 500 }
    );
  }
}
