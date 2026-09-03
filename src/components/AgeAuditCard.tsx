import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import { AGE_PROFILES, getMaturityColor, isAgeAppropriate } from '../constants/ageRubric';
import { BookRecommendation } from '../types/book';

interface AgeAuditCardProps {
  book: BookRecommendation;
  targetAge: number;
}

export const AgeAuditCard: React.FC<AgeAuditCardProps> = ({ book, targetAge }) => {
  const profile = AGE_PROFILES[targetAge] || AGE_PROFILES[14];
  const audit = isAgeAppropriate(targetAge, book.maturityScores);

  const renderMaturityBar = (
    label: string,
    current: string,
    maxAllowed: string
  ) => {
    const color = getMaturityColor(current);
    return (
      <View style={styles.metricRow} key={label}>
        <View style={styles.metricLabelCol}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={styles.metricLimit}>Max for age: {maxAllowed}</Text>
        </View>
        <View style={[styles.metricPill, { backgroundColor: `${color}15`, borderColor: color }]}>
          <Text style={[styles.metricValue, { color }]}>{current}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <ShieldCheck size={22} color="#10B981" />
          <Text style={styles.headerTitle}>Age-Appropriateness Audit</Text>
        </View>
        <View style={styles.statusBadge}>
          {audit.isAppropriate ? (
            <View style={styles.verifiedRow}>
              <CheckCircle size={14} color="#059669" />
              <Text style={styles.verifiedText}>Approved for Age {targetAge}</Text>
            </View>
          ) : (
            <View style={styles.advisoryRow}>
              <AlertTriangle size={14} color="#D97706" />
              <Text style={styles.advisoryText}>Content Advisory</Text>
            </View>
          )}
        </View>
      </View>

      {/* Target Age Fit Bar */}
      <View style={styles.rangeSection}>
        <View style={styles.rangeHeader}>
          <Text style={styles.rangeTitle}>Recommended Reader Range</Text>
          <Text style={styles.rangeValue}>
            Ages {book.recommendedAgeMin} – {book.recommendedAgeMax}
          </Text>
        </View>
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeTrack}>
            <View
              style={[
                styles.gaugeFill,
                {
                  left: `${Math.max(0, ((book.recommendedAgeMin - 10) / 7) * 100)}%`,
                  right: `${Math.max(0, ((17 - book.recommendedAgeMax) / 7) * 100)}%`,
                },
              ]}
            />
            {/* Target Age Pin */}
            <View
              style={[
                styles.gaugePin,
                {
                  left: `${Math.min(94, Math.max(6, ((targetAge - 10) / 7) * 100))}%`,
                },
              ]}
            >
              <View style={styles.pinDot} />
              <Text style={styles.pinText}>Age {targetAge}</Text>
            </View>
          </View>
          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeEndLabel}>Age 10</Text>
            <Text style={styles.gaugeEndLabel}>Age 17</Text>
          </View>
        </View>
      </View>

      {/* 4-Factor Content Safety Matrix */}
      <View style={styles.matrixSection}>
        <Text style={styles.sectionSubtitle}>Maturity & Content Safety Matrix</Text>
        {renderMaturityBar('Violence & Peril', book.maturityScores.violence, profile.maxRecommendedViolence)}
        {renderMaturityBar('Language & Slang', book.maturityScores.language, profile.maxRecommendedLanguage)}
        {renderMaturityBar('Romance & Intimacy', book.maturityScores.romance, profile.maxRecommendedRomance)}
        {renderMaturityBar('Dark & Sensitive Themes', book.maturityScores.themes, profile.maxRecommendedThemes)}
      </View>

      {/* Educator Validation Statement */}
      <View style={styles.statementSection}>
        <View style={styles.statementHeader}>
          <Info size={16} color="#4F46E5" />
          <Text style={styles.statementTitle}>Educator Validation Rationale</Text>
        </View>
        <Text style={styles.statementText}>{book.whyAppropriate}</Text>
      </View>

      {/* Content Heads-Up / Warnings */}
      <View style={styles.warningsSection}>
        <Text style={styles.sectionSubtitle}>Content Heads-Up for Parents & Educators</Text>
        {book.contentWarnings && book.contentWarnings.length > 0 ? (
          book.contentWarnings.map((warning, idx) => (
            <View key={idx} style={styles.warningItem}>
              <View style={styles.warningBullet} />
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          ))
        ) : (
          <View style={styles.cleanBadge}>
            <CheckCircle size={14} color="#059669" />
            <Text style={styles.cleanText}>
              No sensitive content or triggers flagged for {profile.grade} readers.
            </Text>
          </View>
        )}
      </View>

      {/* Reading Complexity & Lexile */}
      <View style={styles.levelRow}>
        <Text style={styles.levelLabel}>Reading Level / Lexile:</Text>
        <Text style={styles.levelValue}>{book.readingLevel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  statusBadge: {
    alignItems: 'flex-end',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 4,
  },
  advisoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  advisoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 4,
  },
  rangeSection: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
  },
  rangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rangeTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  rangeValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  gaugeContainer: {
    marginTop: 4,
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    position: 'relative',
  },
  gaugeFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#818CF8',
    borderRadius: 4,
  },
  gaugePin: {
    position: 'absolute',
    top: -6,
    marginLeft: -18,
    alignItems: 'center',
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 2,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  gaugeEndLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  matrixSection: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  metricLabelCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  metricLimit: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  metricPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  statementSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  statementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statementTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginLeft: 6,
  },
  statementText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  warningsSection: {
    marginBottom: 12,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  warningBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#475569',
  },
  cleanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },
  cleanText: {
    fontSize: 12,
    color: '#065F46',
    marginLeft: 6,
    fontWeight: '500',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  levelLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  levelValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});
