import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { MAX_NAME_LENGTH, MAX_PROFILES, ReaderProfile } from '../types/profile';
import {
  createProfileId,
  deleteProfileData,
  getActiveProfileId,
  migrateToProfiles,
  saveProfiles,
  setActiveProfileId,
} from '../services/storage';

interface ProfileContextValue {
  ready: boolean;
  profiles: ReaderProfile[];
  activeProfile: ReaderProfile | null;
  switchProfile: (id: string) => Promise<void>;
  addProfile: (name: string, age: number, avatarIndex?: number) => Promise<ReaderProfile | null>;
  updateProfile: (id: string, patch: Partial<ReaderProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function clampAge(age: number): number {
  return Math.min(17, Math.max(10, Math.round(age)));
}

function sanitizeName(name: string): string {
  return name.trim().slice(0, MAX_NAME_LENGTH);
}

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<ReaderProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await migrateToProfiles();
      if (cancelled) return;
      setProfiles(result.profiles);
      setActiveId(result.activeId);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: ReaderProfile[]) => {
    setProfiles(next);
    await saveProfiles(next);
  }, []);

  const switchProfile = useCallback(async (id: string) => {
    const exists = profiles.some((p) => p.id === id);
    if (!exists) return;
    setActiveId(id);
    await setActiveProfileId(id);
  }, [profiles]);

  const addProfile = useCallback(
    async (name: string, age: number, avatarIndex?: number): Promise<ReaderProfile | null> => {
      if (profiles.length >= MAX_PROFILES) {
        Alert.alert('Profile Limit', 'You can have up to 6 reader profiles.');
        return null;
      }
      const cleaned = sanitizeName(name);
      if (!cleaned) {
        Alert.alert('Name Required', 'Please enter a name for this reader.');
        return null;
      }
      const profile: ReaderProfile = {
        id: createProfileId(),
        name: cleaned,
        age: clampAge(age),
        avatarIndex: avatarIndex ?? profiles.length % 8,
        createdAt: Date.now(),
      };
      const next = [...profiles, profile];
      await persist(next);
      setActiveId(profile.id);
      await setActiveProfileId(profile.id);
      return profile;
    },
    [persist, profiles]
  );

  const updateProfile = useCallback(
    async (id: string, patch: Partial<ReaderProfile>) => {
      const next = profiles.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...patch, id: p.id };
        if (patch.name !== undefined) merged.name = sanitizeName(patch.name) || p.name;
        if (patch.age !== undefined) merged.age = clampAge(patch.age);
        return merged;
      });
      await persist(next);
    },
    [persist, profiles]
  );

  const deleteProfile = useCallback(
    async (id: string): Promise<boolean> => {
      if (profiles.length <= 1) {
        Alert.alert('Cannot Delete', 'You need at least one reader profile.');
        return false;
      }
      const remaining = profiles.filter((p) => p.id !== id);
      await deleteProfileData(id);
      await persist(remaining);
      const currentActive = activeId ?? (await getActiveProfileId());
      if (currentActive === id) {
        const nextActive = remaining[0].id;
        setActiveId(nextActive);
        await setActiveProfileId(nextActive);
      }
      return true;
    },
    [activeId, persist, profiles]
  );

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeId) ?? profiles[0] ?? null,
    [profiles, activeId]
  );

  const value = useMemo(
    () => ({
      ready,
      profiles,
      activeProfile,
      switchProfile,
      addProfile,
      updateProfile,
      deleteProfile,
    }),
    [ready, profiles, activeProfile, switchProfile, addProfile, updateProfile, deleteProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export function useProfiles(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return ctx;
}
