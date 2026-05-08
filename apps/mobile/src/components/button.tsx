import { Pressable, Text } from 'react-native'

type ButtonProps = {
  label: string
  onPress?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'success'
}

const variants = {
  primary: 'bg-primary',
  secondary: 'bg-slate-700',
  success: 'bg-success',
}

export function Button({ label, onPress, disabled, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`${variants[variant]} min-h-11 items-center justify-center rounded-md px-4 py-3 ${disabled ? 'opacity-40' : 'opacity-100'}`}
    >
      <Text className="text-center font-semibold text-white">{label}</Text>
    </Pressable>
  )
}
