import surveyData from "@/survey.json";

export type SurveyQuestion = {
  questionId: string;
  systemPrompt: string;
  introLine: string;
  listOfFeedback: string[];
};

export type Survey = {
  surveyId: string;
  questions: SurveyQuestion[];
};

let cachedSurvey: Survey | null = null;

function loadSurvey(): Survey {
  if (cachedSurvey) return cachedSurvey;
  cachedSurvey = surveyData as Survey;
  return cachedSurvey;
}

/**
 * Returns the full survey (surveyId + questions). Data is read from survey.json.
 */
export function getSurvey(): Survey {
  return loadSurvey();
}

/**
 * Returns the survey id.
 */
export function getSurveyId(): string {
  return loadSurvey().surveyId;
}

/**
 * Returns all questions for the survey.
 */
export function getQuestions(): SurveyQuestion[] {
  return loadSurvey().questions;
}

/**
 * Returns a single question by id, or undefined if not found.
 */
export function getQuestion(questionId: string): SurveyQuestion | undefined {
  return loadSurvey().questions.find((q) => q.questionId === questionId);
}
