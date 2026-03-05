-- CreateTable
CREATE TABLE "SurveyQuestionFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "surveyId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "feedbackKey" TEXT NOT NULL,
    "feedbackValue" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
