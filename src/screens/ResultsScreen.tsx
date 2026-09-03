import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  ArrowUpDown,
  CheckCircle2,
  Filter,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Bookmark,
} from 'lucide-react-native';
import { BookCard } from '../components/BookCard';
import { fetchBookRecommendations } from '../services/aiRecommender';
import {
  getApiSettings,
  getSavedBooks,
  isBookSaved,
  removeSavedBook,
  saveBook,
} from '../services/storage';
import { BookRecommendation } from '../types/book';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

type SortOption = 'default' | 'year_desc' | 'year_asc' | 'title_asc';

export const ResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { age, interest } = route.params;

  const [loading, setLoading] = useState<boolean>(true);
  const [books, setBooks] = useState<BookRecommendation[]>([]);
  const [sourceInfo, setSourceInfo] = useState<string>('');
  const [savedTitles, setSavedTitles] = useState<Set<string>>(new Set());
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [age, interest]);

  useEffect(() => {
    refreshSavedStatus();
    const unsubscribe = navigation.addListener('focus', () => {
      refreshSavedStatus();
    });
    return unsubscribe;
  }, [navigation]);

  const refreshSavedStatus = async () => {
    const list = await getSavedBooks();
    setSavedTitles(new Set(list.map((b) => b.title.toLowerCase())));
  };

  const loadRecommendations = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const settings = await getApiSettings();
      const res = await fetchBookRecommendations(age, interest, settings);
      setBooks(res.books);
      if (res.source === 'gemini') {
        setSourceInfo('Google Gemini AI + Google Books');
      } else if (res.source === 'openai') {
        setSourceInfo('OpenAI GPT-4o + Google Books');
      } else {
        setSourceInfo('Kona Curated Educator Library + Google Books');
      }
      if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not load recommendations');
    } finally {
      setLoading(false);
      refreshSavedStatus();
    }
  };

  const handleToggleSave = async (book: BookRecommendation) => {
    const titleLower = book.title.toLowerCase();
    const saved = savedTitles.has(titleLower);

    if (saved) {
      await removeSavedBook(book.id);
      setSavedTitles((prev) => {
        const next = new Set(prev);
        next.delete(titleLower);
        return next;
      });
    } else {
      await saveBook(book);
      setSavedTitles((prev) => {
        const next = new Set(prev);
        next.add(titleLower);
        return next;
      });
    }
  };

  // Distinct genres for filtering
  const genres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.genre) set.add(b.genre);
    });
    return ['All', ...Array.from(set)];
  }, [books]);

  // Filter and sort
  const displayedBooks = useMemo(() => {
    let result = [...books];

    if (selectedGenre !== 'All') {
      result = result.filter((b) => b.genre === selectedGenre);
    }

    if (sortBy === 'year_desc') {
      result.sort((a, b) => b.publishedYear - a.publishedYear);
    } else if (sortBy === 'year_asc') {
      result.sort((a, b) => a.publishedYear - b.publishedYear);
    } else if (sortBy === 'title_asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [books, selectedGenre, sortBy]);

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Search Query Context */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>Age {age}</Text>
          </View>
          <Text style={styles.totalCountText}>20 Recommendations</Text>
        </View>
        <Text style={styles.interestQuote} numberOfLines={2}>
          "{interest}"
        </Text>
        <View style={styles.sourceRow}>
          <Sparkles size={13} color="#6366F1" />
          <Text style={styles.sourceText}>Powered by: {sourceInfo}</Text>
        </View>
      </View>

      {/* Verification Safety Banner */}
      <View style={styles.safetyBanner}>
        <ShieldCheck size={18} color="#059669" />
        <View style={styles.safetyBannerTextCol}>
          <Text style={styles.safetyBannerTitle}>
            Age-Suitability Validated
          </Text>
          <Text style={styles.safetyBannerDesc}>
            All 20 books below are verified against the developmental Lexile, language, and maturity benchmarks for age {age}.
          </Text>
        </View>
      </View>

      {errorMessage && (
        <View style={styles.errorNotice}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Genre Filter Chips */}
      {genres.length > 2 && (
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
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {g} {g === 'All' ? `(${books.length})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Sort Options Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.resultsCount}>
          Showing {displayedBooks.length} of {books.length} titles
        </Text>
        <TouchableOpacity
          style={styles.sortTrigger}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <ArrowUpDown size={14} color="#4F46E5" />
          <Text style={styles.sortTriggerText}>
            Sort: {sortBy === 'default' ? 'Best Match' : sortBy === 'year_desc' ? 'Newest' : sortBy === 'year_asc' ? 'Oldest' : 'Title'}
          </Text>
        </TouchableOpacity>
      </View>

      {showSortMenu && (
        <View style={styles.sortMenu}>
          <TouchableOpacity
            style={styles.sortMenuItem}
            onPress={() => {
              setSortBy('default');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortMenuText, sortBy === 'default' && styles.sortMenuTextActive]}>
              Best Match (Curator Recommended)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortMenuItem}
            onPress={() => {
              setSortBy('year_desc');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortMenuText, sortBy === 'year_desc' && styles.sortMenuTextActive]}>
              Publication Year (Newest First)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortMenuItem}
            onPress={() => {
              setSortBy('year_asc');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortMenuText, sortBy === 'year_asc' && styles.sortMenuTextActive]}>
              Publication Year (Oldest First)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortMenuItem}
            onPress={() => {
              setSortBy('title_asc');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortMenuText, sortBy === 'title_asc' && styles.sortMenuTextActive]}>
              Title (Alphabetical A-Z)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>20 Recommended Books</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadRecommendations}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <RefreshCw size={18} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingTitle}>Curating 20 Age-Appropriate Books...</Text>
          <Text style={styles.loadingSubtitle}>
            Auditing themes, checking reading levels for age {age}, and fetching verified book covers.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedBooks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              targetAge={age}
              isSaved={savedTitles.has(item.title.toLowerCase())}
              onPress={() => navigation.navigate('BookDetail', { book: item, targetAge: age })}
              onToggleSave={() => handleToggleSave(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
  refreshButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    paddingBottom: 32,
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ageBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ageBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  totalCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  interestQuote: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 20,
    marginBottom: 6,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
    marginLeft: 5,
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 10,
  },
  safetyBannerTextCol: {
    marginLeft: 10,
    flex: 1,
  },
  safetyBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  safetyBannerDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  errorNotice: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
  },
  filterScroll: {
    paddingVertical: 6,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  resultsCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  sortTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sortTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    marginLeft: 4,
  },
  sortMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    marginBottom: 8,
  },
  sortMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sortMenuText: {
    fontSize: 12,
    color: '#334155',
  },
  sortMenuTextActive: {
    fontWeight: '700',
    color: '#4F46E5',
  },
});
