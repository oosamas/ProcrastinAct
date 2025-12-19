import { Ionicons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

/**
 * Icon wrapper component to handle TypeScript compatibility issues
 * with @expo/vector-icons and TypeScript 5.x
 */
export function Icon({ name, size = 24, color = '#000' }: IconProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = Ionicons as any;
  return <IconComponent name={name} size={size} color={color} />;
}
