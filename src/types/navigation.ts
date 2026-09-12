import { NavigatorScreenParams } from '@react-navigation/native';
import { BookRecommendation } from './book';

export type BookDetailParams = {
  book: BookRecommendation;
  targetAge: number;
};

export type DiscoverStackParamList = {
  Home: undefined;
  Results: {
    age: number;
    interest: string;
  };
  BookDetail: BookDetailParams;
};

export type SavedStackParamList = {
  SavedBooks: undefined;
  BookDetail: BookDetailParams;
};

export type SettingsStackParamList = {
  Settings: undefined;
};

export type TabParamList = {
  DiscoverTab: NavigatorScreenParams<DiscoverStackParamList> | undefined;
  SavedTab: NavigatorScreenParams<SavedStackParamList> | undefined;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList> | undefined;
};

/** @deprecated Prefer nested stack param lists. Kept for shared BookDetail params. */
export type RootStackParamList = DiscoverStackParamList & SavedStackParamList & SettingsStackParamList;
