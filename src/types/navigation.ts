import { BookRecommendation } from './book';

export type RootStackParamList = {
  Home: undefined;
  Results: {
    age: number;
    interest: string;
  };
  BookDetail: {
    book: BookRecommendation;
    targetAge: number;
  };
  SavedBooks: undefined;
  Settings: undefined;
};
