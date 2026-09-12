import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SettingsStackParamList } from '../types/navigation';
import { colors } from '../theme/tokens';
import { useReduceMotion } from '../theme/useScaledFont';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  const reduceMotion = useReduceMotion();

  return (
    <Stack.Navigator
      initialRouteName="Settings"
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'none',
        contentStyle: { backgroundColor: colors.cream },
      }}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
