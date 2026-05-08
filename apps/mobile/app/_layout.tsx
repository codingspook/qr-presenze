import '../src/global.css'

import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#111827' },
        headerTintColor: '#f8fafc',
        contentStyle: { backgroundColor: '#111827' },
      }}
    />
  )
}
