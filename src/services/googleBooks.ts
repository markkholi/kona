export interface GoogleBookMetadata {
  coverUrl?: string;
  isbn?: string;
  pageCount?: number;
  previewLink?: string;
  description?: string;
  publishedYear?: number;
}

export async function fetchGoogleBookMetadata(
  title: string,
  author: string
): Promise<GoogleBookMetadata | null> {
  try {
    const query = encodeURIComponent(`intitle:${title}+inauthor:${author}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1&printType=books`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      // Fallback search by title only if title + author yielded no items
      const fallbackQuery = encodeURIComponent(title);
      const fallbackResp = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${fallbackQuery}&maxResults=1&printType=books`
      );
      if (!fallbackResp.ok) return null;
      const fallbackData = await fallbackResp.json();
      if (!fallbackData.items || fallbackData.items.length === 0) return null;
      return parseVolumeInfo(fallbackData.items[0]?.volumeInfo);
    }

    return parseVolumeInfo(data.items[0]?.volumeInfo);
  } catch (err) {
    // Network or parse issue; gracefully return null
    return null;
  }
}

function parseVolumeInfo(info: any): GoogleBookMetadata | null {
  if (!info) return null;

  // Look for ISBN_13 or ISBN_10
  let isbn: string | undefined;
  if (Array.isArray(info.industryIdentifiers)) {
    const isbn13 = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
    const isbn10 = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
    isbn = isbn13?.identifier || isbn10?.identifier;
  }

  let coverUrl =
    info.imageLinks?.extraLarge ||
    info.imageLinks?.large ||
    info.imageLinks?.medium ||
    info.imageLinks?.small ||
    info.imageLinks?.thumbnail ||
    info.imageLinks?.smallThumbnail;

  if (coverUrl && coverUrl.startsWith('http://')) {
    coverUrl = coverUrl.replace('http://', 'https://');
  }

  // If Google Books has no cover, fallback to Open Library using ISBN
  if (!coverUrl && isbn) {
    coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
  }

  let publishedYear: number | undefined;
  if (info.publishedDate) {
    const yearMatch = info.publishedDate.match(/^(\d{4})/);
    if (yearMatch) {
      publishedYear = parseInt(yearMatch[1], 10);
    }
  }

  return {
    coverUrl,
    isbn,
    pageCount: info.pageCount,
    previewLink: info.previewLink || info.infoLink,
    description: info.description,
    publishedYear,
  };
}
