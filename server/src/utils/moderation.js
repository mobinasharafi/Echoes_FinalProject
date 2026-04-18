import leoProfanity from "leo-profanity";

export function checkContributionSafety(text) {
  if (!text || !text.trim()) {
    return {
      blocked: false,
    };
  }

  const blocked = leoProfanity.check(text);

  if (blocked) {
    return {
      blocked: true,
      message:
        "Please do not use harmful, abusive, or aggressive language in contributions.",
    };
  }

  return {
    blocked: false,
  };
}