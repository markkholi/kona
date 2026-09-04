import { BookRecommendation } from '../types/book';
import { CURATED_BOOKS } from '../data/curatedBooks';

export const CURATED_MOCK_BOOKS: BookRecommendation[] = CURATED_BOOKS;

export function getMockRecommendations(age: number, interest: string): BookRecommendation[] {
  const normalizedInterest = interest.toLowerCase();
  const keywords = normalizedInterest
    .split(/\s+/)
    .filter((k) => k.length > 2 && !['book', 'books', 'about', 'with', 'like', 'for', 'the', 'and'].includes(k));

  // Score books based on age closeness and keyword hits
  const scored = CURATED_MOCK_BOOKS.map((book) => {
    let score = 0;

    // Age suitability score: heavily favor books that enclose or fit the requested age
    if (age >= book.recommendedAgeMin && age <= book.recommendedAgeMax) {
      score += 50;
    } else {
      const dist = Math.min(
        Math.abs(age - book.recommendedAgeMin),
        Math.abs(age - book.recommendedAgeMax)
      );
      score += Math.max(0, 30 - dist * 10);
    }

    // Keyword relevance across title, genre, interest connection, and description
    const textCorpus = `${book.title} ${book.genre || ''} ${book.interestConnection} ${book.description || ''}`.toLowerCase();
    for (const kw of keywords) {
      if (textCorpus.includes(kw)) {
        score += 20;
      }
    }

    return { book, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return at least 20 items
  const results: BookRecommendation[] = [];
  const selected = scored.slice(0, 20);

  selected.forEach(({ book }, idx) => {
    results.push({
      ...book,
      id: `rec-${idx + 1}-${book.id}`,
    });
  });

  // If there are less than 20 due to pool size, pad up to exactly 20
  while (results.length < 20 && CURATED_MOCK_BOOKS.length > 0) {
    const fallbackBook = CURATED_MOCK_BOOKS[results.length % CURATED_MOCK_BOOKS.length];
    results.push({
      ...fallbackBook,
      id: `rec-${results.length + 1}-${fallbackBook.id}`,
    });
  }

  return results.slice(0, 20);
}
