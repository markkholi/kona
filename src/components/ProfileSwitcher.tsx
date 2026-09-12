import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Check, Pencil, Plus, Users } from 'lucide-react-native';
import { useProfiles } from '../context/ProfileContext';
import { MAX_PROFILES } from '../types/profile';
import { colors, HIT_TARGET, radii, spacing } from '../theme/tokens';
import { useScaledFont } from '../theme/useScaledFont';
import { JACKET_PALETTES } from '../constants/bookCovers';

export function getAvatarColor(avatarIndex: number): string {
  const palette = JACKET_PALETTES[avatarIndex % JACKET_PALETTES.length];
  return palette.spine;
}

const AGES = [10, 11, 12, 13, 14, 15, 16, 17];

interface ProfileSwitcherProps {
  visible: boolean;
  onClose: () => void;
  onEditProfiles?: () => void;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  visible,
  onClose,
  onEditProfiles,
}) => {
  const { profiles, activeProfile, switchProfile, addProfile } = useProfiles();
  const font = useScaledFont();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['55%', '80%'], []);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(12);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
      setAdding(false);
      setNewName('');
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const handleSelect = async (id: string) => {
    await switchProfile(id);
    onClose();
  };

  const handleAdd = async () => {
    const created = await addProfile(newName, newAge);
    if (created) {
      setAdding(false);
      setNewName('');
      onClose();
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Users size={18} color={colors.cocoa} />
          <Text
            style={[styles.title, { fontSize: font.subtitle }]}
            maxFontSizeMultiplier={font.maxFontSizeMultiplier}
          >
            Switch Reader
          </Text>
        </View>

        {profiles.map((profile) => {
          const isActive = profile.id === activeProfile?.id;
          const initial = (profile.name.trim()[0] || 'R').toUpperCase();
          return (
            <TouchableOpacity
              key={profile.id}
              style={[styles.row, isActive && styles.rowActive]}
              onPress={() => handleSelect(profile.id)}
              accessibilityRole="button"
              accessibilityLabel={`${profile.name}, age ${profile.age}${isActive ? ', currently selected' : ''}`}
              accessibilityState={{ selected: isActive }}
            >
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(profile.avatarIndex) }]}>
                <Text style={styles.initial}>{initial}</Text>
              </View>
              <View style={styles.rowText}>
                <Text
                  style={[styles.name, { fontSize: font.body }]}
                  maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                >
                  {profile.name}
                </Text>
                <Text
                  style={[styles.age, { fontSize: font.caption }]}
                  maxFontSizeMultiplier={font.maxFontSizeMultiplier}
                >
                  Age {profile.age}
                </Text>
              </View>
              {isActive ? <Check size={18} color={colors.honey} /> : null}
            </TouchableOpacity>
          );
        })}

        {adding ? (
          <View style={styles.addForm}>
            <Text
              style={[styles.formLabel, { fontSize: font.caption }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              New reader name
            </Text>
            <BottomSheetTextInput
              style={[styles.input, { fontSize: font.body }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Emma"
              placeholderTextColor={colors.dusty}
              maxLength={20}
              accessibilityLabel="Reader name"
            />
            <Text
              style={[styles.formLabel, { fontSize: font.caption }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Age
            </Text>
            <View style={styles.ageRow}>
              {AGES.map((age) => {
                const selected = newAge === age;
                return (
                  <TouchableOpacity
                    key={age}
                    style={[styles.ageChip, selected && styles.ageChipOn]}
                    onPress={() => setNewAge(age)}
                    accessibilityRole="button"
                    accessibilityLabel={`Age ${age}`}
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.ageChipText, selected && styles.ageChipTextOn]}>{age}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.addSave}
              onPress={handleAdd}
              accessibilityRole="button"
              accessibilityLabel="Save new reader"
            >
              <Text style={styles.addSaveText}>Save Reader</Text>
            </TouchableOpacity>
          </View>
        ) : profiles.length < MAX_PROFILES ? (
          <TouchableOpacity
            style={styles.addRow}
            onPress={() => setAdding(true)}
            accessibilityRole="button"
            accessibilityLabel="Add reader"
          >
            <View style={styles.addIcon}>
              <Plus size={18} color={colors.cocoa} />
            </View>
            <Text
              style={[styles.addLabel, { fontSize: font.body }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Add Reader
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.limitHint}>Maximum of {MAX_PROFILES} readers reached.</Text>
        )}

        {onEditProfiles ? (
          <TouchableOpacity
            style={styles.editLink}
            onPress={onEditProfiles}
            accessibilityRole="button"
            accessibilityLabel="Edit profiles in Settings"
          >
            <Pencil size={16} color={colors.cocoa} />
            <Text
              style={[styles.editLinkText, { fontSize: font.body }]}
              maxFontSizeMultiplier={font.maxFontSizeMultiplier}
            >
              Edit Profiles
            </Text>
          </TouchableOpacity>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.linen,
  },
  handle: {
    backgroundColor: colors.dusty,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: '700',
    color: colors.espresso,
    marginLeft: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: HIT_TARGET,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  rowActive: {
    backgroundColor: colors.parchment,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  initial: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  rowText: {
    flex: 1,
  },
  name: {
    color: colors.espresso,
    fontWeight: '600',
  },
  age: {
    color: colors.dusty,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: HIT_TARGET,
    marginTop: spacing.sm,
  },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.cocoa,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  addLabel: {
    color: colors.cocoa,
    fontWeight: '600',
  },
  limitHint: {
    color: colors.dusty,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  addForm: {
    marginTop: spacing.md,
    backgroundColor: colors.parchment,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  formLabel: {
    color: colors.dusty,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.linen,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.espresso,
    marginBottom: spacing.md,
    minHeight: HIT_TARGET,
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
    backgroundColor: colors.linen,
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
  addSave: {
    backgroundColor: colors.cocoa,
    borderRadius: radii.md,
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSaveText: {
    color: colors.white,
    fontWeight: '700',
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: HIT_TARGET,
    marginTop: spacing.md,
  },
  editLinkText: {
    color: colors.cocoa,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
