import { Share, Alert } from 'react-native';
import { BookRecommendation } from '../types/book';

function formatBook(book: BookRecommendation, index: number): string {
  const parts = [
    `${index + 1}. "${book.title}" by ${book.author} (${book.publishedYear})`,
  ];

  const meta: string[] = [];
  if (book.recommendedAgeMin && book.recommendedAgeMax) {
    meta.push(`Ages ${book.recommendedAgeMin}–${book.recommendedAgeMax}`);
  }
  if (book.genre) meta.push(book.genre);
  if (book.pageCount) meta.push(`${book.pageCount} pages`);
  if (meta.length > 0) parts.push(`   ${meta.join(' · ')}`);

  const why = book.interestConnection || book.whyAppropriate;
  if (why) {
    const clipped = why.length > 140 ? `${why.slice(0, 137)}...` : why;
    parts.push(`   Why: ${clipped}`);
  }

  return parts.join('\n');
}

export function buildSharePayload(
  books: BookRecommendation[],
  age?: number,
  interest?: string,
  profileName?: string
): string {
  const header = profileName
    ? `📚 Kona Book Recommendations for ${profileName}${age ? `, Age ${age}` : ''}`
    : `📚 Kona Book Recommendations${age ? ` for Age ${age}` : ''}`;

  const lines: string[] = [header];

  if (interest) {
    lines.push(`Interest: "${interest}"`);
  }
  lines.push('');

  books.forEach((book, i) => {
    lines.push(formatBook(book, i));
  });

  lines.push('');
  lines.push(`——`);
  lines.push(`${books.length} books curated by Kona · kona.app`);

  return lines.join('\n');
}

export async function shareBookList(
  books: BookRecommendation[],
  age?: number,
  interest?: string,
  profileName?: string
): Promise<void> {
  if (books.length === 0) {
    Alert.alert('Nothing to Share', 'Save some books first, then share your list!');
    return;
  }

  const message = buildSharePayload(books, age, interest, profileName);
  try {
    await Share.share({
      title: 'Kona Book Recommendations',
      message,
    });
  } catch (err) {
    console.error('Share failed:', err);
  }
}

export async function shareSingleBook(
  book: BookRecommendation,
  targetAge: number,
  profileName?: string
): Promise<void> {
  const who = profileName ? `for ${profileName}, Age ${targetAge}` : `for Age ${targetAge}`;
  const message = [
    `📖 Book Recommendation ${who}:`,
    `"${book.title}" by ${book.author}`,
    '',
    book.whyAppropriate,
    '',
    'Recommended by Kona',
  ].join('\n');

  try {
    await Share.share({
      title: `${book.title} by ${book.author}`,
      message,
    });
  } catch (err) {
    console.error('Share failed:', err);
  }
}
