import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShieldCheck, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Info } from 'lucide-react-native';
import { AGE_PROFILES, getMaturityColor, isAgeAppropriate } from '../constants/ageRubric';
import { BookRecommendation } from '../types/book';
import { colors, elevation, HIT_TARGET, radii, spacing } from '../theme/tokens';
import { useScaledFont } from '../theme/useScaledFont';

interface AgeAuditCardProps {
  book: BookRecommendation;
  targetAge: number;
  collapsible?: boolean;
}

export const AgeAuditCard: React.FC<AgeAuditCardProps> = ({
  book,
  targetAge,
  collapsible = false,
}) => {
  const [expanded, setExpanded] = useState(!collapsible);
  const font = useScaledFont();
  const profile = AGE_PROFILES[targetAge] || AGE_PROFILES[14];
  const audit = isAgeAppropriate(targetAge, book.maturityScores);

  const renderMaturityBar = (label: string, current: string, maxAllowed: string) => {
    const color = getMaturityColor(current);
    return (
      <View style={styles.metricRow} key={label}>
        <View style={styles.metricLabelCol}>
          <Text
            style={[styles.metricLabel, { fontSize: font.caption }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            {label}
          </Text>
          <Text
            style={[styles.metricLimit, { fontSize: font.micro }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            Max for age: {maxAllowed}
          </Text>
        </View>
        <View style={[styles.metricPill, { backgroundColor: `${color}15`, borderColor: color }]}>
          <Text style={[styles.metricValue, { color }]}>{current}</Text>
        </View>
      </View>
    );
  };

  if (collapsible && !expanded) {
    return (
      <TouchableOpacity
        style={styles.pill}
        onPress={() => setExpanded(true)}
        accessibilityRole="button"
        accessibilityLabel={
          audit.isAppropriate
            ? `Verified for age ${targetAge}. Expand age audit.`
            : `Content advisory for age ${targetAge}. Expand age audit.`
        }
        accessibilityState={{ expanded: false }}
      >
        {audit.isAppropriate ? (
          <CheckCircle size={16} color={colors.white} />
        ) : (
          <AlertTriangle size={16} color={colors.white} />
        )}
        <Text
          style={[styles.pillText, { fontSize: font.caption }]}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          {audit.isAppropriate
            ? `Verified for Age ${targetAge}`
            : `Content advisory · Age ${targetAge}`}
        </Text>
        <ChevronDown size={16} color={colors.white} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <ShieldCheck size={22} color={colors.sage} />
          <Text
            style={[styles.headerTitle, { fontSize: font.subtitle }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            Age-Appropriateness Audit
          </Text>
        </View>
        {collapsible ? (
          <TouchableOpacity
            onPress={() => setExpanded(false)}
            accessibilityRole="button"
            accessibilityLabel="Collapse age audit"
            accessibilityState={{ expanded: true }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.collapseBtn}
          >
            <ChevronUp size={18} color={colors.dusty} />
          </TouchableOpacity>
        ) : (
          <View style={styles.statusBadge}>
            {audit.isAppropriate ? (
              <View style={styles.verifiedRow}>
                <CheckCircle size={14} color={colors.sage} />
                <Text style={styles.verifiedText}>Approved for Age {targetAge}</Text>
              </View>
            ) : (
              <View style={styles.advisoryRow}>
                <AlertTriangle size={14} color="#D97706" />
                <Text style={styles.advisoryText}>Content Advisory</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.rangeSection}>
        <View style={styles.rangeHeader}>
          <Text
            style={[styles.rangeTitle, { fontSize: font.caption }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            Recommended Reader Range
          </Text>
          <Text
            style={[styles.rangeValue, { fontSize: font.body }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
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

      <View style={styles.matrixSection}>
        <Text
          style={[styles.sectionSubtitle, { fontSize: font.body }]}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          Maturity & Content Safety Matrix
        </Text>
        {renderMaturityBar('Violence & Peril', book.maturityScores.violence, profile.maxRecommendedViolence)}
        {renderMaturityBar('Language & Slang', book.maturityScores.language, profile.maxRecommendedLanguage)}
        {renderMaturityBar('Romance & Intimacy', book.maturityScores.romance, profile.maxRecommendedRomance)}
        {renderMaturityBar('Dark & Sensitive Themes', book.maturityScores.themes, profile.maxRecommendedThemes)}
      </View>

      <View style={styles.statementSection}>
        <View style={styles.statementHeader}>
          <Info size={16} color={colors.cocoa} />
          <Text
            style={[styles.statementTitle, { fontSize: font.caption }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            Educator Validation Rationale
          </Text>
        </View>
        <Text
          style={[styles.statementText, { fontSize: font.caption }]}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          {book.whyAppropriate}
        </Text>
      </View>

      <View style={styles.warningsSection}>
        <Text
          style={[styles.sectionSubtitle, { fontSize: font.body }]}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          Content Heads-Up for Parents & Educators
        </Text>
        {book.contentWarnings && book.contentWarnings.length > 0 ? (
          book.contentWarnings.map((warning, idx) => (
            <View key={idx} style={styles.warningItem}>
              <View style={styles.warningBullet} />
              <Text
                style={[styles.warningText, { fontSize: font.caption }]}
                maxFontSizeMultiplier={font.maxFontSizeMultiplier}
              >
                {warning}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.cleanBadge}>
            <CheckCircle size={14} color={colors.sage} />
            <Text
              style={[styles.cleanText, { fontSize: font.caption }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              No sensitive content or triggers flagged for {profile.grade} readers.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.levelRow}>
        <Text
          style={[styles.levelLabel, { fontSize: font.caption }]}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          Reading Level / Lexile:
        </Text>
        <Text
          style={[styles.levelValue, { fontSize: font.caption }]}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          {book.readingLevel}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sage,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    minHeight: HIT_TARGET,
    marginVertical: spacing.sm,
  },
  pillText: {
    color: colors.white,
    fontWeight: '700',
    flex: 1,
    marginLeft: spacing.sm,
  },
  container: {
    backgroundColor: colors.linen,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...elevation.low,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
    paddingBottom: 12,
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  headerTitle: {
    fontWeight: '700',
    color: colors.espresso,
    marginLeft: 8,
    flex: 1,
  },
  collapseBtn: {
    minWidth: HIT_TARGET,
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    alignItems: 'flex-end',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF6F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.sage,
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
    backgroundColor: colors.parchment,
    borderRadius: radii.md,
    padding: 12,
  },
  rangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rangeTitle: {
    color: colors.dusty,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  rangeValue: {
    color: colors.espresso,
    fontWeight: '700',
  },
  gaugeContainer: {
    marginTop: 4,
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: colors.parchment,
    borderRadius: 4,
    position: 'relative',
  },
  gaugeFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.honey,
    borderRadius: 4,
  },
  gaugePin: {
    position: 'absolute',
    top: -5,
    marginLeft: -18,
    alignItems: 'center',
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.cocoa,
    borderWidth: 2,
    borderColor: colors.white,
  },
  pinText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.cocoa,
    marginTop: 4,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  gaugeEndLabel: {
    fontSize: 10,
    color: colors.dusty,
  },
  matrixSection: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontWeight: '700',
    color: colors.espresso,
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
  },
  metricLabelCol: {
    flex: 1,
  },
  metricLabel: {
    fontWeight: '600',
    color: colors.espresso,
  },
  metricLimit: {
    color: colors.dusty,
    marginTop: 2,
    fontWeight: '500',
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
    backgroundColor: colors.parchment,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.honey,
  },
  statementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statementTitle: {
    fontWeight: '700',
    color: colors.cocoa,
    marginLeft: 6,
  },
  statementText: {
    color: colors.espresso,
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
    backgroundColor: colors.honey,
    marginRight: 8,
  },
  warningText: {
    color: colors.dusty,
    flex: 1,
  },
  cleanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF6F1',
    padding: 8,
    borderRadius: 6,
  },
  cleanText: {
    color: colors.sage,
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.parchment,
  },
  levelLabel: {
    color: colors.dusty,
    fontWeight: '500',
  },
  levelValue: {
    fontWeight: '700',
    color: colors.espresso,
  },
});
