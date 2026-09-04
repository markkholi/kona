import React, { useState, useEffect, useMemo } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Compass,
  Trash2,
} from 'lucide-react-native';
import { BookCard } from '../components/BookCard';
import { getSavedBooks, removeSavedBook } from '../services/storage';
import { BookRecommendation } from '../types/book';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedBooks'>;

export const SavedBooksScreen: React.FC<Props> = ({ navigation }) => {
  const [savedBooks, setSavedBooks] = useState<BookRecommendation[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  useEffect(() => {
    loadSaved();
    const unsubscribe = navigation.addListener('focus', () => {
      loadSaved();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSaved = async () => {
    const list = await getSavedBooks();
    setSavedBooks(list);
  };

  const handleRemove = async (book: BookRecommendation) => {
    await removeSavedBook(book.id);
    setSavedBooks((prev) => prev.filter((b) => b.id !== book.id && b.title !== book.title));
  };

  const genres = useMemo(() => {
    const set = new Set<string>();
    savedBooks.forEach((b) => {
      if (b.genre) set.add(b.genre);
    });
    return ['All', ...Array.from(set)];
  }, [savedBooks]);

  const displayedBooks = useMemo(() => {
    if (selectedGenre === 'All') return savedBooks;
    return savedBooks.filter((b) => b.genre === selectedGenre);
  }, [savedBooks, selectedGenre]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Saved Reading List</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{savedBooks.length}</Text>
        </View>
      </View>

      {savedBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Bookmark size={40} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Your Reading List is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save any book recommendations you want to look into, check out from the library, or discuss with parents and teachers.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Compass size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.exploreBtnText}>Find Book Recommendations</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {genres.length > 2 && (
            <View style={styles.filterBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {genres.map((g) => {
                  const isSelected = selectedGenre === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
                      onPress={() => setSelectedGenre(g)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected && styles.filterChipTextActive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <FlatList
            data={displayedBooks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <BookCard
                  book={item}
                  targetAge={item.recommendedAgeMin}
                  isSaved={true}
                  onPress={() =>
                    navigation.navigate('BookDetail', {
                      book: item,
                      targetAge: item.recommendedAgeMin,
                    })
                  }
                  onToggleSave={() => handleRemove(item)}
                />
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 32,
  },
  cardContainer: {
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
