/**
 * On-device reader profile for sibling/multi-child support.
 * All data stays in AsyncStorage — never sent to external APIs.
 */
export interface ReaderProfile {
  id: string;
  name: string;
  age: number;
  avatarIndex: number;
  createdAt: number;
}

export const MAX_PROFILES = 6;
export const MAX_NAME_LENGTH = 20;
