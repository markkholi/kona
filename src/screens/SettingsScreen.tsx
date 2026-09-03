import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  EyeOff,
  Key,
  Save,
  Shield,
  Trash2,
} from 'lucide-react-native';
import { AGE_PROFILES } from '../constants/ageRubric';
import {
  clearRecentSearches,
  getApiSettings,
  saveApiSettings,
} from '../services/storage';
import { ApiSettings } from '../types/book';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [settings, setSettings] = useState<ApiSettings>({
    provider: 'mock',
    geminiApiKey: '',
    openaiApiKey: '',
  });

  const [showGeminiKey, setShowGeminiKey] = useState<boolean>(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [expandedAge, setExpandedAge] = useState<number | null>(null);

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
      setTestResult({
        success: false,
        message: 'Please paste your Google Gemini API key first.',
      });
      return;
    }

    if (settings.provider === 'openai' && !settings.openaiApiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Please paste your OpenAI API key first.',
      });
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
          setTestResult({
            success: true,
            message: 'Connected to Gemini API successfully!',
          });
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
          setTestResult({
            success: true,
            message: 'Connected to OpenAI API successfully!',
          });
        } else {
          const err = await resp.text();
          setTestResult({
            success: false,
            message: `OpenAI Error (${resp.status}): ${err.substring(0, 100)}`,
          });
        }
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Network connection failed.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Search History',
      'Are you sure you want to clear your recent searches?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearRecentSearches();
            Alert.alert('Cleared', 'Search history cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Settings & Configuration</Text>
        <TouchableOpacity style={styles.saveIconButton} onPress={handleSave}>
          <Save size={20} color="#4F46E5" />
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
          {/* Provider Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Cpu size={18} color="#4F46E5" />
              <Text style={styles.sectionTitle}>Recommendation Engine Provider</Text>
            </View>
            <Text style={styles.sectionDesc}>
              Choose how Kona curates 20 age-appropriate books per request.
            </Text>

            {/* Provider Option: Mock / Curated */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.providerCard,
                settings.provider === 'mock' && styles.providerCardActive,
              ]}
              onPress={() => setSettings({ ...settings, provider: 'mock' })}
            >
              <View style={styles.radioRow}>
                <View style={[styles.radio, settings.provider === 'mock' && styles.radioActive]} />
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>Kona Curated Educator Library</Text>
                  <Text style={styles.providerBadge}>Built-in • No API Key Needed</Text>
                  <Text style={styles.providerSub}>
                    Fast, reliable, pre-vetted catalog across ages 10-17 with Google Books cover enrichment.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Provider Option: Gemini */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.providerCard,
                settings.provider === 'gemini' && styles.providerCardActive,
              ]}
              onPress={() => setSettings({ ...settings, provider: 'gemini' })}
            >
              <View style={styles.radioRow}>
                <View style={[styles.radio, settings.provider === 'gemini' && styles.radioActive]} />
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>Google Gemini AI (2.5 Flash)</Text>
                  <Text style={styles.providerBadge}>Requires Gemini API Key</Text>
                  <Text style={styles.providerSub}>
                    Unlimited creative breadth, nuanced sub-genre tailoring, and live educator reasoning.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Provider Option: OpenAI */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.providerCard,
                settings.provider === 'openai' && styles.providerCardActive,
              ]}
              onPress={() => setSettings({ ...settings, provider: 'openai' })}
            >
              <View style={styles.radioRow}>
                <View style={[styles.radio, settings.provider === 'openai' && styles.radioActive]} />
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>OpenAI (GPT-4o-mini)</Text>
                  <Text style={styles.providerBadge}>Requires OpenAI API Key</Text>
                  <Text style={styles.providerSub}>
                    Rigorous literary analysis and structured age suitability classification.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* API Key Inputs */}
          {settings.provider !== 'mock' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Key size={18} color="#4F46E5" />
                <Text style={styles.sectionTitle}>API Credentials</Text>
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
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showGeminiKey}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowGeminiKey(!showGeminiKey)}
                    >
                      {showGeminiKey ? (
                        <EyeOff size={18} color="#64748B" />
                      ) : (
                        <Eye size={18} color="#64748B" />
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
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showOpenAiKey}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowOpenAiKey(!showOpenAiKey)}
                    >
                      {showOpenAiKey ? (
                        <EyeOff size={18} color="#64748B" />
                      ) : (
                        <Eye size={18} color="#64748B" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Test Connection Button */}
              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestConnection}
                disabled={testingConnection}
              >
                {testingConnection ? (
                  <ActivityIndicator size="small" color="#4F46E5" />
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

          {/* Age Appropriateness Rubric Reference */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={18} color="#10B981" />
              <Text style={styles.sectionTitle}>Developmental Age Rubrics (10–17)</Text>
            </View>
            <Text style={styles.sectionDesc}>
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
                >
                  <View style={styles.rubricTop}>
                    <View style={styles.rubricTitleGroup}>
                      <View style={styles.rubricPill}>
                        <Text style={styles.rubricPillText}>Age {ageNum}</Text>
                      </View>
                      <Text style={styles.rubricGrade}>{p.grade}</Text>
                    </View>
                    {isExp ? (
                      <ChevronUp size={18} color="#64748B" />
                    ) : (
                      <ChevronDown size={18} color="#64748B" />
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

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleClearHistory}>
              <Trash2 size={16} color="#DC2626" />
              <Text style={styles.dangerBtnText}>Clear Search History</Text>
            </TouchableOpacity>
          </View>

          {/* Save Action */}
          <TouchableOpacity style={styles.saveBtnFull} onPress={handleSave}>
            <Save size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveBtnFullText}>Save Settings</Text>
          </TouchableOpacity>
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
  saveIconButton: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 6,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    marginTop: 2,
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  providerCardActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#F5F3FF',
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
    borderColor: '#CBD5E1',
    marginTop: 2,
    marginRight: 10,
  },
  radioActive: {
    borderColor: '#4F46E5',
    borderWidth: 6,
    backgroundColor: '#FFFFFF',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  providerBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    marginVertical: 2,
  },
  providerSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  keyInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  keyInput: {
    flex: 1,
    height: 44,
    fontSize: 13,
    color: '#0F172A',
  },
  eyeBtn: {
    padding: 6,
  },
  testBtn: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  testResultBox: {
    marginTop: 10,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
  testSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  testError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  testResultText: {
    fontSize: 12,
    lineHeight: 16,
  },
  testSuccessText: {
    color: '#065F46',
  },
  testErrorText: {
    color: '#B91C1C',
  },
  rubricAccordion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  rubricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rubricTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rubricPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  rubricPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  rubricGrade: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  rubricDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rubricLexile: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 2,
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  rubricLimits: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  rubricGuidelines: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  dangerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
  },
  saveBtnFull: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 10,
  },
  saveBtnFullText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
