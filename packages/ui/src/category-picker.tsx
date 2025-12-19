'use client';

import { type CSSProperties, useState, useCallback } from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
  touchTarget,
} from './tokens';
import { useHaptics } from './haptics';

// ============================================================================
// TYPES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

// ============================================================================
// CATEGORY PILL
// ============================================================================

interface CategoryPillProps {
  category: Category;
  selected?: boolean;
  onSelect: (category: Category) => void;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
}

export function CategoryPill({
  category,
  selected = false,
  onSelect,
  size = 'medium',
  darkMode = false,
}: CategoryPillProps) {
  const { trigger } = useHaptics();

  const sizes = {
    small: {
      padding: `${spacing[1]}px ${spacing[2]}px`,
      fontSize: typography.fontSize.xs,
      minHeight: 28,
    },
    medium: {
      padding: `${spacing[2]}px ${spacing[3]}px`,
      fontSize: typography.fontSize.sm,
      minHeight: touchTarget.minimum,
    },
    large: {
      padding: `${spacing[3]}px ${spacing[4]}px`,
      fontSize: typography.fontSize.base,
      minHeight: touchTarget.recommended,
    },
  };

  const sizeStyles = sizes[size];

  const pillStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    padding: sizeStyles.padding,
    minHeight: sizeStyles.minHeight,
    backgroundColor: selected
      ? category.color
      : darkMode
        ? colors.neutral[700]
        : colors.neutral[100],
    color: selected
      ? '#ffffff'
      : darkMode
        ? colors.text.primary.dark
        : colors.text.primary.light,
    border: `2px solid ${selected ? category.color : 'transparent'}`,
    borderRadius: borderRadius.full,
    fontSize: sizeStyles.fontSize,
    fontWeight: selected
      ? typography.fontWeight.semibold
      : typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  const handleClick = useCallback(() => {
    trigger('selection');
    onSelect(category);
  }, [category, onSelect, trigger]);

  return (
    <button style={pillStyle} onClick={handleClick} type="button">
      {category.emoji && <span>{category.emoji}</span>}
      <span>{category.name}</span>
    </button>
  );
}

// ============================================================================
// CATEGORY PICKER
// ============================================================================

interface CategoryPickerProps {
  categories: Category[];
  selectedId?: string | null;
  onSelect: (category: Category | null) => void;
  /** Show "All" option */
  showAll?: boolean;
  /** Allow multi-select */
  multiSelect?: boolean;
  /** Selected IDs for multi-select */
  selectedIds?: string[];
  /** Callback for multi-select */
  onMultiSelect?: (ids: string[]) => void;
  /** Suggested category (will be highlighted) */
  suggestedId?: string;
  size?: 'small' | 'medium' | 'large';
  darkMode?: boolean;
}

export function CategoryPicker({
  categories,
  selectedId,
  onSelect,
  showAll = false,
  multiSelect = false,
  selectedIds = [],
  onMultiSelect,
  suggestedId,
  size = 'medium',
  darkMode = false,
}: CategoryPickerProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
  };

  const handleSelect = useCallback(
    (category: Category | null) => {
      if (multiSelect && category && onMultiSelect) {
        const id = category.id;
        if (selectedIds.includes(id)) {
          onMultiSelect(selectedIds.filter((i) => i !== id));
        } else {
          onMultiSelect([...selectedIds, id]);
        }
      } else {
        onSelect(category);
      }
    },
    [multiSelect, onMultiSelect, onSelect, selectedIds]
  );

  const isSelected = (id: string): boolean => {
    if (multiSelect) {
      return selectedIds.includes(id);
    }
    return selectedId === id;
  };

  // "All" pill style
  const allPillStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    padding:
      size === 'small'
        ? `${spacing[1]}px ${spacing[2]}px`
        : size === 'large'
          ? `${spacing[3]}px ${spacing[4]}px`
          : `${spacing[2]}px ${spacing[3]}px`,
    minHeight:
      size === 'small'
        ? 28
        : size === 'large'
          ? touchTarget.recommended
          : touchTarget.minimum,
    backgroundColor:
      selectedId === null && !multiSelect
        ? colors.primary[500]
        : darkMode
          ? colors.neutral[700]
          : colors.neutral[100],
    color:
      selectedId === null && !multiSelect
        ? '#ffffff'
        : darkMode
          ? colors.text.primary.dark
          : colors.text.primary.light,
    border: `2px solid ${
      selectedId === null && !multiSelect ? colors.primary[500] : 'transparent'
    }`,
    borderRadius: borderRadius.full,
    fontSize:
      size === 'small'
        ? typography.fontSize.xs
        : size === 'large'
          ? typography.fontSize.base
          : typography.fontSize.sm,
    fontWeight:
      selectedId === null && !multiSelect
        ? typography.fontWeight.semibold
        : typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
  };

  // Suggestion indicator style
  const suggestionIndicatorStyle: CSSProperties = {
    position: 'relative' as const,
  };

  const suggestionBadgeStyle: CSSProperties = {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    backgroundColor: colors.secondary[500],
    borderRadius: borderRadius.full,
    border: `2px solid ${darkMode ? colors.background.dark : colors.background.light}`,
  };

  return (
    <div style={containerStyle} role="group" aria-label="Category selection">
      {showAll && (
        <button
          style={allPillStyle}
          onClick={() => {
            trigger('selection');
            handleSelect(null);
          }}
          type="button"
        >
          All
        </button>
      )}
      {categories.map((category) => (
        <div
          key={category.id}
          style={
            suggestedId === category.id ? suggestionIndicatorStyle : undefined
          }
        >
          <CategoryPill
            category={category}
            selected={isSelected(category.id)}
            onSelect={handleSelect}
            size={size}
            darkMode={darkMode}
          />
          {suggestedId === category.id && !isSelected(category.id) && (
            <div style={suggestionBadgeStyle} title="Suggested" />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CATEGORY BADGE (for display)
// ============================================================================

interface CategoryBadgeProps {
  category: Category;
  size?: 'small' | 'medium';
  darkMode?: boolean;
}

export function CategoryBadge({
  category,
  size = 'small',
  darkMode = false,
}: CategoryBadgeProps) {
  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[1],
    padding:
      size === 'small'
        ? `${spacing[0.5]}px ${spacing[2]}px`
        : `${spacing[1]}px ${spacing[2]}px`,
    backgroundColor: `${category.color}20`, // 20% opacity
    color: category.color,
    borderRadius: borderRadius.full,
    fontSize:
      size === 'small' ? typography.fontSize.xs : typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
  };

  return (
    <span style={badgeStyle}>
      {category.emoji && <span>{category.emoji}</span>}
      <span>{category.name}</span>
    </span>
  );
}

// ============================================================================
// CATEGORY COLOR PICKER
// ============================================================================

interface CategoryColorPickerProps {
  colors: string[];
  selectedColor: string;
  onSelect: (color: string) => void;
  darkMode?: boolean;
}

export function CategoryColorPicker({
  colors: colorOptions,
  selectedColor,
  onSelect,
  darkMode = false,
}: CategoryColorPickerProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
  };

  const colorButtonStyle = (
    color: string,
    isSelected: boolean
  ): CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: color,
    border: isSelected
      ? `3px solid ${darkMode ? '#ffffff' : '#000000'}`
      : `3px solid transparent`,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
  });

  return (
    <div style={containerStyle} role="radiogroup" aria-label="Category color">
      {colorOptions.map((color) => (
        <button
          key={color}
          style={colorButtonStyle(color, color === selectedColor)}
          onClick={() => {
            trigger('selection');
            onSelect(color);
          }}
          type="button"
          role="radio"
          aria-checked={color === selectedColor}
          aria-label={`Color ${color}`}
        >
          {color === selectedColor && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// CATEGORY EMOJI PICKER
// ============================================================================

interface CategoryEmojiPickerProps {
  emojis: string[];
  selectedEmoji?: string;
  onSelect: (emoji: string) => void;
  darkMode?: boolean;
}

export function CategoryEmojiPicker({
  emojis,
  selectedEmoji,
  onSelect,
  darkMode = false,
}: CategoryEmojiPickerProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
  };

  const emojiButtonStyle = (isSelected: boolean): CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: isSelected
      ? colors.primary[100]
      : darkMode
        ? colors.neutral[700]
        : colors.neutral[100],
    border: isSelected
      ? `2px solid ${colors.primary[500]}`
      : `2px solid transparent`,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.fontSize.xl,
    WebkitTapHighlightColor: 'transparent',
  });

  return (
    <div style={containerStyle} role="radiogroup" aria-label="Category emoji">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          style={emojiButtonStyle(emoji === selectedEmoji)}
          onClick={() => {
            trigger('selection');
            onSelect(emoji);
          }}
          type="button"
          role="radio"
          aria-checked={emoji === selectedEmoji}
          aria-label={`Emoji ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// CATEGORY EDITOR
// ============================================================================

interface CategoryEditorProps {
  category?: Category;
  colors: string[];
  emojis: string[];
  onSave: (category: Omit<Category, 'id'>) => void;
  onCancel: () => void;
  darkMode?: boolean;
}

export function CategoryEditor({
  category,
  colors: colorOptions,
  emojis,
  onSave,
  onCancel,
  darkMode = false,
}: CategoryEditorProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? colorOptions[0]);
  const [emoji, setEmoji] = useState(category?.emoji ?? emojis[0]);
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[5],
    padding: spacing[4],
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    borderRadius: borderRadius.xl,
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    marginBottom: spacing[2],
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    border: `1px solid ${darkMode ? colors.neutral[600] : colors.neutral[200]}`,
    borderRadius: borderRadius.lg,
    outline: 'none',
  };

  const buttonContainerStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[3],
    marginTop: spacing[4],
  };

  const primaryButtonStyle: CSSProperties = {
    flex: 1,
    padding: `${spacing[3]}px ${spacing[4]}px`,
    minHeight: touchTarget.minimum,
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    opacity: name.trim().length < 1 ? 0.5 : 1,
  };

  const secondaryButtonStyle: CSSProperties = {
    flex: 1,
    padding: `${spacing[3]}px ${spacing[4]}px`,
    minHeight: touchTarget.minimum,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    border: `1px solid ${darkMode ? colors.neutral[600] : colors.neutral[200]}`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
  };

  const handleSave = () => {
    if (name.trim().length < 1) return;
    trigger('success');
    onSave({ name: name.trim(), color, emoji });
  };

  return (
    <div style={containerStyle}>
      <div>
        <label style={labelStyle}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          style={inputStyle}
          maxLength={20}
        />
      </div>

      <div>
        <label style={labelStyle}>Color</label>
        <CategoryColorPicker
          colors={colorOptions}
          selectedColor={color}
          onSelect={setColor}
          darkMode={darkMode}
        />
      </div>

      <div>
        <label style={labelStyle}>Emoji</label>
        <CategoryEmojiPicker
          emojis={emojis}
          selectedEmoji={emoji}
          onSelect={setEmoji}
          darkMode={darkMode}
        />
      </div>

      {/* Preview */}
      <div>
        <label style={labelStyle}>Preview</label>
        <CategoryBadge
          category={{ id: 'preview', name: name || 'Category', color, emoji }}
          size="medium"
          darkMode={darkMode}
        />
      </div>

      <div style={buttonContainerStyle}>
        <button style={secondaryButtonStyle} onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          style={primaryButtonStyle}
          onClick={handleSave}
          disabled={name.trim().length < 1}
          type="button"
        >
          {category ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
}
