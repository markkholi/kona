import React, { useState, useEffect } from 'react';
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
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Bookmark,
  BookOpen,
  Compass,
  History,
  Info,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react-native';
import { AGE_PROFILES } from '../constants/ageRubric';
import { addRecentSearch, getRecentSearches, RecentSearch } from '../services/storage';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const AGES = [10, 11, 12, 13, 14, 15, 16, 17];

const QUICK_INTERESTS = [
  'Space mystery with AI & robots',
  'Boarding school secret societies',
  'Greek & Norse mythology quests',
  'Coding, hackathons & robotics',
  'Graphic novels with humour & heart',
  'High-stakes survival in wilderness',
  'Empathetic dog & animal stories',
  'Found-family fantasy heist',
  'Historical wartime resistance',
  'Sports underdog overcoming odds',
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedAge, setSelectedAge] = useState<number>(12);
  const [interest, setInterest] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    loadRecentSearches();
    const unsubscribe = navigation.addListener('focus', () => {
      loadRecentSearches();
    });
    return unsubscribe;
  }, [navigation]);

  const loadRecentSearches = async () => {
    const list = await getRecentSearches();
    setRecentSearches(list);
  };

  const currentProfile = AGE_PROFILES[selectedAge] || AGE_PROFILES[12];

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
    await addRecentSearch(selectedAge, trimmed);
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Fixed Top Navigation Bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoIcon}>
              <BookOpen size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>KONA</Text>
              <Text style={styles.brandSubtitle}>Youth Book Recommender</Text>
            </View>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('SavedBooks')}
              accessibilityLabel="Saved Books"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Bookmark size={20} color="#334155" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Settings')}
              accessibilityLabel="Settings"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Settings size={20} color="#334155" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Intro Banner */}
          <View style={styles.introCard}>
              <View style={styles.introHeader}>
                <Sparkles size={18} color="#4F46E5" />
                <Text style={styles.introTitle}>20 Hand-Vetted Book Recommendations</Text>
              </View>
              <Text style={styles.introBody}>
                Tailored to your child’s passions, with strict pedagogical validation ensuring all 20 options are developmentally appropriate for their age.
              </Text>
            </View>

            {/* Step 1: Age Selector */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionStep}>STEP 1</Text>
                <Text style={styles.sectionTitle}>Select Reader’s Age</Text>
              </View>

              {/* Age Pills (10 to 17) */}
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
                    >
                      <Text style={[styles.agePillNumber, isSelected && styles.agePillNumberActive]}>
                        {age}
                      </Text>
                      <Text style={[styles.agePillLabel, isSelected && styles.agePillLabelActive]}>
                        yrs
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Age Validation Card */}
              <View style={styles.ageProfileCard}>
                <View style={styles.ageProfileTop}>
                  <ShieldCheck size={18} color="#10B981" />
                  <Text style={styles.ageProfileGrade}>
                    {currentProfile.grade} • {currentProfile.stage}
                  </Text>
                </View>
                <Text style={styles.ageProfileLexile}>
                  Target Reading Complexity: <Text style={styles.bold}>{currentProfile.lexileRange}</Text>
                </Text>
                <Text style={styles.ageProfileGuidelines}>
                  {currentProfile.guidelines}
                </Text>
              </View>
            </View>

            {/* Step 2: Interest Text Box */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionStep}>STEP 2</Text>
                <Text style={styles.sectionTitle}>What Are They Interested In?</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Type topics, genres, hobbies, favorite games, historical periods, or story themes.
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={interest}
                  onChangeText={setInterest}
                  placeholder="e.g. Space mysteries with smart robots, locked room puzzles, or fantasy with animals"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {interest.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={() => setInterest('')}
                  >
                    <X size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Quick Interest Ideas */}
              <View style={styles.quickIdeasHeader}>
                <Compass size={14} color="#64748B" />
                <Text style={styles.quickIdeasTitle}>Tap to try an interest:</Text>
              </View>
              <View style={styles.chipsWrap}>
                {QUICK_INTERESTS.map((chip, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    style={styles.chip}
                    onPress={() => setInterest(chip)}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Search History */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.recentHeader}>
                  <History size={14} color="#64748B" />
                  <Text style={styles.recentTitle}>Recent Inquiries</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
                  {recentSearches.slice(0, 5).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.recentItem}
                      onPress={() => handleSelectRecent(item)}
                    >
                      <Text style={styles.recentAgeBadge}>Age {item.age}</Text>
                      <Text style={styles.recentInterest} numberOfLines={1}>
                        {item.interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Search Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.primaryButton}
              onPress={handleSearch}
            >
              <Search size={20} color="#FFFFFF" style={styles.btnIcon} />
              <Text style={styles.primaryButtonText}>Recommend 20 Books</Text>
            </TouchableOpacity>

            {/* Validation Guarantee Footnote */}
            <View style={styles.guaranteeFooter}>
              <ShieldCheck size={14} color="#059669" />
              <Text style={styles.guaranteeText}>
                Every recommendation undergoes automated multi-point age-suitability auditing for violence, language, romance, and dark themes.
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
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  topActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  introCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730A3',
    marginLeft: 6,
  },
  introBody: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 17,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionStep: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    marginTop: 2,
  },
  ageScroll: {
    paddingVertical: 8,
  },
  agePill: {
    width: 58,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  agePillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  agePillNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  agePillNumberActive: {
    color: '#FFFFFF',
  },
  agePillLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -2,
  },
  agePillLabelActive: {
    color: '#E0E7FF',
  },
  ageProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ageProfileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ageProfileGrade: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 6,
  },
  ageProfileLexile: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  ageProfileGuidelines: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  inputContainer: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    padding: 12,
    minHeight: 88,
  },
  textInput: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
    paddingRight: 24,
  },
  clearBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
  quickIdeasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  quickIdeasTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 6,
  },
  recentScroll: {
    paddingVertical: 2,
  },
  recentItem: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 220,
  },
  recentAgeBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  recentInterest: {
    fontSize: 11,
    color: '#334155',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guaranteeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 12,
  },
  guaranteeText: {
    fontSize: 10,
    color: '#059669',
    marginLeft: 6,
    textAlign: 'center',
    lineHeight: 14,
    flex: 1,
  },
});
