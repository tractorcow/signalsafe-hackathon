-- CreateTable
CREATE TABLE "SurveyQuestionSentiment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "surveyId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sentimentKey" TEXT NOT NULL,
    "sentimentStrength" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "SurveyQuestionSentiment_surveyId_questionId_sentimentKey_key" ON "SurveyQuestionSentiment"("surveyId", "questionId", "sentimentKey");
