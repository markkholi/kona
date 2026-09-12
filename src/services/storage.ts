import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiSettings, BookRecommendation } from '../types/book';
import { ReaderProfile } from '../types/profile';

export const STORAGE_KEYS = {
  SETTINGS: '@kona_settings_v1',
  SAVED_BOOKS: '@kona_saved_books_v1',
  SEARCH_HISTORY: '@kona_search_history_v1',
  PROFILES: '@kona_profiles_v1',
  ACTIVE_PROFILE: '@kona_active_profile_v1',
  MIGRATED: '@kona_migrated_v1',
} as const;

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

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

export function subscribeStorage(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitStorageChange() {
  listeners.forEach((listener) => listener());
}

/**
 * Resolve a legacy unscoped key to a profile-scoped key.
 * `@kona_saved_books_v1` + profileId → `@kona_saved_books_{id}_v1`
 */
export function getProfileStorageKey(profileId: string, baseKey: string): string {
  if (baseKey.endsWith('_v1')) {
    return `${baseKey.slice(0, -3)}_${profileId}_v1`;
  }
  return `${baseKey}_${profileId}`;
}

export function createProfileId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
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

export async function getSavedBooks(profileId: string): Promise<BookRecommendation[]> {
  try {
    const raw = await AsyncStorage.getItem(
      getProfileStorageKey(profileId, STORAGE_KEYS.SAVED_BOOKS)
    );
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveBook(book: BookRecommendation, profileId: string): Promise<void> {
  try {
    const current = await getSavedBooks(profileId);
    const exists = current.some((b) => b.title.toLowerCase() === book.title.toLowerCase());
    if (!exists) {
      const updated = [book, ...current];
      await AsyncStorage.setItem(
        getProfileStorageKey(profileId, STORAGE_KEYS.SAVED_BOOKS),
        JSON.stringify(updated)
      );
      emitStorageChange();
    }
  } catch (err) {
    console.error('Failed to save book:', err);
  }
}

export async function removeSavedBook(bookIdOrTitle: string, profileId: string): Promise<void> {
  try {
    const current = await getSavedBooks(profileId);
    const updated = current.filter(
      (b) => b.id !== bookIdOrTitle && b.title.toLowerCase() !== bookIdOrTitle.toLowerCase()
    );
    await AsyncStorage.setItem(
      getProfileStorageKey(profileId, STORAGE_KEYS.SAVED_BOOKS),
      JSON.stringify(updated)
    );
    emitStorageChange();
  } catch (err) {
    console.error('Failed to remove book:', err);
  }
}

export async function isBookSaved(title: string, profileId: string): Promise<boolean> {
  try {
    const current = await getSavedBooks(profileId);
    return current.some((b) => b.title.toLowerCase() === title.toLowerCase());
  } catch {
    return false;
  }
}

export async function getRecentSearches(profileId: string): Promise<RecentSearch[]> {
  try {
    const raw = await AsyncStorage.getItem(
      getProfileStorageKey(profileId, STORAGE_KEYS.SEARCH_HISTORY)
    );
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addRecentSearch(
  age: number,
  interest: string,
  profileId: string
): Promise<void> {
  try {
    const current = await getRecentSearches(profileId);
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
    await AsyncStorage.setItem(
      getProfileStorageKey(profileId, STORAGE_KEYS.SEARCH_HISTORY),
      JSON.stringify(updated)
    );
    emitStorageChange();
  } catch (err) {
    console.error('Failed to add recent search:', err);
  }
}

export async function clearRecentSearches(profileId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(getProfileStorageKey(profileId, STORAGE_KEYS.SEARCH_HISTORY));
    emitStorageChange();
  } catch (err) {
    console.error('Failed to clear search history:', err);
  }
}

export async function clearAllRecentSearches(profileIds: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(
      profileIds.map((id) => getProfileStorageKey(id, STORAGE_KEYS.SEARCH_HISTORY))
    );
    emitStorageChange();
  } catch (err) {
    console.error('Failed to clear all search history:', err);
  }
}

export async function deleteProfileData(profileId: string): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      getProfileStorageKey(profileId, STORAGE_KEYS.SAVED_BOOKS),
      getProfileStorageKey(profileId, STORAGE_KEYS.SEARCH_HISTORY),
    ]);
    emitStorageChange();
  } catch (err) {
    console.error('Failed to delete profile data:', err);
  }
}

export async function getProfiles(): Promise<ReaderProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveProfiles(profiles: ReaderProfile[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
}

export async function getActiveProfileId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE);
  } catch {
    return null;
  }
}

export async function setActiveProfileId(profileId: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, profileId);
}

/**
 * On first launch after the profiles feature, create a default reader and
 * copy unscoped saved books / search history under that profile. Zero data loss.
 */
export async function migrateToProfiles(): Promise<{
  profiles: ReaderProfile[];
  activeId: string;
}> {
  const existingProfiles = await getProfiles();
  if (existingProfiles.length > 0) {
    let activeId = await getActiveProfileId();
    if (!activeId || !existingProfiles.some((p) => p.id === activeId)) {
      activeId = existingProfiles[0].id;
      await setActiveProfileId(activeId);
    }
    const migrated = await AsyncStorage.getItem(STORAGE_KEYS.MIGRATED);
    if (!migrated) {
      await AsyncStorage.setItem(STORAGE_KEYS.MIGRATED, '1');
    }
    return { profiles: existingProfiles, activeId };
  }

  const defaultProfile: ReaderProfile = {
    id: createProfileId(),
    name: 'Reader',
    age: 12,
    avatarIndex: 0,
    createdAt: Date.now(),
  };

  const [legacySaved, legacyHistory] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.SAVED_BOOKS),
    AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY),
  ]);

  if (legacySaved) {
    await AsyncStorage.setItem(
      getProfileStorageKey(defaultProfile.id, STORAGE_KEYS.SAVED_BOOKS),
      legacySaved
    );
  }
  if (legacyHistory) {
    await AsyncStorage.setItem(
      getProfileStorageKey(defaultProfile.id, STORAGE_KEYS.SEARCH_HISTORY),
      legacyHistory
    );
  }

  await saveProfiles([defaultProfile]);
  await setActiveProfileId(defaultProfile.id);
  await AsyncStorage.setItem(STORAGE_KEYS.MIGRATED, '1');

  return { profiles: [defaultProfile], activeId: defaultProfile.id };
}
