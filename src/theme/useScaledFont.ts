import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, PixelRatio } from 'react-native';
import { MAX_FONT_SIZE_MULTIPLIER, scaledFontSize } from './tokens';

export function useScaledFont() {
  // Re-read scale on render so Dynamic Type changes apply after remount/focus.
  const fontScale = Math.min(PixelRatio.getFontScale(), MAX_FONT_SIZE_MULTIPLIER);

  return useMemo(
    () => ({
      hero: scaledFontSize('hero'),
      title: scaledFontSize('title'),
      subtitle: scaledFontSize('subtitle'),
      body: scaledFontSize('body'),
      caption: scaledFontSize('caption'),
      micro: scaledFontSize('micro'),
      maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER,
      fontScale,
    }),
    [fontScale]
  );
}

export function useReduceMotion(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setEnabled(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return enabled;
}
