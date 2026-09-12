import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfiles } from '../context/ProfileContext';
import { DiscoverStackParamList, TabParamList } from '../types/navigation';
import { colors, HIT_TARGET, radii, spacing } from '../theme/tokens';
import { useScaledFont } from '../theme/useScaledFont';
import { getAvatarColor, ProfileSwitcher } from './ProfileSwitcher';

type PillNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<DiscoverStackParamList>,
  BottomTabNavigationProp<TabParamList>
>;

export const ProfilePill: React.FC = () => {
  const { activeProfile } = useProfiles();
  const font = useScaledFont();
  const navigation = useNavigation<PillNavigation>();
  const [open, setOpen] = React.useState(false);

  if (!activeProfile) return null;

  const initial = (activeProfile.name.trim()[0] || 'R').toUpperCase();
  const greeting =
    activeProfile.name.toLowerCase() === 'reader' ||
    activeProfile.name.toLowerCase() === 'default reader'
      ? 'Hi, Reader!'
      : `Hi, ${activeProfile.name}!`;

  return (
    <>
      <TouchableOpacity
        style={styles.pill}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Active reader ${activeProfile.name}, age ${activeProfile.age}. Open profile switcher.`}
      >
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(activeProfile.avatarIndex) }]}>
          <Text
            style={[styles.initial, { fontSize: font.caption }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            {initial}
          </Text>
        </View>
        <Text
          style={[styles.greeting, { fontSize: font.body }]}
          numberOfLines={1}
          maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        >
          {greeting}
        </Text>
        <View style={styles.ageBadge}>
          <Text
            style={[styles.ageText, { fontSize: font.micro }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            {activeProfile.age}
          </Text>
        </View>
      </TouchableOpacity>
      <ProfileSwitcher
        visible={open}
        onClose={() => setOpen(false)}
        onEditProfiles={() => {
          setOpen(false);
          navigation.navigate('SettingsTab');
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.parchment,
    borderRadius: radii.xl,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    minHeight: HIT_TARGET,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  initial: {
    color: colors.white,
    fontWeight: '700',
  },
  greeting: {
    color: colors.espresso,
    fontWeight: '600',
    marginRight: spacing.sm,
    maxWidth: 180,
  },
  ageBadge: {
    backgroundColor: colors.linen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.xl,
    minWidth: 28,
    alignItems: 'center',
  },
  ageText: {
    color: colors.cocoa,
    fontWeight: '700',
  },
});
