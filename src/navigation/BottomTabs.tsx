import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bookmark, Compass, Settings } from 'lucide-react-native';
import { DiscoverStack } from './DiscoverStack';
import { SavedStack } from './SavedStack';
import { SettingsStack } from './SettingsStack';
import { TabParamList } from '../types/navigation';
import { colors } from '../theme/tokens';
import { useReduceMotion } from '../theme/useScaledFont';
import { useProfiles } from '../context/ProfileContext';
import { getSavedBooks, subscribeStorage } from '../services/storage';

const Tab = createBottomTabNavigator<TabParamList>();

export function BottomTabs() {
  const reduceMotion = useReduceMotion();
  const { activeProfile } = useProfiles();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (!activeProfile) {
        setSavedCount(0);
        return;
      }
      const books = await getSavedBooks(activeProfile.id);
      if (!cancelled) setSavedCount(books.length);
    };

    refresh();
    const unsub = subscribeStorage(refresh);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [activeProfile?.id]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.cocoa,
        tabBarInactiveTintColor: colors.dusty,
        tabBarHideOnKeyboard: true,
        animation: reduceMotion ? 'none' : 'fade',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverStack}
        options={{
          title: 'Discover',
          tabBarAccessibilityLabel: 'Discover books',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedStack}
        options={{
          title: 'Saved',
          tabBarAccessibilityLabel: 'Saved books',
          tabBarBadge: savedCount > 0 ? savedCount : undefined,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.linen,
    borderTopColor: colors.parchment,
    borderTopWidth: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.honey,
    color: colors.espresso,
    fontSize: 10,
    fontWeight: '700',
  },
});
