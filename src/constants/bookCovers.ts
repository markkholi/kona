import { ImageSourcePropType } from 'react-native';

export const LOCAL_BOOK_COVERS: Record<string, ImageSourcePropType> = {
  'mock-1': require('../../assets/covers/mock-1.jpg'),
  'mock-2': require('../../assets/covers/mock-2.jpg'),
  'mock-3': require('../../assets/covers/mock-3.jpg'),
  'mock-4': require('../../assets/covers/mock-4.jpg'),
  'mock-5': require('../../assets/covers/mock-5.jpg'),
  'mock-6': require('../../assets/covers/mock-6.jpg'),
  'mock-7': require('../../assets/covers/mock-7.jpg'),
  'mock-8': require('../../assets/covers/mock-8.jpg'),
  'mock-9': require('../../assets/covers/mock-9.jpg'),
  'mock-10': require('../../assets/covers/mock-10.jpg'),
  'mock-11': require('../../assets/covers/mock-11.jpg'),
  'mock-12': require('../../assets/covers/mock-12.jpg'),
  'mock-13': require('../../assets/covers/mock-13.jpg'),
  'mock-14': require('../../assets/covers/mock-14.jpg'),
  'mock-15': require('../../assets/covers/mock-15.jpg'),
  'mock-16': require('../../assets/covers/mock-16.jpg'),
  'mock-17': require('../../assets/covers/mock-17.jpg'),
  'mock-18': require('../../assets/covers/mock-18.jpg'),
  'mock-19': require('../../assets/covers/mock-19.jpg'),
  'mock-20': require('../../assets/covers/mock-20.jpg'),
  'mock-21': require('../../assets/covers/mock-21.jpg'),
  'mock-22': require('../../assets/covers/mock-22.jpg'),
  'mock-23': require('../../assets/covers/mock-23.jpg'),
  'mock-24': require('../../assets/covers/mock-24.jpg'),
  'mock-25': require('../../assets/covers/mock-25.jpg'),
};

export const LOCAL_ISBN_COVERS: Record<string, ImageSourcePropType> = {
  '9780786838653': require('../../assets/covers/mock-1.jpg'),
  '9781442445949': require('../../assets/covers/mock-2.jpg'),
  '9780316381994': require('../../assets/covers/mock-3.jpg'),
  '9780312367541': require('../../assets/covers/mock-4.jpg'),
  '9780062975171': require('../../assets/covers/mock-5.jpg'),
  '9780307931474': require('../../assets/covers/mock-6.jpg'),
  '9781368022828': require('../../assets/covers/mock-7.jpg'),
  '9781338111002': require('../../assets/covers/mock-8.jpg'),
  '9781338157796': require('../../assets/covers/mock-9.jpg'),
  '9781442494879': require('../../assets/covers/mock-10.jpg'),
  '9780544336261': require('../../assets/covers/mock-11.jpg'),
  '9781442472426': require('../../assets/covers/mock-12.jpg'),
  '9781250007209': require('../../assets/covers/mock-13.jpg'),
  '9780142422076': require('../../assets/covers/mock-14.jpg'),
  '9780765397539': require('../../assets/covers/mock-15.jpg'),
  '9780439023481': require('../../assets/covers/mock-16.jpg'),
  '9781627792127': require('../../assets/covers/mock-17.jpg'),
  '9780593135204': require('../../assets/covers/mock-18.jpg'),
  '9781770864863': require('../../assets/covers/mock-19.jpg'),
  '9780812550702': require('../../assets/covers/mock-20.jpg'),
  '9780525657743': require('../../assets/covers/mock-21.jpg'),
  '9781984896391': require('../../assets/covers/mock-22.jpg'),
  '9780062498540': require('../../assets/covers/mock-23.jpg'),
  '9781481450157': require('../../assets/covers/mock-24.jpg'),
  '9780062278227': require('../../assets/covers/mock-25.jpg'),
};

export function getBookCoverSource(book: {
  id?: string;
  isbn?: string;
  coverUrl?: string;
}): ImageSourcePropType | null {
  if (book.id && LOCAL_BOOK_COVERS[book.id]) {
    return LOCAL_BOOK_COVERS[book.id];
  }
  if (book.isbn && LOCAL_ISBN_COVERS[book.isbn]) {
    return LOCAL_ISBN_COVERS[book.isbn];
  }
  if (book.coverUrl && book.coverUrl.trim().length > 0) {
    return { uri: book.coverUrl };
  }
  return null;
}
