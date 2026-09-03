import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Calendar,
  ExternalLink,
  FileText,
  Hash,
  Library,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import { AgeAuditCard } from '../components/AgeAuditCard';
import { isBookSaved, removeSavedBook, saveBook } from '../services/storage';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;

export const BookDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { book, targetAge } = route.params;
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    checkSaved();
  }, [book.title]);

  const checkSaved = async () => {
    const saved = await isBookSaved(book.title);
    setIsSaved(saved);
  };

  const handleToggleSave = async () => {
    if (isSaved) {
      await removeSavedBook(book.id);
      setIsSaved(false);
    } else {
      await saveBook(book);
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
    try {
      await Share.share({
        title: `${book.title} by ${book.author}`,
        message: `Book Recommendation for Age ${targetAge}: "${book.title}" by ${book.author}.\n\nWhy it's age-appropriate: ${book.whyAppropriate}\n\nRecommended by Kona.`,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

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
        <Text style={styles.navTitle} numberOfLines={1}>
          Book Details & Audit
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Share2 size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Book Header / Cover Card */}
        <View style={styles.heroCard}>
          <View style={styles.coverWrapper}>
            {book.coverUrl ? (
              <Image
                source={{ uri: book.coverUrl }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <BookOpen size={40} color="#94A3B8" />
                <Text style={styles.coverPlaceholderText}>Kona Pick</Text>
              </View>
            )}
          </View>

          <View style={styles.heroInfo}>
            <View style={styles.genreBadge}>
              <Text style={styles.genreBadgeText}>{book.genre || 'Youth Fiction'}</Text>
            </View>

            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>by {book.author}</Text>

            {/* Quick Metadata Chips */}
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Calendar size={12} color="#64748B" />
                <Text style={styles.metaChipText}>{book.publishedYear}</Text>
              </View>
              {book.pageCount ? (
                <View style={styles.metaChip}>
                  <FileText size={12} color="#64748B" />
                  <Text style={styles.metaChipText}>{book.pageCount} pages</Text>
                </View>
              ) : null}
              {book.isbn ? (
                <View style={styles.metaChip}>
                  <Hash size={12} color="#64748B" />
                  <Text style={styles.metaChipText}>ISBN {book.isbn}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.saveButtonActive]}
            onPress={handleToggleSave}
          >
            <Bookmark
              size={18}
              color={isSaved ? '#FFFFFF' : '#4F46E5'}
              fill={isSaved ? '#FFFFFF' : 'transparent'}
            />
            <Text style={[styles.saveButtonText, isSaved && styles.saveButtonTextActive]}>
              {isSaved ? 'Saved to Reading List' : 'Save Book'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.previewButton} onPress={handleOpenPreview}>
            <ExternalLink size={18} color="#0F172A" />
            <Text style={styles.previewButtonText}>Google Books</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.libraryButton} onPress={handleLibrarySearch}>
            <Library size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Dedicated Age Appropriateness Audit Component */}
        <AgeAuditCard book={book} targetAge={targetAge} />

        {/* Interest Connection Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Sparkles size={18} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Why This Matches The Reader’s Interest</Text>
          </View>
          <Text style={styles.sectionBody}>{book.interestConnection}</Text>
        </View>

        {/* Book Synopsis / Description */}
        {book.description ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <BookOpen size={18} color="#0F172A" />
              <Text style={styles.sectionTitle}>Synopsis</Text>
            </View>
            <Text style={styles.sectionBody}>{book.description}</Text>
          </View>
        ) : null}
      </ScrollView>
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  actionButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  coverWrapper: {
    width: 100,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  coverPlaceholderText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '600',
  },
  heroInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  genreBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  genreBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  metaChipText: {
    fontSize: 11,
    color: '#475569',
    marginLeft: 4,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  saveButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginLeft: 6,
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
  previewButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  previewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 6,
  },
  libraryButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  sectionBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
});
