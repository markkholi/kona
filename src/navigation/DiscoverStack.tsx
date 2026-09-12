import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { BookDetailScreen } from '../screens/BookDetailScreen';
import { DiscoverStackParamList } from '../types/navigation';
import { colors } from '../theme/tokens';
import { useReduceMotion } from '../theme/useScaledFont';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export function DiscoverStack() {
  const reduceMotion = useReduceMotion();

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'slide_from_right',
        contentStyle: { backgroundColor: colors.cream },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
    </Stack.Navigator>
  );
}
