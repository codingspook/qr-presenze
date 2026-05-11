import type { ReactNode } from 'react'
import { View } from 'react-native'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return <View className={`rounded-lg border border-slate-700 bg-card p-4 ${className}`}>{children}</View>
}
