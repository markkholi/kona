import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Hash,
  Library,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import { AgeAuditCard } from '../components/AgeAuditCard';
import { isBookSaved, removeSavedBook, saveBook } from '../services/storage';
import { shareSingleBook } from '../services/share';
import { DiscoverStackParamList } from '../types/navigation';
import { getBookCoverSource, getBookJacketTheme } from '../constants/bookCovers';
import { useProfiles } from '../context/ProfileContext';
import { colors, elevation, HIT_TARGET, radii, spacing } from '../theme/tokens';
import { useReduceMotion, useScaledFont } from '../theme/useScaledFont';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'BookDetail'>;

const HERO_HEIGHT = 320;

export const BookDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { book, targetAge } = route.params;
  const { activeProfile } = useProfiles();
  const font = useScaledFont();
  const reduceMotion = useReduceMotion();
  const insets = useSafeAreaInsets();

  const [isSaved, setIsSaved] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [synopsisOpen, setSynopsisOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);

  const coverSource = getBookCoverSource(book);
  const showCover = Boolean(coverSource) && !imageError;
  const jacketTheme = getBookJacketTheme(book.title);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    checkSaved();
  }, [book.title, activeProfile?.id]);

  const checkSaved = async () => {
    if (!activeProfile) return;
    const saved = await isBookSaved(book.title, activeProfile.id);
    setIsSaved(saved);
  };

  const handleToggleSave = async () => {
    if (!activeProfile) return;
    if (isSaved) {
      await removeSavedBook(book.id, activeProfile.id);
      setIsSaved(false);
    } else {
      await saveBook(book, activeProfile.id);
      setIsSaved(true);
    }
  };

  const handleOpenPreview = async () => {
    const url =
      book.previewLink ||
      `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${book.title} ${book.author}`)}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to open link', url);
      }
    } catch {
      Alert.alert('Unable to open link', url);
    }
  };

  const handleLibrarySearch = async () => {
    const query = encodeURIComponent(`${book.title} ${book.author}`);
    const url = `https://www.worldcat.org/search?q=${query}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to search libraries', url);
    }
  };

  const handleShare = async () => {
    await shareSingleBook(book, targetAge, activeProfile?.name);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    return {
      transform: [{ translateY: scrollY.value * 0.35 }],
    };
  }, [reduceMotion]);

  return (
    <View style={styles.safeArea}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
      >
        <View style={styles.heroZone}>
          <Animated.View style={[styles.heroImageWrap, heroStyle]}>
            {showCover ? (
              <Image
                source={coverSource!}
                style={styles.heroImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={[styles.heroFallback, { backgroundColor: jacketTheme.background }]}>
                <BookOpen size={40} color={jacketTheme.icon} />
                <Text style={[styles.heroFallbackTitle, { color: jacketTheme.titleColor }]}>
                  {book.title}
                </Text>
              </View>
            )}
            <View style={styles.heroGradient} />
          </Animated.View>
          <View style={[styles.genreOverlay, { top: insets.top + 8 }]}>
            <Text
              style={[styles.genreOverlayText, { fontSize: font.micro }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              {book.genre || 'Youth Fiction'}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text
            style={[styles.title, { fontSize: font.title }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            {book.title}
          </Text>
          <Text
            style={[styles.author, { fontSize: font.body }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            by {book.author}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Calendar size={12} color={colors.dusty} />
              <Text style={styles.metaChipText}>{book.publishedYear}</Text>
            </View>
            {book.pageCount ? (
              <View style={styles.metaChip}>
                <FileText size={12} color={colors.dusty} />
                <Text style={styles.metaChipText}>{book.pageCount} pages</Text>
              </View>
            ) : null}
            {book.isbn ? (
              <View style={styles.metaChip}>
                <Hash size={12} color={colors.dusty} />
                <Text style={styles.metaChipText}>ISBN {book.isbn}</Text>
              </View>
            ) : null}
          </View>

          <AgeAuditCard book={book} targetAge={targetAge} collapsible />

          {book.description ? (
            <TouchableOpacity
              style={styles.sectionCard}
              onPress={() => setSynopsisOpen((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel="Synopsis"
              accessibilityState={{ expanded: synopsisOpen }}
            >
              <View style={styles.sectionHeader}>
                <BookOpen size={18} color={colors.cocoa} />
                <Text
                  style={[styles.sectionTitle, { fontSize: font.body }]}
                  maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                >
                  Synopsis
                </Text>
                {synopsisOpen ? (
                  <ChevronUp size={16} color={colors.dusty} />
                ) : (
                  <ChevronDown size={16} color={colors.dusty} />
                )}
              </View>
              <Text
                style={[styles.sectionBody, { fontSize: font.body }]}
                numberOfLines={synopsisOpen ? undefined : 3}
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
              >
                {book.description}
              </Text>
              <Text style={styles.readMore}>{synopsisOpen ? 'Show less' : 'Read more'}</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.sectionCard}
            onPress={() => setInterestOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="Why this matches the reader's interest"
            accessibilityState={{ expanded: interestOpen }}
          >
            <View style={styles.sectionHeader}>
              <Sparkles size={18} color={colors.honey} />
              <Text
                style={[styles.sectionTitle, { fontSize: font.body }]}
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
              >
                Interest Connection
              </Text>
              {interestOpen ? (
                <ChevronUp size={16} color={colors.dusty} />
              ) : (
                <ChevronDown size={16} color={colors.dusty} />
              )}
            </View>
            <Text
              style={[styles.sectionBody, { fontSize: font.body }]}
              numberOfLines={interestOpen ? undefined : 3}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              {book.interestConnection}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      <TouchableOpacity
        style={[styles.backFab, { top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={20} color={colors.espresso} />
      </TouchableOpacity>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <TouchableOpacity
          style={[styles.actionBtn, isSaved && styles.saveActive]}
          onPress={handleToggleSave}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove from saved books' : 'Save book'}
        >
          <Bookmark
            size={18}
            color={isSaved ? colors.white : colors.cocoa}
            fill={isSaved ? colors.white : 'transparent'}
          />
          <Text style={[styles.actionLabel, isSaved && styles.actionLabelOn]}>
            {isSaved ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleOpenPreview}
          accessibilityRole="button"
          accessibilityLabel="Open Google Books"
        >
          <ExternalLink size={18} color={colors.cocoa} />
          <Text style={styles.actionLabel}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleLibrarySearch}
          accessibilityRole="button"
          accessibilityLabel="Search libraries on WorldCat"
        >
          <Library size={18} color={colors.cocoa} />
          <Text style={styles.actionLabel}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share this book"
        >
          <Share2 size={18} color={colors.cocoa} />
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  heroZone: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
    backgroundColor: colors.parchment,
  },
  heroImageWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  heroFallbackTitle: {
    marginTop: spacing.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: 'rgba(251,248,244,0.92)',
  },
  genreOverlay: {
    position: 'absolute',
    right: spacing.md,
    backgroundColor: colors.linen,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.xl,
    ...elevation.low,
  },
  genreOverlayText: {
    color: colors.cocoa,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  backFab: {
    position: 'absolute',
    left: spacing.md,
    width: HIT_TARGET,
    height: HIT_TARGET,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,253,251,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.low,
  },
  body: {
    paddingHorizontal: spacing.md,
    marginTop: -24,
  },
  title: {
    fontWeight: '800',
    color: colors.espresso,
    letterSpacing: -0.3,
  },
  author: {
    color: colors.dusty,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.parchment,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginRight: 6,
    marginBottom: 6,
  },
  metaChipText: {
    fontSize: 11,
    color: colors.dusty,
    marginLeft: 4,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: colors.linen,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...elevation.low,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.espresso,
    marginLeft: 8,
    flex: 1,
  },
  sectionBody: {
    color: colors.espresso,
    lineHeight: 22,
  },
  readMore: {
    marginTop: 6,
    color: colors.honey,
    fontWeight: '700',
    fontSize: 13,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: colors.linen,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    ...elevation.medium,
  },
  actionBtn: {
    flex: 1,
    minHeight: HIT_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    marginHorizontal: 2,
    paddingVertical: 6,
  },
  saveActive: {
    backgroundColor: colors.honey,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.cocoa,
    marginTop: 2,
  },
  actionLabelOn: {
    color: colors.white,
  },
});
