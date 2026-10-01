/**
 * Vignette & Interstitial Ad Utility
 * Cleaned and secured for Google AdSense & Better Ads Standards compliance.
 * Third-party popunders and aggressive interstitials are disabled to prevent invalid traffic penalties.
 */

export const injectVignetteScript = (): HTMLScriptElement | null => {
  // Disabled during AdSense compliance to ensure zero unauthorized popunders or redirects
  return null;
};

export const triggerSurveyStartVignetteAd = (_context: string = 'survey_start'): void => {
  // Policy compliant no-op: Google AdSense auto-ads handle non-intrusive vignettes natively
};

export const triggerSurveyQuestionAd = (_questionNumber: number): void => {
  // Policy compliant no-op: Forced popups between survey questions violate AdSense standards
};


