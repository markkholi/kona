import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { ArrowLeft, ArrowUpDown, RefreshCw, Share2 } from 'lucide-react-native';
import { BookCard } from '../components/BookCard';
import { fetchBookRecommendations } from '../services/aiRecommender';
import {
  getApiSettings,
  getSavedBooks,
  removeSavedBook,
  saveBook,
} from '../services/storage';
import { shareBookList } from '../services/share';
import { BookRecommendation } from '../types/book';
import { DiscoverStackParamList } from '../types/navigation';
import { useProfiles } from '../context/ProfileContext';
import { colors, HIT_TARGET, radii, spacing } from '../theme/tokens';
import { useReduceMotion, useScaledFont } from '../theme/useScaledFont';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'Results'>;

type SortOption = 'default' | 'year_desc' | 'year_asc' | 'title_asc';

const SORT_LABELS: Record<SortOption, string> = {
  default: 'Best Match',
  year_desc: 'Newest',
  year_asc: 'Oldest',
  title_asc: 'Title A–Z',
};

export const ResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { age, interest } = route.params;
  const { activeProfile } = useProfiles();
  const font = useScaledFont();
  const reduceMotion = useReduceMotion();

  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<BookRecommendation[]>([]);
  const [sourceInfo, setSourceInfo] = useState('');
  const [savedTitles, setSavedTitles] = useState<Set<string>>(new Set());
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sortSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%'], []);

  const readerName = activeProfile?.name ?? 'Reader';

  useEffect(() => {
    loadRecommendations();
  }, [age, interest]);

  useEffect(() => {
    refreshSavedStatus();
    const unsubscribe = navigation.addListener('focus', () => {
      refreshSavedStatus();
    });
    return unsubscribe;
  }, [navigation, activeProfile?.id]);

  const refreshSavedStatus = async () => {
    if (!activeProfile) return;
    const list = await getSavedBooks(activeProfile.id);
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
    if (!activeProfile) return;
    const titleLower = book.title.toLowerCase();
    const saved = savedTitles.has(titleLower);

    if (saved) {
      await removeSavedBook(book.id, activeProfile.id);
      setSavedTitles((prev) => {
        const next = new Set(prev);
        next.delete(titleLower);
        return next;
      });
    } else {
      await saveBook(book, activeProfile.id);
      setSavedTitles((prev) => {
        const next = new Set(prev);
        next.add(titleLower);
        return next;
      });
    }
  };

  const genres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.genre) set.add(b.genre);
    });
    return ['All', ...Array.from(set)];
  }, [books]);

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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const handleShare = () => {
    shareBookList(displayedBooks, age, interest, readerName);
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <View style={styles.contextStrip}>
        <Text
          style={[styles.contextText, { fontSize: font.caption }]}
          numberOfLines={2}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          {readerName}, Age {age} · {interest} · {books.length} books
        </Text>
        <TouchableOpacity
          onPress={loadRecommendations}
          accessibilityRole="button"
          accessibilityLabel="Refresh recommendations"
          style={styles.iconHit}
        >
          <RefreshCw size={18} color={colors.cocoa} />
        </TouchableOpacity>
      </View>

      {errorMessage && (
        <View style={styles.errorNotice}>
          <Text
            style={[styles.errorText, { fontSize: font.caption }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            {errorMessage}
          </Text>
        </View>
      )}

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
                accessibilityRole="button"
                accessibilityLabel={`Filter ${g}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { fontSize: font.caption },
                    isSelected && styles.filterChipTextActive,
                  ]}
                  maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                >
                  {g} {g === 'All' ? `(${books.length})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.sortBar}>
        <Text
          style={[styles.resultsCount, { fontSize: font.caption }]}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          Showing {displayedBooks.length} of {books.length}
        </Text>
        <TouchableOpacity
          style={styles.sortTrigger}
          onPress={() => sortSheetRef.current?.present()}
          accessibilityRole="button"
          accessibilityLabel={`Sort: ${SORT_LABELS[sortBy]}`}
        >
          <ArrowUpDown size={14} color={colors.cocoa} />
          <Text
            style={[styles.sortTriggerText, { fontSize: font.caption }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            Sort: {SORT_LABELS[sortBy]} ▼
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.iconHit}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={colors.espresso} />
        </TouchableOpacity>
        <Text
          style={[styles.navTitle, { fontSize: font.subtitle }]}
          numberOfLines={1}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          Books for {readerName}
        </Text>
        <TouchableOpacity
          style={styles.iconHit}
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share this book list"
        >
          <Share2 size={20} color={colors.cocoa} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <SkeletonGrid reduceMotion={reduceMotion} />
      ) : (
        <FlatList
          data={displayedBooks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={
            <Text
              style={[styles.footer, { fontSize: font.micro }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Powered by {sourceInfo}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <BookCard
                variant="grid"
                book={item}
                targetAge={age}
                isSaved={savedTitles.has(item.title.toLowerCase())}
                onPress={() => navigation.navigate('BookDetail', { book: item, targetAge: age })}
                onToggleSave={() => handleToggleSave(item)}
              />
            </View>
          )}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomSheetModal
        ref={sortSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheet}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text
            style={[styles.sheetTitle, { fontSize: font.subtitle }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            Sort books
          </Text>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.sortItem}
              onPress={() => {
                setSortBy(option);
                sortSheetRef.current?.dismiss();
              }}
              accessibilityRole="button"
              accessibilityLabel={SORT_LABELS[option]}
              accessibilityState={{ selected: sortBy === option }}
            >
              <Text
                style={[
                  styles.sortItemText,
                  { fontSize: font.body },
                  sortBy === option && styles.sortItemTextActive,
                ]}
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
              >
                {SORT_LABELS[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

function SkeletonGrid({ reduceMotion }: { reduceMotion: boolean }) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduceMotion]);

  return (
    <View style={styles.skeletonWrap}>
      <Text style={styles.loadingTitle}>Curating 20 age-appropriate books…</Text>
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Animated.View key={i} style={[styles.skeletonCard, { opacity }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.linen,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
  },
  iconHit: {
    minWidth: HIT_TARGET,
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontWeight: '700',
    color: colors.espresso,
    flex: 1,
    textAlign: 'center',
  },
  headerArea: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6E6D4',
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  contextText: {
    flex: 1,
    color: colors.espresso,
    fontWeight: '600',
  },
  errorNotice: {
    backgroundColor: '#F8E8E4',
    borderRadius: radii.sm,
    padding: 8,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.rosewood,
  },
  filterScroll: {
    paddingVertical: 6,
  },
  filterChip: {
    backgroundColor: colors.parchment,
    borderRadius: radii.xl,
    paddingHorizontal: 12,
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: colors.honey,
  },
  filterChipText: {
    color: colors.dusty,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.espresso,
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  resultsCount: {
    color: colors.dusty,
    fontWeight: '500',
  },
  sortTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.parchment,
    minHeight: HIT_TARGET,
    paddingHorizontal: 10,
    borderRadius: radii.md,
  },
  sortTriggerText: {
    fontWeight: '700',
    color: colors.cocoa,
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  column: {
    paddingHorizontal: spacing.sm,
  },
  gridItem: {
    flex: 1,
  },
  footer: {
    textAlign: 'center',
    color: colors.dusty,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.linen,
  },
  handle: {
    backgroundColor: colors.dusty,
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sheetTitle: {
    fontWeight: '700',
    color: colors.espresso,
    marginBottom: spacing.sm,
  },
  sortItem: {
    minHeight: HIT_TARGET,
    justifyContent: 'center',
  },
  sortItemText: {
    color: colors.espresso,
  },
  sortItemTextActive: {
    fontWeight: '700',
    color: colors.cocoa,
  },
  skeletonWrap: {
    flex: 1,
    padding: spacing.md,
  },
  loadingTitle: {
    textAlign: 'center',
    color: colors.espresso,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonCard: {
    width: '48%',
    aspectRatio: 2 / 3,
    backgroundColor: colors.parchment,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
  },
});
