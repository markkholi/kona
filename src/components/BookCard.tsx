import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bookmark, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react-native';
import { BookRecommendation } from '../types/book';

interface BookCardProps {
  book: BookRecommendation;
  targetAge: number;
  isSaved?: boolean;
  onPress: () => void;
  onToggleSave?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  targetAge,
  isSaved = false,
  onPress,
  onToggleSave,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.contentRow}>
        {/* Book Cover or Fallback */}
        <View style={styles.coverContainer}>
          {book.coverUrl ? (
            <Image
              source={{ uri: book.coverUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <BookOpen size={28} color="#94A3B8" />
              <Text style={styles.placeholderText} numberOfLines={2}>
                {book.title}
              </Text>
            </View>
          )}
        </View>

        {/* Book Info */}
        <View style={styles.infoCol}>
          <View style={styles.headerRow}>
            <View style={styles.genreBadge}>
              <Text style={styles.genreText} numberOfLines={1}>
                {book.genre || 'Youth Fiction'}
              </Text>
            </View>
            {onToggleSave && (
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={onToggleSave}
                style={styles.saveBtn}
              >
                <Bookmark
                  size={18}
                  color={isSaved ? '#4F46E5' : '#94A3B8'}
                  fill={isSaved ? '#4F46E5' : 'transparent'}
                />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            by {book.author} ({book.publishedYear})
          </Text>

          {/* Age Appropriateness Validation Badge */}
          <View style={styles.ageBadge}>
            <CheckCircle2 size={13} color="#10B981" />
            <Text style={styles.ageBadgeText}>
              Verified for Age {targetAge} ({book.recommendedAgeMin}–{book.recommendedAgeMax} yrs)
            </Text>
          </View>

          {/* Interest Connection or Why Appropriate */}
          <Text style={styles.rationaleSnippet} numberOfLines={2}>
            {book.interestConnection || book.whyAppropriate}
          </Text>

          <View style={styles.footerRow}>
            <Text style={styles.readingLevel} numberOfLines={1}>
              {book.readingLevel}
            </Text>
            <View style={styles.viewDetailsRow}>
              <Text style={styles.viewDetailsText}>Audit Details</Text>
              <ChevronRight size={14} color="#4F46E5" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  contentRow: {
    flexDirection: 'row',
  },
  coverContainer: {
    width: 76,
    height: 114,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    backgroundColor: '#F1F5F9',
  },
  placeholderText: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: '85%',
  },
  genreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saveBtn: {
    padding: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 19,
  },
  author: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 4,
  },
  ageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  ageBadgeText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
    marginLeft: 4,
  },
  rationaleSnippet: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 4,
  },
  readingLevel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '700',
  },
});
