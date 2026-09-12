import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { colors, elevation, HIT_TARGET, radii } from '../theme/tokens';

interface ShareFabProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

export const ShareFab: React.FC<ShareFabProps> = ({
  onPress,
  accessibilityLabel = 'Share book list',
}) => {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Share2 size={22} color={colors.white} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.honey,
    justifyContent: 'center',
    alignItems: 'center',
    ...elevation.medium,
    minWidth: HIT_TARGET,
    minHeight: HIT_TARGET,
  },
});
