import { AgeProfile, MaturityScores } from '../types/book';

export const AGE_PROFILES: Record<number, AgeProfile> = {
  10: {
    age: 10,
    grade: '5th Grade',
    stage: 'Upper Elementary / Tween Transition',
    lexileRange: '730L - 940L',
    maxRecommendedViolence: 'Mild',
    maxRecommendedLanguage: 'Clean',
    maxRecommendedRomance: 'None',
    maxRecommendedThemes: 'Mild',
    guidelines: 'Focus on empathy, friendship, adventure, wonder, humor, and mystery without graphic violence, profanity, or mature romantic situations. Peril should be fantasy/adventure-oriented with reassuring resolutions.',
    commonThemes: ['Friendship', 'Teamwork', 'Adventure', 'School Life', 'Animal Companions', 'Mythology', 'Humor'],
  },
  11: {
    age: 11,
    grade: '6th Grade',
    stage: 'Early Middle School',
    lexileRange: '830L - 1010L',
    maxRecommendedViolence: 'Mild',
    maxRecommendedLanguage: 'Clean',
    maxRecommendedRomance: 'None',
    maxRecommendedThemes: 'Mild',
    guidelines: 'Transition into independent identity, belonging, family shifts, and mild suspense. Mild peril and emotional tension are acceptable; avoid explicit gore, sexual content, and harsh language.',
    commonThemes: ['Self-discovery', 'Found Family', 'Mystery', 'Fantasy Quests', 'Overcoming Insecurity', 'Historical Quests'],
  },
  12: {
    age: 12,
    grade: '7th Grade',
    stage: 'Middle School',
    lexileRange: '925L - 1070L',
    maxRecommendedViolence: 'Moderate',
    maxRecommendedLanguage: 'Mild',
    maxRecommendedRomance: 'Mild',
    maxRecommendedThemes: 'Moderate',
    guidelines: 'Ready for more nuanced character motivations, social complexities, minor romantic crushes (innocent), and moderate action/dystopian themes without explicit violence or adult content.',
    commonThemes: ['Moral Dilemmas', 'Dystopian Worlds', 'Courage', 'Social Dynamics', 'First Crushes', 'Science & Survival'],
  },
  13: {
    age: 13,
    grade: '8th Grade',
    stage: 'Late Middle School / Early Teen',
    lexileRange: '970L - 1120L',
    maxRecommendedViolence: 'Moderate',
    maxRecommendedLanguage: 'Mild',
    maxRecommendedRomance: 'Mild',
    maxRecommendedThemes: 'Moderate',
    guidelines: 'Entering young adult territory. Can handle realistic consequences of conflict, deeper emotional stakes, ethical questions, and light swearing if contextual. No graphic sexual violence or gratuitous cruelty.',
    commonThemes: ['Identity & Voice', 'Justice & Equity', 'Sci-Fi Horizons', 'Friendship Trials', 'Emotional Resilience'],
  },
  14: {
    age: 14,
    grade: '9th Grade (High School Freshman)',
    stage: 'Early High School / YA Core',
    lexileRange: '1010L - 1185L',
    maxRecommendedViolence: 'Moderate',
    maxRecommendedLanguage: 'Moderate',
    maxRecommendedRomance: 'Moderate',
    maxRecommendedThemes: 'Moderate',
    guidelines: 'Core Young Adult literature. Can tackle serious societal issues, loss, romance, complex systemic injustice, and mature character development with moderate intensity.',
    commonThemes: ['Individuality', 'Civic Action', 'Grief & Growth', 'Romantic Tension', 'Complex Mysteries', 'Speculative Fiction'],
  },
  15: {
    age: 15,
    grade: '10th Grade (High School Sophomore)',
    stage: 'High School / Upper YA',
    lexileRange: '1050L - 1220L',
    maxRecommendedViolence: 'Moderate',
    maxRecommendedLanguage: 'Moderate',
    maxRecommendedRomance: 'Moderate',
    maxRecommendedThemes: 'Mature',
    guidelines: 'Mature YA themes including mental health, complex relationships, historical hardships, and philosophical questions. Graphic content should still have literary justification rather than shock value.',
    commonThemes: ['Mental Health', 'Existential Choices', 'Cultural Heritage', 'Thriller & Intrigue', 'Coming of Age'],
  },
  16: {
    age: 16,
    grade: '11th Grade (High School Junior)',
    stage: 'Upper High School',
    lexileRange: '1080L - 1300L',
    maxRecommendedViolence: 'Mature',
    maxRecommendedLanguage: 'Moderate',
    maxRecommendedRomance: 'Moderate',
    maxRecommendedThemes: 'Mature',
    guidelines: 'Bridging Upper YA and adult crossover fiction. Sophisticated prose, psychological depth, complex historical/political narratives, and realistic depiction of mature teen experiences.',
    commonThemes: ['Future Ambitions', 'Philosophy & Ethics', 'Complex Relationships', 'Psychological Suspense', 'Historical Trauma & Triumph'],
  },
  17: {
    age: 17,
    grade: '12th Grade (High School Senior)',
    stage: 'Pre-College / Emerging Adult',
    lexileRange: '1100L - 1385L',
    maxRecommendedViolence: 'Mature',
    maxRecommendedLanguage: 'Mature',
    maxRecommendedRomance: 'Mature',
    maxRecommendedThemes: 'Mature',
    guidelines: 'Transitioning to college and adult literature. Deep critical thinking, nuanced worldviews, adult-level literary complexity, and mature life lessons with agency.',
    commonThemes: ['Independence', 'Global Perspectives', 'Deep Worldbuilding', 'Crossover Adult Fiction', 'Legacy & Responsibility'],
  },
};

const MATURITY_RANKS: Record<string, number> = {
  None: 0,
  Clean: 0,
  Mild: 1,
  Moderate: 2,
  Mature: 3,
};

export function isAgeAppropriate(age: number, scores: MaturityScores): {
  isAppropriate: boolean;
  reasons: string[];
} {
  const profile = AGE_PROFILES[age] || AGE_PROFILES[14];
  const reasons: string[] = [];

  const check = (category: string, current: string, maxAllowed: string) => {
    const curVal = MATURITY_RANKS[current] ?? 0;
    const maxVal = MATURITY_RANKS[maxAllowed] ?? 2;
    if (curVal > maxVal) {
      reasons.push(
        `${category} level "${current}" exceeds recommended maximum "${maxAllowed}" for age ${age} (${profile.grade})`
      );
    }
  };

  check('Violence', scores.violence, profile.maxRecommendedViolence);
  check('Language', scores.language, profile.maxRecommendedLanguage);
  check('Romance', scores.romance, profile.maxRecommendedRomance);
  check('Themes', scores.themes, profile.maxRecommendedThemes);

  return {
    isAppropriate: reasons.length === 0,
    reasons,
  };
}

export function getMaturityColor(level: string): string {
  switch (level) {
    case 'None':
    case 'Clean':
      return '#10B981'; // Green
    case 'Mild':
      return '#3B82F6'; // Blue
    case 'Moderate':
      return '#F59E0B'; // Amber
    case 'Mature':
      return '#EF4444'; // Red
    default:
      return '#6B7280'; // Slate
  }
}
