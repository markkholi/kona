import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bookmark, BookOpen, CheckCircle2, ChevronRight, Heart } from 'lucide-react-native';
import { BookRecommendation } from '../types/book';
import { getBookCoverSource, getBookJacketTheme } from '../constants/bookCovers';
import { colors, elevation, HIT_TARGET, radii, spacing } from '../theme/tokens';
import { useScaledFont } from '../theme/useScaledFont';

interface BookCardProps {
  book: BookRecommendation;
  targetAge: number;
  isSaved?: boolean;
  onPress: () => void;
  onToggleSave?: () => void;
  variant?: 'list' | 'grid';
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  targetAge,
  isSaved = false,
  onPress,
  onToggleSave,
  variant = 'list',
}) => {
  const [imageError, setImageError] = useState(false);
  const coverSource = getBookCoverSource(book);
  const showCover = Boolean(coverSource) && !imageError;
  const jacketTheme = getBookJacketTheme(book.title);
  const font = useScaledFont();

  const coverFallback = (
    <View style={[styles.coverPlaceholder, { backgroundColor: jacketTheme.background }]}>
      <View style={[styles.spineAccent, { backgroundColor: jacketTheme.spine }]} />
      <View style={styles.placeholderInner}>
        <BookOpen size={variant === 'grid' ? 24 : 20} color={jacketTheme.icon} />
        <Text
          style={[styles.placeholderTitle, { color: jacketTheme.titleColor }]}
          numberOfLines={3}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          {book.title}
        </Text>
        <Text
          style={[styles.placeholderAuthor, { color: jacketTheme.authorColor }]}
          numberOfLines={1}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          {book.author}
        </Text>
      </View>
    </View>
  );

  if (variant === 'grid') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.gridCard}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${book.title} by ${book.author}`}
      >
        <View style={styles.gridCover}>
          {showCover ? (
            <Image
              source={coverSource!}
              style={styles.coverImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            coverFallback
          )}
          <View style={styles.scrim} />
          {onToggleSave ? (
            <TouchableOpacity
              style={styles.gridHeart}
              onPress={onToggleSave}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? `Remove ${book.title} from saved books` : `Save ${book.title}`}
            >
              <Heart
                size={18}
                color={isSaved ? colors.honey : colors.white}
                fill={isSaved ? colors.honey : 'transparent'}
              />
            </TouchableOpacity>
          ) : null}
          <View style={styles.gridOverlay}>
            <Text
              style={[styles.gridTitle, { fontSize: font.caption }]}
              numberOfLines={2}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              {book.title}
            </Text>
            <Text
              style={[styles.gridMeta, { fontSize: font.micro }]}
              numberOfLines={1}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              {book.author} · {book.publishedYear}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}, verified for age ${targetAge}`}
    >
      <View style={styles.contentRow}>
        <View style={styles.coverContainer}>
          {showCover ? (
            <Image
              source={coverSource!}
              style={styles.coverImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            coverFallback
          )}
        </View>

        <View style={styles.infoCol}>
          <View style={styles.headerRow}>
            <View style={styles.genreBadge}>
              <Text
                style={[styles.genreText, { fontSize: font.micro }]}
                numberOfLines={1}
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
              >
                {book.genre || 'Youth Fiction'}
              </Text>
            </View>
            {onToggleSave && (
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={onToggleSave}
                style={styles.saveBtn}
                accessibilityRole="button"
                accessibilityLabel={isSaved ? `Remove ${book.title} from saved books` : `Save ${book.title}`}
              >
                <Bookmark
                  size={18}
                  color={isSaved ? colors.honey : colors.dusty}
                  fill={isSaved ? colors.honey : 'transparent'}
                />
              </TouchableOpacity>
            )}
          </View>

          <Text
            style={[styles.title, { fontSize: font.body }]}
            numberOfLines={2}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            {book.title}
          </Text>
          <Text
            style={[styles.author, { fontSize: font.caption }]}
            numberOfLines={1}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            by {book.author} ({book.publishedYear})
          </Text>

          <View style={styles.ageBadge}>
            <CheckCircle2 size={13} color={colors.sage} />
            <Text
              style={[styles.ageBadgeText, { fontSize: font.caption }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Verified for Age {targetAge} ({book.recommendedAgeMin}–{book.recommendedAgeMax} yrs)
            </Text>
          </View>

          <Text
            style={[styles.rationaleSnippet, { fontSize: font.caption }]}
            numberOfLines={2}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            {book.interestConnection || book.whyAppropriate}
          </Text>

          <View style={styles.footerRow}>
            <Text
              style={[styles.readingLevel, { fontSize: font.caption }]}
              numberOfLines={1}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              {book.readingLevel}
            </Text>
            <View style={styles.viewDetailsRow}>
              <Text
                style={[styles.viewDetailsText, { fontSize: font.caption }]}
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
              >
                Audit Details
              </Text>
              <ChevronRight size={14} color={colors.cocoa} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.linen,
    borderRadius: radii.lg,
    padding: 12,
    marginHorizontal: spacing.md,
    marginVertical: 6,
    ...elevation.low,
  },
  contentRow: {
    flexDirection: 'row',
  },
  coverContainer: {
    width: 80,
    height: 120,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: colors.parchment,
    marginRight: 12,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    flexDirection: 'row',
  },
  spineAccent: {
    width: 5,
    height: '100%',
  },
  placeholderInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  placeholderTitle: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12,
  },
  placeholderAuthor: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  genreBadge: {
    backgroundColor: colors.parchment,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: '85%',
  },
  genreText: {
    fontWeight: '700',
    color: colors.cocoa,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saveBtn: {
    padding: 2,
    minWidth: HIT_TARGET - 16,
    minHeight: HIT_TARGET - 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: colors.espresso,
    lineHeight: 19,
  },
  author: {
    color: colors.dusty,
    marginTop: 2,
    marginBottom: 4,
  },
  ageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF6F1',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  ageBadgeText: {
    color: colors.sage,
    fontWeight: '600',
    marginLeft: 4,
  },
  rationaleSnippet: {
    color: colors.dusty,
    lineHeight: 15,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.parchment,
    paddingTop: 4,
  },
  readingLevel: {
    color: colors.dusty,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: colors.cocoa,
    fontWeight: '700',
  },
  gridCard: {
    flex: 1,
    margin: spacing.xs,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.parchment,
    ...elevation.low,
  },
  gridCover: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '45%',
    backgroundColor: 'rgba(59,47,47,0.55)',
  },
  gridHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: HIT_TARGET,
    height: HIT_TARGET,
    borderRadius: radii.full,
    backgroundColor: 'rgba(59,47,47,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
  },
  gridTitle: {
    color: colors.white,
    fontWeight: '700',
  },
  gridMeta: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
