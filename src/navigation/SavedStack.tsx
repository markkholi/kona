import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SavedBooksScreen } from '../screens/SavedBooksScreen';
import { BookDetailScreen } from '../screens/BookDetailScreen';
import { SavedStackParamList } from '../types/navigation';
import { colors } from '../theme/tokens';
import { useReduceMotion } from '../theme/useScaledFont';

const Stack = createNativeStackNavigator<SavedStackParamList>();

export function SavedStack() {
  const reduceMotion = useReduceMotion();

  return (
    <Stack.Navigator
      initialRouteName="SavedBooks"
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'slide_from_right',
        contentStyle: { backgroundColor: colors.cream },
      }}
    >
      <Stack.Screen name="SavedBooks" component={SavedBooksScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
    </Stack.Navigator>
  );
}
