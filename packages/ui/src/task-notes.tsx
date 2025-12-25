'use client';

import {
  type CSSProperties,
  type ChangeEvent,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
  touchTarget,
} from './tokens';
import { useHaptics } from './haptics';
import { useMotion } from './motion';

// ============================================================================
// TYPES
// ============================================================================

export interface NoteImage {
  id: string;
  url: string;
  altText?: string;
}

export interface VoiceNote {
  id: string;
  url: string;
  duration: number;
  transcription?: string;
}

// ============================================================================
// EXPANDABLE NOTES SECTION
// ============================================================================

interface TaskNotesProps {
  /** Current note content */
  content: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Attached images */
  images?: NoteImage[];
  /** Callback when images are added */
  onAddImage?: (file: File) => void;
  /** Callback when image is removed */
  onRemoveImage?: (id: string) => void;
  /** Voice note */
  voiceNote?: VoiceNote;
  /** Callback when voice recording starts */
  onStartRecording?: () => void;
  /** Callback when voice recording stops */
  onStopRecording?: () => void;
  /** Whether voice recording is in progress */
  isRecording?: boolean;
  /** Recording duration */
  recordingDuration?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum characters */
  maxLength?: number;
  /** Dark mode */
  darkMode?: boolean;
  /** Start expanded */
  defaultExpanded?: boolean;
}

export function TaskNotes({
  content,
  onChange,
  images = [],
  onAddImage,
  onRemoveImage,
  voiceNote,
  onStartRecording,
  onStopRecording,
  isRecording = false,
  recordingDuration = 0,
  placeholder = 'Add notes, links, or context...',
  maxLength = 2000,
  darkMode = false,
  defaultExpanded = false,
}: TaskNotesProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || !!content);
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToggle = useCallback(() => {
    trigger('tap');
    setIsExpanded((prev) => !prev);
    if (!isExpanded && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [trigger, isExpanded]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleImageClick = useCallback(() => {
    trigger('tap');
    fileInputRef.current?.click();
  }, [trigger]);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onAddImage) {
        onAddImage(file);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onAddImage]
  );

  const handleVoiceClick = useCallback(() => {
    trigger('tap');
    if (isRecording && onStopRecording) {
      onStopRecording();
    } else if (onStartRecording) {
      onStartRecording();
    }
  }, [trigger, isRecording, onStartRecording, onStopRecording]);

  // Styles
  const containerStyle: CSSProperties = {
    borderRadius: borderRadius.lg,
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    border: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
    overflow: 'hidden',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing[3]}px ${spacing[4]}px`,
    cursor: 'pointer',
    minHeight: touchTarget.minimum,
    WebkitTapHighlightColor: 'transparent',
  };

  const headerLeftStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
  };

  const badgeStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    padding: `${spacing[0.5]}px ${spacing[2]}px`,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[200],
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    borderRadius: borderRadius.full,
  };

  const chevronStyle: CSSProperties = {
    width: 20,
    height: 20,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: reducedMotion
      ? 'none'
      : `transform ${animation.duration.fast}ms`,
  };

  const contentStyle: CSSProperties = {
    maxHeight: isExpanded ? 500 : 0,
    opacity: isExpanded ? 1 : 0,
    overflow: 'hidden',
    transition: reducedMotion
      ? 'none'
      : `max-height ${animation.duration.normal}ms ${animation.easing.easeOut}, opacity ${animation.duration.fast}ms`,
  };

  const textareaStyle: CSSProperties = {
    width: '100%',
    minHeight: 100,
    padding: spacing[4],
    paddingTop: 0,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.sans,
    lineHeight: typography.lineHeight.relaxed,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'vertical',
  };

  const toolbarStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[2]}px ${spacing[4]}px`,
    borderTop: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const toolButtonStyle = (active: boolean = false): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: active
      ? colors.danger
      : darkMode
        ? colors.neutral[700]
        : colors.neutral[100],
    color: active
      ? 'white'
      : darkMode
        ? colors.text.secondary.dark
        : colors.text.secondary.light,
    border: 'none',
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
  });

  const charCountStyle: CSSProperties = {
    marginLeft: 'auto',
    fontSize: typography.fontSize.xs,
    color:
      content.length > maxLength * 0.9
        ? colors.warning
        : darkMode
          ? colors.text.muted.dark
          : colors.text.muted.light,
  };

  const imagesContainerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing[2],
    padding: `0 ${spacing[4]}px ${spacing[3]}px`,
  };

  const imagePreviewStyle: CSSProperties = {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  };

  const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const removeImageButtonStyle: CSSProperties = {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    fontSize: typography.fontSize.xs,
  };

  const voiceNoteStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: `${spacing[3]}px ${spacing[4]}px`,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    borderRadius: borderRadius.lg,
    margin: `0 ${spacing[4]}px ${spacing[3]}px`,
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasContent = !!content || images.length > 0 || !!voiceNote;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div
        style={headerStyle}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
        aria-expanded={isExpanded}
      >
        <div style={headerLeftStyle}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={
              darkMode
                ? colors.text.secondary.dark
                : colors.text.secondary.light
            }
          >
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
          <span style={labelStyle}>Notes</span>
          {hasContent && !isExpanded && (
            <span style={badgeStyle}>
              {images.length > 0 && `${images.length} img`}
              {voiceNote && ' voice'}
              {content && ` ${content.length} chars`}
            </span>
          )}
        </div>
        <svg style={chevronStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          style={textareaStyle}
          aria-label="Task notes"
        />

        {/* Images */}
        {images.length > 0 && (
          <div style={imagesContainerStyle}>
            {images.map((image) => (
              <div key={image.id} style={imagePreviewStyle}>
                <img
                  src={image.url}
                  alt={image.altText || 'Attached image'}
                  style={imageStyle}
                />
                {onRemoveImage && (
                  <button
                    style={removeImageButtonStyle}
                    onClick={() => {
                      trigger('tap');
                      onRemoveImage(image.id);
                    }}
                    type="button"
                    aria-label="Remove image"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Voice Note */}
        {voiceNote && (
          <div style={voiceNoteStyle}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={
                darkMode
                  ? colors.text.secondary.dark
                  : colors.text.secondary.light
              }
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            </svg>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: darkMode
                    ? colors.text.primary.dark
                    : colors.text.primary.light,
                }}
              >
                Voice note
              </div>
              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  color: darkMode
                    ? colors.text.muted.dark
                    : colors.text.muted.light,
                }}
              >
                {formatDuration(voiceNote.duration)}
              </div>
            </div>
            <button
              style={toolButtonStyle()}
              onClick={() => trigger('tap')}
              type="button"
              aria-label="Play voice note"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div
            style={{
              ...voiceNoteStyle,
              backgroundColor: `${colors.danger}20`,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: colors.danger,
                borderRadius: borderRadius.full,
                animation: 'pulse 1s infinite',
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.danger,
                }}
              >
                Recording...
              </div>
              <div
                style={{
                  fontSize: typography.fontSize.xs,
                  color: darkMode
                    ? colors.text.muted.dark
                    : colors.text.muted.light,
                }}
              >
                {formatDuration(recordingDuration)}
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div style={toolbarStyle}>
          {/* Image button */}
          {onAddImage && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                style={toolButtonStyle()}
                onClick={handleImageClick}
                type="button"
                title="Add image"
                aria-label="Add image"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </button>
            </>
          )}

          {/* Voice button */}
          {(onStartRecording || onStopRecording) && (
            <button
              style={toolButtonStyle(isRecording)}
              onClick={handleVoiceClick}
              type="button"
              title={isRecording ? 'Stop recording' : 'Record voice note'}
              aria-label={isRecording ? 'Stop recording' : 'Record voice note'}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                {isRecording ? (
                  <path d="M6 6h12v12H6z" />
                ) : (
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                )}
              </svg>
            </button>
          )}

          {/* Character count */}
          <span style={charCountStyle}>
            {content.length}/{maxLength}
          </span>
        </div>
      </div>

      {/* Pulse animation for recording */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}

// ============================================================================
// RICH TEXT PREVIEW
// ============================================================================

interface RichTextPreviewProps {
  /** HTML content (from parseMarkdown) */
  html: string;
  /** Dark mode */
  darkMode?: boolean;
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * Preview rendered markdown content
 */
export function RichTextPreview({
  html,
  darkMode = false,
  style,
}: RichTextPreviewProps) {
  const containerStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    wordBreak: 'break-word',
    ...style,
  };

  // Styles for rendered elements
  const elementStyles = `
    strong { font-weight: ${typography.fontWeight.semibold}; }
    em { font-style: italic; }
    del { text-decoration: line-through; }
    code {
      font-family: ${typography.fontFamily.mono};
      font-size: 0.9em;
      padding: 2px 6px;
      background-color: ${darkMode ? colors.neutral[700] : colors.neutral[200]};
      border-radius: ${borderRadius.sm}px;
    }
    a {
      color: ${colors.primary[500]};
      text-decoration: underline;
    }
    ul, ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }
    li {
      margin: 0.25em 0;
    }
    mark {
      background-color: ${colors.secondary[200]};
      padding: 0 2px;
      border-radius: 2px;
    }
  `;

  return (
    <>
      <style>{elementStyles}</style>
      <div style={containerStyle} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

// ============================================================================
// FORMATTING TOOLBAR
// ============================================================================

interface FormattingToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onStrikethrough: () => void;
  onLink: () => void;
  onList: () => void;
  darkMode?: boolean;
}

export function FormattingToolbar({
  onBold,
  onItalic,
  onStrikethrough,
  onLink,
  onList,
  darkMode = false,
}: FormattingToolbarProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[1],
    padding: spacing[2],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[100],
    borderRadius: borderRadius.lg,
  };

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: `background-color ${animation.duration.fast}ms`,
  };

  const buttons = [
    { icon: 'B', action: onBold, title: 'Bold' },
    { icon: 'I', action: onItalic, title: 'Italic', italic: true },
    {
      icon: 'S',
      action: onStrikethrough,
      title: 'Strikethrough',
      strikethrough: true,
    },
    { icon: '🔗', action: onLink, title: 'Link' },
    { icon: '•', action: onList, title: 'List' },
  ];

  return (
    <div style={containerStyle}>
      {buttons.map((btn) => (
        <button
          key={btn.title}
          style={{
            ...buttonStyle,
            fontStyle: btn.italic ? 'italic' : 'normal',
            textDecoration: btn.strikethrough ? 'line-through' : 'none',
            fontWeight: btn.title === 'Bold' ? 'bold' : 'normal',
          }}
          onClick={() => {
            trigger('tap');
            btn.action();
          }}
          type="button"
          title={btn.title}
          aria-label={btn.title}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
