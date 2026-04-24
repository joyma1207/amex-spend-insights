import React from 'react';
import { Stack } from 'expo-router';

export default function SpendInsightsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[categoryId]" />
      <Stack.Screen name="transactions/[categoryId]" />
      <Stack.Screen
        name="onboarding"
        options={{ animation: 'fade', presentation: 'modal' }}
      />
    </Stack>
  );
}
