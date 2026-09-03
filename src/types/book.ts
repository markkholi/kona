export type MaturityLevel = 'None' | 'Clean' | 'Mild' | 'Moderate' | 'Mature';

export interface MaturityScores {
  violence: MaturityLevel;
  language: MaturityLevel;
  romance: MaturityLevel;
  themes: MaturityLevel;
}

export interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  publishedYear: number;
  recommendedAgeMin: number;
  recommendedAgeMax: number;
  whyAppropriate: string;
  interestConnection: string;
  maturityScores: MaturityScores;
  contentWarnings: string[];
  readingLevel: string;
  coverUrl?: string;
  description?: string;
  pageCount?: number;
  isbn?: string;
  previewLink?: string;
  genre?: string;
  isSaved?: boolean;
}

export interface AgeProfile {
  age: number;
  grade: string;
  stage: string;
  lexileRange: string;
  maxRecommendedViolence: MaturityLevel;
  maxRecommendedLanguage: MaturityLevel;
  maxRecommendedRomance: MaturityLevel;
  maxRecommendedThemes: MaturityLevel;
  guidelines: string;
  commonThemes: string[];
}

export interface RecommendationRequest {
  age: number;
  interest: string;
  count?: number; // defaults to 20
}

export interface ApiSettings {
  provider: 'gemini' | 'openai' | 'mock';
  geminiApiKey: string;
  openaiApiKey: string;
  modelOverride?: string;
}
