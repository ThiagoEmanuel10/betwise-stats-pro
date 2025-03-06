
// Google Analytics Event Tracking
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, eventParams);
  }
};

// Specific event tracking functions
export const trackPageView = (pagePath: string, pageTitle: string) => {
  trackEvent("page_view", {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

export const trackPredictionView = (matchId: string, teams: string) => {
  trackEvent("prediction_view", {
    match_id: matchId,
    teams: teams,
  });
};

export const trackPredictionShare = (matchId: string, platform: string) => {
  trackEvent("prediction_share", {
    match_id: matchId,
    share_platform: platform,
  });
};

export const trackSubscriptionView = (plan: string) => {
  trackEvent("subscription_view", {
    plan_type: plan,
  });
};
