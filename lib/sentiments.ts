import { SentimentKey } from "@/prisma/generated/prisma/enums";

export { SentimentKey };
export type SentimentKeyType = (typeof SentimentKey)[keyof typeof SentimentKey];

export const SENTIMENT_KEYS: SentimentKeyType[] = Object.values(SentimentKey);

export const SENTIMENT_LABELS: Record<SentimentKeyType, string> = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
  joy: "Joy",
  sadness: "Sadness",
  anger: "Anger",
  fear: "Fear",
  surprise: "Surprise",
  disgust: "Disgust",
  trust: "Trust",
  anticipation: "Anticipation",
  confusion: "Confusion",
  satisfaction: "Satisfaction",
  gratitude: "Gratitude",
};
