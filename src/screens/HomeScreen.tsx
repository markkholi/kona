import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { History, Search, ShieldCheck, X } from 'lucide-react-native';
import { AGE_PROFILES } from '../constants/ageRubric';
import { addRecentSearch, getRecentSearches, RecentSearch } from '../services/storage';
import { DiscoverStackParamList } from '../types/navigation';
import { ProfilePill } from '../components/ProfilePill';
import { useProfiles } from '../context/ProfileContext';
import { colors, elevation, HIT_TARGET, radii, spacing } from '../theme/tokens';
import { useScaledFont } from '../theme/useScaledFont';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'Home'>;

const AGES = [10, 11, 12, 13, 14, 15, 16, 17];

const MOOD_CHIPS = [
  { emoji: '🚀', label: 'Space & Sci-Fi' },
  { emoji: '⚔️', label: 'Epic Fantasy' },
  { emoji: '🔍', label: 'Mystery & Thriller' },
  { emoji: '💻', label: 'Coding & Tech' },
  { emoji: '🐾', label: 'Animal Stories' },
  { emoji: '🏔️', label: 'Survival' },
  { emoji: '⚽', label: 'Sports' },
  { emoji: '🎭', label: 'Graphic Novels' },
  { emoji: '🏛️', label: 'History' },
  { emoji: '🌍', label: 'Diverse Voices' },
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { activeProfile } = useProfiles();
  const font = useScaledFont();
  const [selectedAge, setSelectedAge] = useState<number>(activeProfile?.age ?? 12);
  const [interest, setInterest] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    if (activeProfile) {
      setSelectedAge(activeProfile.age);
    }
  }, [activeProfile?.id, activeProfile?.age]);

  useEffect(() => {
    loadRecentSearches();
    const unsubscribe = navigation.addListener('focus', () => {
      loadRecentSearches();
    });
    return unsubscribe;
  }, [navigation, activeProfile?.id]);

  const loadRecentSearches = async () => {
    if (!activeProfile) return;
    const list = await getRecentSearches(activeProfile.id);
    setRecentSearches(list);
  };

  const currentProfile = AGE_PROFILES[selectedAge] || AGE_PROFILES[12];
  const readerName = activeProfile?.name ?? 'Reader';
  const displayName =
    readerName.toLowerCase() === 'default reader' ? 'Reader' : readerName;

  const handleSearch = async () => {
    const trimmed = interest.trim();
    if (!trimmed) {
      Alert.alert(
        'Please enter an interest',
        'Tell us what kinds of themes, topics, or stories the student loves reading!'
      );
      return;
    }

    if (selectedAge < 10 || selectedAge > 17) {
      Alert.alert('Invalid Age', 'Kona curates books for kids between 10 and 17.');
      return;
    }

    Keyboard.dismiss();
    if (activeProfile) {
      await addRecentSearch(selectedAge, trimmed, activeProfile.id);
    }
    navigation.navigate('Results', {
      age: selectedAge,
      interest: trimmed,
    });
  };

  const handleSelectRecent = (item: RecentSearch) => {
    setSelectedAge(item.age);
    setInterest(item.interest);
    navigation.navigate('Results', {
      age: item.age,
      interest: item.interest,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.profileStrip}>
          <ProfilePill />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text
              style={[styles.heroTitle, { fontSize: font.hero }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              What should {displayName} read next?
            </Text>
            <Text
              style={[styles.heroSub, { fontSize: font.body }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Pick an age, share an interest, and we'll find 20 perfect books.
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ageScroll}
          >
            {AGES.map((age) => {
              const isSelected = selectedAge === age;
              return (
                <TouchableOpacity
                  key={age}
                  activeOpacity={0.7}
                  style={[styles.agePill, isSelected && styles.agePillActive]}
                  onPress={() => setSelectedAge(age)}
                  accessibilityRole="button"
                  accessibilityLabel={`Age ${age}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.agePillNumber,
                      { fontSize: font.title },
                      isSelected && styles.agePillNumberActive,
                    ]}
                    maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                  >
                    {age}
                  </Text>
                  <Text
                    style={[
                      styles.agePillLabel,
                      { fontSize: font.micro },
                      isSelected && styles.agePillLabelActive,
                    ]}
                    maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                  >
                    yrs
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.ageProfileCard}>
            <View style={styles.ageProfileTop}>
              <ShieldCheck size={18} color={colors.sage} />
              <Text
                style={[styles.ageProfileGrade, { fontSize: font.body }]}
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
              >
                {currentProfile.grade} • {currentProfile.stage}
              </Text>
            </View>
            <Text
              style={[styles.ageProfileLexile, { fontSize: font.caption }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Target Reading Complexity:{' '}
              <Text style={styles.bold}>{currentProfile.lexileRange}</Text>
            </Text>
          </View>

          <View style={styles.inputCard}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { fontSize: font.body }]}
                value={interest}
                onChangeText={setInterest}
                placeholder="e.g. Space mysteries with smart robots..."
                placeholderTextColor={colors.dusty}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                accessibilityLabel="Reader interest"
              />
              {interest.length > 0 && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => setInterest('')}
                  accessibilityRole="button"
                  accessibilityLabel="Clear interest"
                >
                  <X size={16} color={colors.dusty} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodScroll}
            >
              {MOOD_CHIPS.map((chip) => {
                const fill = `${chip.emoji} ${chip.label}`;
                const isSelected = interest === fill || interest === chip.label;
                return (
                  <TouchableOpacity
                    key={chip.label}
                    activeOpacity={0.7}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setInterest(fill)}
                    accessibilityRole="button"
                    accessibilityLabel={chip.label}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { fontSize: font.caption },
                        isSelected && styles.chipTextActive,
                      ]}
                      maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                    >
                      {chip.emoji} {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={handleSearch}
            accessibilityRole="button"
            accessibilityLabel={`Find 20 books for ${displayName}`}
          >
            <Search size={20} color={colors.white} style={styles.btnIcon} />
            <Text
              style={[styles.primaryButtonText, { fontSize: font.subtitle }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Find 20 Books for {displayName} →
            </Text>
          </TouchableOpacity>

          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.recentHeader}>
                <History size={14} color={colors.dusty} />
                <Text
                  style={[styles.recentTitle, { fontSize: font.caption }]}
                  maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                >
                  Continue Reading Journey
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentScroll}
              >
                {recentSearches.slice(0, 5).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recentItem}
                    onPress={() => handleSelectRecent(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Recent search, age ${item.age}, ${item.interest}`}
                  >
                    <Text
                      style={[styles.recentAgeBadge, { fontSize: font.micro }]}
                      maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                    >
                      Age {item.age}
                    </Text>
                    <Text
                      style={[styles.recentInterest, { fontSize: font.caption }]}
                      numberOfLines={1}
                      maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                    >
                      {item.interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.guaranteeFooter}>
            <ShieldCheck size={14} color={colors.sage} />
            <Text
              style={[styles.guaranteeText, { fontSize: font.micro }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Every recommendation is audited for violence, language, romance, and dark themes.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  keyboardView: {
    flex: 1,
  },
  profileStrip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    backgroundColor: colors.parchment,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontWeight: '800',
    color: colors.espresso,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  heroSub: {
    color: colors.dusty,
    lineHeight: 22,
  },
  ageScroll: {
    paddingVertical: spacing.sm,
  },
  agePill: {
    width: 64,
    height: 72,
    borderRadius: radii.lg,
    backgroundColor: colors.linen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    ...elevation.low,
  },
  agePillActive: {
    backgroundColor: colors.honey,
  },
  agePillNumber: {
    fontWeight: '800',
    color: colors.dusty,
  },
  agePillNumberActive: {
    color: colors.espresso,
  },
  agePillLabel: {
    fontWeight: '600',
    color: colors.dusty,
    marginTop: -2,
  },
  agePillLabelActive: {
    color: colors.espresso,
  },
  ageProfileCard: {
    backgroundColor: colors.linen,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...elevation.low,
  },
  ageProfileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ageProfileGrade: {
    fontWeight: '700',
    color: colors.sage,
    marginLeft: 6,
    flex: 1,
  },
  ageProfileLexile: {
    color: colors.dusty,
  },
  bold: {
    fontWeight: '700',
    color: colors.espresso,
  },
  inputCard: {
    backgroundColor: colors.linen,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...elevation.low,
  },
  inputContainer: {
    position: 'relative',
    minHeight: 88,
  },
  textInput: {
    color: colors.espresso,
    lineHeight: 22,
    paddingRight: 28,
  },
  clearBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: HIT_TARGET,
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodScroll: {
    paddingTop: spacing.sm,
  },
  chip: {
    backgroundColor: colors.parchment,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.honey,
  },
  chipText: {
    color: colors.espresso,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.espresso,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: colors.cocoa,
    borderRadius: radii.md,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.medium,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontWeight: '700',
    color: colors.white,
  },
  section: {
    marginTop: spacing.lg,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTitle: {
    fontWeight: '600',
    color: colors.dusty,
    marginLeft: 6,
  },
  recentScroll: {
    paddingVertical: 2,
  },
  recentItem: {
    backgroundColor: colors.parchment,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    minHeight: HIT_TARGET,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 220,
  },
  recentAgeBadge: {
    fontWeight: '700',
    color: colors.cocoa,
    backgroundColor: colors.linen,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  recentInterest: {
    color: colors.espresso,
    flex: 1,
  },
  guaranteeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: 12,
  },
  guaranteeText: {
    color: colors.sage,
    marginLeft: 6,
    textAlign: 'center',
    lineHeight: 14,
    flex: 1,
  },
});
