import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiSettings, BookRecommendation } from '../types/book';

const STORAGE_KEYS = {
  SETTINGS: '@kona_settings_v1',
  SAVED_BOOKS: '@kona_saved_books_v1',
  SEARCH_HISTORY: '@kona_search_history_v1',
};

const DEFAULT_SETTINGS: ApiSettings = {
  provider: 'mock',
  geminiApiKey: '',
  openaiApiKey: '',
};

export interface RecentSearch {
  id: string;
  age: number;
  interest: string;
  timestamp: number;
}

export async function getApiSettings(): Promise<ApiSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveApiSettings(settings: ApiSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export async function getSavedBooks(): Promise<BookRecommendation[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_BOOKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveBook(book: BookRecommendation): Promise<void> {
  try {
    const current = await getSavedBooks();
    const exists = current.some((b) => b.title.toLowerCase() === book.title.toLowerCase());
    if (!exists) {
      const updated = [book, ...current];
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_BOOKS, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to save book:', err);
  }
}

export async function removeSavedBook(bookIdOrTitle: string): Promise<void> {
  try {
    const current = await getSavedBooks();
    const updated = current.filter(
      (b) => b.id !== bookIdOrTitle && b.title.toLowerCase() !== bookIdOrTitle.toLowerCase()
    );
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_BOOKS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove book:', err);
  }
}

export async function isBookSaved(title: string): Promise<boolean> {
  try {
    const current = await getSavedBooks();
    return current.some((b) => b.title.toLowerCase() === title.toLowerCase());
  } catch {
    return false;
  }
}

export async function getRecentSearches(): Promise<RecentSearch[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addRecentSearch(age: number, interest: string): Promise<void> {
  try {
    const current = await getRecentSearches();
    const filtered = current.filter(
      (s) => !(s.age === age && s.interest.toLowerCase() === interest.toLowerCase())
    );
    const updated = [
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        age,
        interest,
        timestamp: Date.now(),
      },
      ...filtered,
    ].slice(0, 10);
    await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to add recent search:', err);
  }
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  } catch (err) {
    console.error('Failed to clear search history:', err);
  }
}
