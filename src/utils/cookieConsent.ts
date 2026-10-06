/**
 * Cookie Consent & Advertising Compliance Manager
 * Enforces real user consent control over Google AdSense and analytics cookies.
 */

export interface CookieConsentData {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp: string;
  choice: 'accept_all' | 'essential_only' | 'custom';
}

export const CONSENT_STORAGE_KEY = 'vf360_cookie_consent';
export const CONSENT_EVENT_NAME = 'vf360_cookie_consent_updated';

/**
 * Reads stored consent object from localStorage.
 */
export function getStoredCookieConsent(): CookieConsentData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        essential: true,
        analytics: Boolean(parsed.analytics),
        advertising: Boolean(parsed.advertising),
        timestamp: parsed.timestamp || new Date().toISOString(),
        choice: parsed.choice || 'custom',
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Strict check: advertising is ONLY enabled if the user has explicitly consented.
 * Defaults to false (denied) if banner has not yet been acted upon.
 */
export function hasAdvertisingConsent(): boolean {
  const consent = getStoredCookieConsent();
  return Boolean(consent?.advertising);
}

/**
 * Strict check for analytics cookies.
 */
export function hasAnalyticsConsent(): boolean {
  const consent = getStoredCookieConsent();
  return Boolean(consent?.analytics);
}

/**
 * Updates Google Consent Mode state for AdSense and tags.
 */
export function syncGoogleConsentMode(advertisingGranted: boolean, analyticsGranted: boolean): void {
  if (typeof window === 'undefined') return;

  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };

  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function (...args: unknown[]) {
      w.dataLayer?.push(args);
    };
  }

  const consentParams = {
    ad_storage: advertisingGranted ? 'granted' : 'denied',
    ad_user_data: advertisingGranted ? 'granted' : 'denied',
    ad_personalization: advertisingGranted ? 'granted' : 'denied',
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
  };

  try {
    w.gtag('consent', 'update', consentParams);
  } catch (err) {
    console.debug('Consent mode sync error:', err);
  }
}

/**
 * Saves consent choices, updates Google Consent Mode, and dispatches global event.
 */
export function saveCookieConsent(
  prefs: { analytics: boolean; advertising: boolean },
  choice: 'accept_all' | 'essential_only' | 'custom'
): CookieConsentData {
  const data: CookieConsentData = {
    essential: true,
    analytics: prefs.analytics,
    advertising: prefs.advertising,
    timestamp: new Date().toISOString(),
    choice,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Unable to persist cookie consent:', e);
    }

    // Sync with Google Consent Mode
    syncGoogleConsentMode(data.advertising, data.analytics);

    // Notify all active React components in this window
    window.dispatchEvent(
      new CustomEvent(CONSENT_EVENT_NAME, {
        detail: data,
      })
    );
  }

  return data;
}
