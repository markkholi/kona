import { AGE_PROFILES, isAgeAppropriate } from '../constants/ageRubric';
import { ApiSettings, BookRecommendation } from '../types/book';
import { fetchGoogleBookMetadata } from './googleBooks';
import { getMockRecommendations } from './mockBooks';

const RECOMMENDATION_COUNT = 20;

export async function fetchBookRecommendations(
  age: number,
  interest: string,
  settings: ApiSettings
): Promise<{ books: BookRecommendation[]; source: 'gemini' | 'openai' | 'mock'; error?: string }> {
  const profile = AGE_PROFILES[age] || AGE_PROFILES[14];

  // If user selected mock provider or no API keys are set, use curated mock provider
  if (
    settings.provider === 'mock' ||
    (settings.provider === 'gemini' && !settings.geminiApiKey?.trim()) ||
    (settings.provider === 'openai' && !settings.openaiApiKey?.trim())
  ) {
    const mockBooks = getMockRecommendations(age, interest);
    // Enrich with Google Books metadata (covers, page counts, ISBNs) asynchronously
    const enriched = await enrichBooksWithGoogleMetadata(mockBooks);
    return { books: enriched, source: 'mock' };
  }

  try {
    let rawJson = '';

    if (settings.provider === 'gemini') {
      rawJson = await callGeminiApi(age, interest, settings.geminiApiKey.trim(), profile);
    } else {
      rawJson = await callOpenAiApi(age, interest, settings.openaiApiKey.trim(), profile);
    }

    const parsedBooks = parseAndValidateLlmOutput(rawJson, age);
    if (parsedBooks.length > 0) {
      // Enrich up to 20 books with Google Books API for high quality covers and metadata
      const enriched = await enrichBooksWithGoogleMetadata(parsedBooks);
      return { books: enriched, source: settings.provider };
    } else {
      throw new Error('LLM did not return valid book items');
    }
  } catch (err: any) {
    console.warn('AI Recommendation API error, falling back to curated library:', err?.message || err);
    const mockFallback = getMockRecommendations(age, interest);
    const enriched = await enrichBooksWithGoogleMetadata(mockFallback);
    return {
      books: enriched,
      source: 'mock',
      error: err?.message || 'Failed to connect to AI provider. Showing curated library recommendations.',
    };
  }
}

function buildSystemPrompt(age: number, interest: string, profile: any): string {
  return `You are a certified youth literature specialist and school librarian.
Recommend exactly ${RECOMMENDATION_COUNT} published books tailored for a student aged ${age} (${profile.grade}, ${profile.stage}) who is interested in: "${interest}".

CRITICAL AGE-APPROPRIATENESS AUDIT RULES FOR AGE ${age}:
- Grade Level: ${profile.grade}
- Lexile Range Target: ${profile.lexileRange}
- Maximum Allowed Violence: ${profile.maxRecommendedViolence}
- Maximum Allowed Language: ${profile.maxRecommendedLanguage}
- Maximum Allowed Romance: ${profile.maxRecommendedRomance}
- Maximum Allowed Dark Themes: ${profile.maxRecommendedThemes}
- Pedagogical guidelines: ${profile.guidelines}

EVERY SINGLE BOOK MUST BE STRICTLY AGE-APPROPRIATE FOR AGE ${age}. Do NOT recommend books with mature adult content, graphic violence, or explicit sexuality.

Return ONLY a valid, raw JSON array containing exactly ${RECOMMENDATION_COUNT} book objects. No markdown formatting, no code fences, no commentary.
Each object must follow this schema:
[
  {
    "title": "Title of Book",
    "author": "Author Name",
    "publishedYear": 2020,
    "recommendedAgeMin": 11,
    "recommendedAgeMax": 14,
    "whyAppropriate": "2-3 sentences explaining pedagogical and emotional suitability for an age ${age} reader.",
    "interestConnection": "1-2 sentences on how this book specifically connects to '${interest}'.",
    "maturityScores": {
      "violence": "None" | "Mild" | "Moderate" | "Mature",
      "language": "Clean" | "Mild" | "Moderate" | "Mature",
      "romance": "None" | "Mild" | "Moderate" | "Mature",
      "themes": "None" | "Mild" | "Moderate" | "Mature"
    },
    "contentWarnings": ["list any sensitive themes, e.g. loss of parent, mild peril, or empty array"],
    "readingLevel": "${profile.grade} / Lexile approx",
    "genre": "Genre of the book",
    "description": "Brief engaging synopsis of the book (2 sentences)."
  }
]`;
}

async function callGeminiApi(age: number, interest: string, apiKey: string, profile: any): Promise<string> {
  const prompt = buildSystemPrompt(age, interest, profile);
  // Default to Gemini 2.5 Flash / Gemini 2.0 Flash / Gemini 1.5 Flash
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText.substring(0, 120)}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }
  return text;
}

async function callOpenAiApi(age: number, interest: string, apiKey: string, profile: any): Promise<string> {
  const prompt = buildSystemPrompt(age, interest, profile);
  const url = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a school librarian who outputs strict JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText.substring(0, 120)}`);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from OpenAI API');
  }
  return content;
}

function parseAndValidateLlmOutput(rawText: string, targetAge: number): BookRecommendation[] {
  let cleaned = rawText.trim();
  // Remove markdown fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // If wrapped in an object like { "books": [...] }
    const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('Could not parse JSON array from model output');
    }
  }

  const rawArray = Array.isArray(parsed) ? parsed : parsed.books || parsed.recommendations || [];
  if (!Array.isArray(rawArray) || rawArray.length === 0) {
    return [];
  }

  return rawArray.slice(0, RECOMMENDATION_COUNT).map((item: any, index: number) => {
    const maturityScores = {
      violence: item.maturityScores?.violence || 'Mild',
      language: item.maturityScores?.language || 'Clean',
      romance: item.maturityScores?.romance || 'None',
      themes: item.maturityScores?.themes || 'Mild',
    };

    // Audit age appropriateness
    const audit = isAgeAppropriate(targetAge, maturityScores);

    return {
      id: `book-${index + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: item.title || 'Unknown Title',
      author: item.author || 'Unknown Author',
      publishedYear: Number(item.publishedYear) || new Date().getFullYear(),
      recommendedAgeMin: Number(item.recommendedAgeMin) || Math.max(10, targetAge - 1),
      recommendedAgeMax: Number(item.recommendedAgeMax) || Math.min(17, targetAge + 2),
      whyAppropriate:
        item.whyAppropriate ||
        `Age-appropriate literary selection vetted for age ${targetAge} readers.`,
      interestConnection:
        item.interestConnection ||
        'Directly aligns with your requested themes and interests.',
      maturityScores,
      contentWarnings: Array.isArray(item.contentWarnings)
        ? item.contentWarnings
        : audit.isAppropriate
        ? []
        : audit.reasons,
      readingLevel: item.readingLevel || `Age ${targetAge} standard reading level`,
      genre: item.genre || 'Youth Literature',
      description: item.description || '',
    };
  });
}

async function enrichBooksWithGoogleMetadata(
  books: BookRecommendation[]
): Promise<BookRecommendation[]> {
  const enrichPromises = books.map(async (book) => {
    // If verified cover already present, skip query
    if (book.coverUrl && book.isbn) {
      return book;
    }
    const meta = await fetchGoogleBookMetadata(book.title, book.author);
    if (!meta) {
      if (book.isbn && !book.coverUrl) {
        return {
          ...book,
          coverUrl: `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`,
        };
      }
      return book;
    }

    const resolvedIsbn = meta.isbn || book.isbn;
    const resolvedCover =
      meta.coverUrl ||
      (resolvedIsbn ? `https://covers.openlibrary.org/b/isbn/${resolvedIsbn}-M.jpg` : book.coverUrl);

    return {
      ...book,
      coverUrl: resolvedCover,
      isbn: resolvedIsbn,
      pageCount: meta.pageCount || book.pageCount,
      previewLink: meta.previewLink || book.previewLink,
      description: book.description || meta.description,
      publishedYear: book.publishedYear || meta.publishedYear || 2020,
    };
  });

  const results = await Promise.allSettled(enrichPromises);
  return results.map((res, i) => (res.status === 'fulfilled' ? res.value : books[i]));
}
