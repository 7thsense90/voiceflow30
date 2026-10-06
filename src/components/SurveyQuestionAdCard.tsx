import React from 'react';

/**
 * SurveyQuestionAdCard
 *
 * In strict compliance with Google AdSense Policies and Better Ads Standards:
 * Advertisements are completely excluded from survey questionnaires and chat flows.
 * Survey participation and compensation remain strictly separated from advertising.
 */

interface SurveyQuestionAdCardProps {
  questionNumber?: number;
  totalQuestions?: number;
  adIndex?: number;
}

export const SurveyQuestionAdCard: React.FC<SurveyQuestionAdCardProps> = () => {
  // Advertisements are strictly prohibited inside survey questionnaires
  return null;
};

export default SurveyQuestionAdCard;
