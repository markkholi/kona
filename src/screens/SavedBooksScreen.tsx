import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Swipeable } from 'react-native-gesture-handler';
import { BookOpen, Compass, Trash2 } from 'lucide-react-native';
import { BookCard } from '../components/BookCard';
import { ShareFab } from '../components/ShareFab';
import { getSavedBooks, removeSavedBook } from '../services/storage';
import { shareBookList } from '../services/share';
import { BookRecommendation } from '../types/book';
import { SavedStackParamList, TabParamList } from '../types/navigation';
import { useProfiles } from '../context/ProfileContext';
import { colors, elevation, HIT_TARGET, radii, spacing } from '../theme/tokens';
import { useScaledFont } from '../theme/useScaledFont';

type Props = CompositeScreenProps<
  NativeStackScreenProps<SavedStackParamList, 'SavedBooks'>,
  BottomTabScreenProps<TabParamList>
>;

export const SavedBooksScreen: React.FC<Props> = ({ navigation }) => {
  const { activeProfile } = useProfiles();
  const font = useScaledFont();
  const [savedBooks, setSavedBooks] = useState<BookRecommendation[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    loadSaved();
    const unsubscribe = navigation.addListener('focus', () => {
      loadSaved();
    });
    return unsubscribe;
  }, [navigation, activeProfile?.id]);

  const loadSaved = async () => {
    if (!activeProfile) return;
    const list = await getSavedBooks(activeProfile.id);
    setSavedBooks(list);
  };

  const handleRemove = async (book: BookRecommendation) => {
    if (!activeProfile) return;
    await removeSavedBook(book.id, activeProfile.id);
    setSavedBooks((prev) => prev.filter((b) => b.id !== book.id && b.title !== book.title));
  };

  const confirmRemove = (book: BookRecommendation) => {
    Alert.alert('Remove book', `Remove “${book.title}” from ${activeProfile?.name}'s list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => handleRemove(book) },
    ]);
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

  const readerName = activeProfile?.name ?? 'Reader';

  const renderRightActions = (book: BookRecommendation) => (
    <TouchableOpacity
      style={styles.swipeDelete}
      onPress={() => confirmRemove(book)}
      accessibilityRole="button"
      accessibilityLabel={`Remove ${book.title}`}
    >
      <Trash2 size={20} color={colors.white} />
      <Text style={styles.swipeDeleteText}>Remove</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <Text
          style={[styles.navTitle, { fontSize: font.title }]}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          My Bookshelf
        </Text>
        <View style={styles.countBadge}>
          <Text
            style={[styles.countBadgeText, { fontSize: font.caption }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            {savedBooks.length}
          </Text>
        </View>
      </View>

      {savedBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyStack}>
            <BookOpen size={28} color={colors.honey} />
            <BookOpen size={36} color={colors.cocoa} style={styles.emptyMid} />
            <BookOpen size={28} color={colors.sage} />
          </View>
          <Text
            style={[styles.emptyTitle, { fontSize: font.hero }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            Start saving books you love
          </Text>
          <Text
            style={[styles.emptySubtitle, { fontSize: font.body }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            Discover 20 age-audited books and tap the heart to keep them on {readerName}'s shelf.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('DiscoverTab')}
            accessibilityRole="button"
            accessibilityLabel="Discover books"
          >
            <Compass size={18} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.exploreBtnText}>Discover Books</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.profileBadge}>
            <Text
              style={[styles.profileBadgeText, { fontSize: font.caption }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Showing {readerName}'s saved books ({savedBooks.length})
            </Text>
          </View>
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
              <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
                <BookCard
                  variant="list"
                  book={item}
                  targetAge={item.recommendedAgeMin}
                  isSaved
                  onPress={() =>
                    navigation.navigate('BookDetail', {
                      book: item,
                      targetAge: item.recommendedAgeMin,
                    })
                  }
                  onToggleSave={() => confirmRemove(item)}
                />
              </Swipeable>
            )}
          />
          <ShareFab
            onPress={() => shareBookList(savedBooks, undefined, undefined, readerName)}
            accessibilityLabel={`Share ${readerName}'s saved book list`}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.linen,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
  },
  navTitle: {
    fontWeight: '700',
    color: colors.espresso,
  },
  countBadge: {
    backgroundColor: colors.parchment,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.xl,
    minHeight: HIT_TARGET - 12,
    justifyContent: 'center',
  },
  countBadgeText: {
    fontWeight: '800',
    color: colors.cocoa,
  },
  profileBadge: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  profileBadgeText: {
    color: colors.dusty,
    fontWeight: '600',
  },
  filterBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  filterScroll: {
    flexDirection: 'row',
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
  listContent: {
    paddingVertical: 8,
    paddingBottom: 96,
  },
  swipeDelete: {
    backgroundColor: colors.rosewood,
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    marginVertical: 6,
    marginRight: spacing.md,
    borderRadius: radii.lg,
  },
  swipeDeleteText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyStack: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  emptyMid: {
    marginHorizontal: -6,
    marginBottom: 8,
  },
  emptyTitle: {
    fontWeight: '800',
    color: colors.espresso,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    color: colors.dusty,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cocoa,
    minHeight: 56,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    ...elevation.medium,
  },
  exploreBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});
