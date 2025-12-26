import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

// Get the icon name type from Ionicons
type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  /**
   * Name of the Ionicons icon.
   * See: https://ionic.io/ionicons for available icons.
   * Common icons: checkmark, add, close, play, pause, stop, timer-outline, etc.
   */
  name: IoniconsName | string; // Allow string for flexibility, but IoniconsName preferred
  size?: number;
  color?: string;
}

/**
 * Icon wrapper component for Ionicons.
 * Provides type hints for icon names while maintaining compatibility.
 */
export function Icon({ name, size = 24, color = '#000' }: IconProps) {
  // Cast to IoniconsName to satisfy TypeScript while allowing runtime flexibility
  return <Ionicons name={name as IoniconsName} size={size} color={color} />;
}
