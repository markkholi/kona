import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import {
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  EyeOff,
  Key,
  Plus,
  Save,
  Shield,
  Trash2,
  Users,
} from 'lucide-react-native';
import { AGE_PROFILES } from '../constants/ageRubric';
import {
  clearAllRecentSearches,
  clearRecentSearches,
  getApiSettings,
  saveApiSettings,
} from '../services/storage';
import { ApiSettings } from '../types/book';
import { SettingsStackParamList } from '../types/navigation';
import { MAX_PROFILES, ReaderProfile } from '../types/profile';
import { useProfiles } from '../context/ProfileContext';
import { getAvatarColor } from '../components/ProfileSwitcher';
import { colors, elevation, HIT_TARGET, radii, spacing } from '../theme/tokens';
import { useScaledFont } from '../theme/useScaledFont';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

const AGES = [10, 11, 12, 13, 14, 15, 16, 17];

type EditorState =
  | { mode: 'add' }
  | { mode: 'edit'; profile: ReaderProfile }
  | null;

export const SettingsScreen: React.FC<Props> = () => {
  const { profiles, activeProfile, addProfile, updateProfile, deleteProfile, switchProfile } =
    useProfiles();
  const font = useScaledFont();

  const [settings, setSettings] = useState<ApiSettings>({
    provider: 'mock',
    geminiApiKey: '',
    openaiApiKey: '',
  });
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [expandedAge, setExpandedAge] = useState<number | null>(null);
  const [editor, setEditor] = useState<EditorState>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState(12);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await getApiSettings();
    setSettings(loaded);
  };

  const handleSave = async () => {
    await saveApiSettings(settings);
    Alert.alert('Settings Saved', 'Your recommendation engine preferences have been saved.');
  };

  const handleTestConnection = async () => {
    if (settings.provider === 'mock') {
      setTestResult({
        success: true,
        message: 'Curated Educator Library is built-in and 100% operational offline.',
      });
      return;
    }

    if (settings.provider === 'gemini' && !settings.geminiApiKey.trim()) {
      setTestResult({ success: false, message: 'Please paste your Google Gemini API key first.' });
      return;
    }

    if (settings.provider === 'openai' && !settings.openaiApiKey.trim()) {
      setTestResult({ success: false, message: 'Please paste your OpenAI API key first.' });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    try {
      if (settings.provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey.trim()}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Ping test. Reply with: OK' }] }],
          }),
        });
        if (resp.ok) {
          setTestResult({ success: true, message: 'Connected to Gemini API successfully!' });
        } else {
          const err = await resp.text();
          setTestResult({
            success: false,
            message: `Gemini Error (${resp.status}): ${err.substring(0, 100)}`,
          });
        }
      } else {
        const resp = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${settings.openaiApiKey.trim()}` },
        });
        if (resp.ok) {
          setTestResult({ success: true, message: 'Connected to OpenAI API successfully!' });
        } else {
          const err = await resp.text();
          setTestResult({
            success: false,
            message: `OpenAI Error (${resp.status}): ${err.substring(0, 100)}`,
          });
        }
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e?.message || 'Network connection failed.' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Search History',
      'Clear recent searches for this reader only, or for all readers on this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'This reader',
          onPress: async () => {
            if (!activeProfile) return;
            await clearRecentSearches(activeProfile.id);
            Alert.alert('Cleared', `Search history cleared for ${activeProfile.name}.`);
          },
        },
        {
          text: 'All readers',
          style: 'destructive',
          onPress: async () => {
            await clearAllRecentSearches(profiles.map((p) => p.id));
            Alert.alert('Cleared', 'Search history cleared for all readers.');
          },
        },
      ]
    );
  };

  const openAdd = () => {
    setEditName('');
    setEditAge(12);
    setEditor({ mode: 'add' });
  };

  const openEdit = (profile: ReaderProfile) => {
    setEditName(profile.name);
    setEditAge(profile.age);
    setEditor({ mode: 'edit', profile });
  };

  const saveEditor = async () => {
    if (!editor) return;
    if (editor.mode === 'add') {
      const created = await addProfile(editName, editAge);
      if (created) setEditor(null);
    } else {
      await updateProfile(editor.profile.id, { name: editName, age: editAge });
      setEditor(null);
    }
  };

  const confirmDelete = (profile: ReaderProfile) => {
    Alert.alert(
      'Delete profile',
      `Delete ${profile.name}? Their saved books and search history will be removed from this device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteProfile(profile.id);
            if (ok) setEditor(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <Text
          style={[styles.navTitle, { fontSize: font.title }]}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          Settings
        </Text>
        <TouchableOpacity
          style={styles.saveIconButton}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save settings"
        >
          <Save size={20} color={colors.cocoa} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={18} color={colors.cocoa} />
              <Text
                style={[styles.sectionTitle, { fontSize: font.subtitle }]}
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
              >
                Reader Profiles
              </Text>
            </View>
            <Text
              style={[styles.sectionDesc, { fontSize: font.caption }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Names stay on this device. Recommendations only send age and interest.
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {profiles.map((profile) => {
                const isActive = profile.id === activeProfile?.id;
                const initial = (profile.name.trim()[0] || 'R').toUpperCase();
                return (
                  <TouchableOpacity
                    key={profile.id}
                    style={[styles.profileCard, isActive && styles.profileCardActive]}
                    onPress={() => switchProfile(profile.id)}
                    onLongPress={() => openEdit(profile)}
                    accessibilityRole="button"
                    accessibilityLabel={`${profile.name}, age ${profile.age}`}
                    accessibilityState={{ selected: isActive }}
                  >
                    <View style={[styles.avatar, { backgroundColor: getAvatarColor(profile.avatarIndex) }]}>
                      <Text style={styles.initial}>{initial}</Text>
                    </View>
                    <Text
                      style={[styles.profileName, { fontSize: font.caption }]}
                      numberOfLines={1}
                      maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                    >
                      {profile.name}
                    </Text>
                    <Text
                      style={[styles.profileAge, { fontSize: font.micro }]}
                      maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                    >
                      Age {profile.age}
                    </Text>
                    {isActive ? <Check size={14} color={colors.honey} /> : null}
                    <TouchableOpacity
                      style={styles.editMini}
                      onPress={() => openEdit(profile)}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${profile.name}`}
                    >
                      <Text style={styles.editMiniText}>Edit</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
              {profiles.length < MAX_PROFILES ? (
                <TouchableOpacity
                  style={styles.addCard}
                  onPress={openAdd}
                  accessibilityRole="button"
                  accessibilityLabel="Add reader"
                >
                  <Plus size={22} color={colors.cocoa} />
                  <Text
                    style={[styles.addCardText, { fontSize: font.caption }]}
                    maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                  >
                    Add Reader
                  </Text>
                </TouchableOpacity>
              ) : null}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Cpu size={18} color={colors.cocoa} />
              <Text
                style={[styles.sectionTitle, { fontSize: font.subtitle }]}
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
              >
                Recommendation Engine
              </Text>
            </View>
            <Text
              style={[styles.sectionDesc, { fontSize: font.caption }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Choose how Kona curates 20 age-appropriate books per request.
            </Text>

            <ProviderOption
              selected={settings.provider === 'mock'}
              name="Kona Curated Educator Library"
              badge="Built-in • No API Key Needed"
              sub="Fast, reliable, pre-vetted catalog across ages 10-17 with Google Books cover enrichment."
              onPress={() => setSettings({ ...settings, provider: 'mock' })}
            />
            <ProviderOption
              selected={settings.provider === 'gemini'}
              name="Google Gemini AI (2.5 Flash)"
              badge="Requires Gemini API Key"
              sub="Unlimited creative breadth, nuanced sub-genre tailoring, and live educator reasoning."
              onPress={() => setSettings({ ...settings, provider: 'gemini' })}
            />
            <ProviderOption
              selected={settings.provider === 'openai'}
              name="OpenAI (GPT-4o-mini)"
              badge="Requires OpenAI API Key"
              sub="Rigorous literary analysis and structured age suitability classification."
              onPress={() => setSettings({ ...settings, provider: 'openai' })}
            />
          </View>

          {settings.provider !== 'mock' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Key size={18} color={colors.cocoa} />
                <Text
                  style={[styles.sectionTitle, { fontSize: font.subtitle }]}
                  maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                >
                  API Credentials
                </Text>
              </View>

              {settings.provider === 'gemini' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Google Gemini API Key</Text>
                  <View style={styles.keyInputWrap}>
                    <TextInput
                      style={styles.keyInput}
                      value={settings.geminiApiKey}
                      onChangeText={(t) => setSettings({ ...settings, geminiApiKey: t })}
                      placeholder="AIzaSy..."
                      placeholderTextColor={colors.dusty}
                      secureTextEntry={!showGeminiKey}
                      autoCapitalize="none"
                      autoCorrect={false}
                      accessibilityLabel="Gemini API key"
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowGeminiKey(!showGeminiKey)}
                      accessibilityRole="button"
                      accessibilityLabel={showGeminiKey ? 'Hide Gemini key' : 'Show Gemini key'}
                    >
                      {showGeminiKey ? (
                        <EyeOff size={18} color={colors.dusty} />
                      ) : (
                        <Eye size={18} color={colors.dusty} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {settings.provider === 'openai' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>OpenAI API Key</Text>
                  <View style={styles.keyInputWrap}>
                    <TextInput
                      style={styles.keyInput}
                      value={settings.openaiApiKey}
                      onChangeText={(t) => setSettings({ ...settings, openaiApiKey: t })}
                      placeholder="sk-proj-..."
                      placeholderTextColor={colors.dusty}
                      secureTextEntry={!showOpenAiKey}
                      autoCapitalize="none"
                      autoCorrect={false}
                      accessibilityLabel="OpenAI API key"
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowOpenAiKey(!showOpenAiKey)}
                      accessibilityRole="button"
                      accessibilityLabel={showOpenAiKey ? 'Hide OpenAI key' : 'Show OpenAI key'}
                    >
                      {showOpenAiKey ? (
                        <EyeOff size={18} color={colors.dusty} />
                      ) : (
                        <Eye size={18} color={colors.dusty} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestConnection}
                disabled={testingConnection}
                accessibilityRole="button"
                accessibilityLabel="Test connection"
              >
                {testingConnection ? (
                  <ActivityIndicator size="small" color={colors.cocoa} />
                ) : (
                  <Text style={styles.testBtnText}>Test Connection</Text>
                )}
              </TouchableOpacity>

              {testResult && (
                <View
                  style={[
                    styles.testResultBox,
                    testResult.success ? styles.testSuccess : styles.testError,
                  ]}
                >
                  <Text
                    style={[
                      styles.testResultText,
                      testResult.success ? styles.testSuccessText : styles.testErrorText,
                    ]}
                  >
                    {testResult.message}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={18} color={colors.sage} />
              <Text
                style={[styles.sectionTitle, { fontSize: font.subtitle }]}
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
              >
                Age Rubrics
              </Text>
            </View>
            <Text
              style={[styles.sectionDesc, { fontSize: font.caption }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Tap each age to see how Kona benchmarks reading complexity, violence limits, language, romance, and sensitive themes.
            </Text>

            {Object.keys(AGE_PROFILES).map((ageStr) => {
              const ageNum = parseInt(ageStr, 10);
              const p = AGE_PROFILES[ageNum];
              const isExp = expandedAge === ageNum;

              return (
                <TouchableOpacity
                  key={ageNum}
                  style={styles.rubricAccordion}
                  activeOpacity={0.7}
                  onPress={() => setExpandedAge(isExp ? null : ageNum)}
                  accessibilityRole="button"
                  accessibilityLabel={`Age ${ageNum} rubric`}
                  accessibilityState={{ expanded: isExp }}
                >
                  <View style={styles.rubricTop}>
                    <View style={styles.rubricTitleGroup}>
                      <View style={styles.rubricPill}>
                        <Text style={styles.rubricPillText}>Age {ageNum}</Text>
                      </View>
                      <Text style={styles.rubricGrade}>{p.grade}</Text>
                    </View>
                    {isExp ? (
                      <ChevronUp size={18} color={colors.dusty} />
                    ) : (
                      <ChevronDown size={18} color={colors.dusty} />
                    )}
                  </View>

                  {isExp && (
                    <View style={styles.rubricDetails}>
                      <Text style={styles.rubricLexile}>
                        Lexile Band: <Text style={styles.bold}>{p.lexileRange}</Text>
                      </Text>
                      <Text style={styles.rubricLimits}>
                        Limits: Violence ≤ {p.maxRecommendedViolence} | Language ≤ {p.maxRecommendedLanguage} | Romance ≤ {p.maxRecommendedRomance} | Themes ≤ {p.maxRecommendedThemes}
                      </Text>
                      <Text style={styles.rubricGuidelines}>{p.guidelines}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { fontSize: font.subtitle, marginLeft: 0 }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Data & Privacy
            </Text>
            <TouchableOpacity
              style={styles.dangerBtn}
              onPress={handleClearHistory}
              accessibilityRole="button"
              accessibilityLabel="Clear search history"
            >
              <Trash2 size={16} color={colors.rosewood} />
              <Text style={styles.dangerBtnText}>Clear Search History</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>Kona 1.1.0 · On-device only</Text>
          </View>

          <TouchableOpacity
            style={styles.saveBtnFull}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save settings"
          >
            <Save size={18} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnFullText}>Save Settings</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={editor !== null} transparent animationType="fade" onRequestClose={() => setEditor(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editor?.mode === 'edit' ? 'Edit Reader' : 'Add Reader'}
            </Text>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
              placeholderTextColor={colors.dusty}
              maxLength={20}
              accessibilityLabel="Reader name"
            />
            <Text style={styles.inputLabel}>Age</Text>
            <View style={styles.ageRow}>
              {AGES.map((age) => {
                const selected = editAge === age;
                return (
                  <TouchableOpacity
                    key={age}
                    style={[styles.ageChip, selected && styles.ageChipOn]}
                    onPress={() => setEditAge(age)}
                    accessibilityRole="button"
                    accessibilityLabel={`Age ${age}`}
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.ageChipText, selected && styles.ageChipTextOn]}>{age}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.modalSave} onPress={saveEditor} accessibilityRole="button" accessibilityLabel="Save reader">
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
            {editor?.mode === 'edit' ? (
              <TouchableOpacity
                style={styles.modalDelete}
                onPress={() => confirmDelete(editor.profile)}
                accessibilityRole="button"
                accessibilityLabel="Delete reader"
              >
                <Text style={styles.modalDeleteText}>Delete Reader</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={() => setEditor(null)} accessibilityRole="button" accessibilityLabel="Cancel">
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

function ProviderOption({
  selected,
  name,
  badge,
  sub,
  onPress,
}: {
  selected: boolean;
  name: string;
  badge: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.providerCard, selected && styles.providerCardActive]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={name}
    >
      <View style={styles.radioRow}>
        <View style={[styles.radio, selected && styles.radioActive]} />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{name}</Text>
          <Text style={styles.providerBadge}>{badge}</Text>
          <Text style={styles.providerSub}>{sub}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
  saveIconButton: {
    minWidth: HIT_TARGET,
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.espresso,
    marginLeft: 6,
  },
  sectionDesc: {
    color: colors.dusty,
    marginBottom: 12,
    marginTop: 2,
  },
  profileCard: {
    width: 110,
    backgroundColor: colors.parchment,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginRight: spacing.sm,
    alignItems: 'center',
    minHeight: 132,
  },
  profileCardActive: {
    backgroundColor: colors.linen,
    borderWidth: 1.5,
    borderColor: colors.honey,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  initial: {
    color: colors.white,
    fontWeight: '700',
  },
  profileName: {
    fontWeight: '700',
    color: colors.espresso,
  },
  profileAge: {
    color: colors.dusty,
    marginBottom: 4,
  },
  editMini: {
    marginTop: 4,
    minHeight: 28,
    justifyContent: 'center',
  },
  editMiniText: {
    color: colors.cocoa,
    fontWeight: '600',
    fontSize: 11,
  },
  addCard: {
    width: 110,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.cocoa,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 132,
  },
  addCardText: {
    color: colors.cocoa,
    fontWeight: '600',
    marginTop: 6,
  },
  providerCard: {
    backgroundColor: colors.linen,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 10,
    ...elevation.low,
  },
  providerCardActive: {
    borderWidth: 1.5,
    borderColor: colors.honey,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.dusty,
    marginTop: 2,
    marginRight: 10,
  },
  radioActive: {
    borderColor: colors.honey,
    borderWidth: 6,
    backgroundColor: colors.linen,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.espresso,
  },
  providerBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.honey,
    marginVertical: 2,
  },
  providerSub: {
    fontSize: 11,
    color: colors.dusty,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.espresso,
    marginBottom: 6,
  },
  keyInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.linen,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    ...elevation.low,
  },
  keyInput: {
    flex: 1,
    height: HIT_TARGET,
    fontSize: 13,
    color: colors.espresso,
  },
  eyeBtn: {
    minWidth: HIT_TARGET,
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testBtn: {
    backgroundColor: colors.parchment,
    borderRadius: radii.md,
    minHeight: HIT_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cocoa,
  },
  testResultBox: {
    marginTop: 10,
    borderRadius: 8,
    padding: 10,
  },
  testSuccess: {
    backgroundColor: '#EEF6F1',
  },
  testError: {
    backgroundColor: '#F8E8E4',
  },
  testResultText: {
    fontSize: 12,
    lineHeight: 16,
  },
  testSuccessText: {
    color: colors.sage,
  },
  testErrorText: {
    color: colors.rosewood,
  },
  rubricAccordion: {
    backgroundColor: colors.linen,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 8,
    ...elevation.low,
  },
  rubricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 32,
  },
  rubricTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rubricPill: {
    backgroundColor: colors.parchment,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  rubricPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.cocoa,
  },
  rubricGrade: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.espresso,
    flex: 1,
  },
  rubricDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.parchment,
  },
  rubricLexile: {
    fontSize: 12,
    color: colors.dusty,
    marginBottom: 2,
  },
  bold: {
    fontWeight: '700',
    color: colors.espresso,
  },
  rubricLimits: {
    fontSize: 11,
    color: colors.dusty,
    marginBottom: 6,
  },
  rubricGuidelines: {
    fontSize: 11,
    color: colors.espresso,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8E8E4',
    borderRadius: radii.md,
    minHeight: HIT_TARGET,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  dangerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.rosewood,
    marginLeft: 8,
  },
  versionText: {
    marginTop: spacing.sm,
    color: colors.dusty,
    fontSize: 11,
  },
  saveBtnFull: {
    backgroundColor: colors.cocoa,
    borderRadius: radii.md,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.medium,
    marginTop: 10,
  },
  saveBtnFullText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(59,47,47,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.linen,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...elevation.high,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.espresso,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.parchment,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: HIT_TARGET,
    color: colors.espresso,
    marginBottom: spacing.md,
  },
  ageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  ageChip: {
    minWidth: HIT_TARGET,
    minHeight: HIT_TARGET,
    borderRadius: radii.md,
    backgroundColor: colors.parchment,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  ageChipOn: {
    backgroundColor: colors.honey,
  },
  ageChipText: {
    color: colors.dusty,
    fontWeight: '700',
  },
  ageChipTextOn: {
    color: colors.espresso,
  },
  modalSave: {
    backgroundColor: colors.cocoa,
    borderRadius: radii.md,
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalSaveText: {
    color: colors.white,
    fontWeight: '700',
  },
  modalDelete: {
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteText: {
    color: colors.rosewood,
    fontWeight: '700',
  },
  modalCancel: {
    textAlign: 'center',
    color: colors.dusty,
    marginTop: spacing.sm,
  },
});
