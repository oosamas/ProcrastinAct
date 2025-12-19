/**
 * Task Notes System
 *
 * Optional additional context for tasks.
 * Hidden by default to reduce overwhelm but accessible when needed.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TaskNote {
  id: string;
  taskId: string;
  content: string;
  /** Markdown-formatted content */
  formattedContent?: string;
  /** Attached images (URLs or base64) */
  images?: NoteImage[];
  /** Voice note recording */
  voiceNote?: VoiceNote;
  /** Detected links */
  links?: DetectedLink[];
  /** When the note was created */
  createdAt: Date;
  /** When the note was last updated */
  updatedAt: Date;
}

export interface NoteImage {
  id: string;
  url: string;
  /** Base64 data for offline storage */
  base64?: string;
  /** Alt text for accessibility */
  altText?: string;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
}

export interface VoiceNote {
  id: string;
  /** URL to audio file or base64 data */
  url: string;
  /** Duration in seconds */
  duration: number;
  /** Transcription if available */
  transcription?: string;
  /** When it was recorded */
  recordedAt: Date;
}

export interface DetectedLink {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  /** Position in text */
  startIndex: number;
  endIndex: number;
}

// ============================================================================
// NOTE CREATION
// ============================================================================

/**
 * Create a new task note
 */
export function createNote(
  taskId: string,
  content: string
): Omit<TaskNote, 'id'> {
  const now = new Date();
  const links = detectLinks(content);

  return {
    taskId,
    content,
    formattedContent: parseMarkdown(content),
    links,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update an existing note
 */
export function updateNote(
  note: TaskNote,
  updates: Partial<Pick<TaskNote, 'content' | 'images' | 'voiceNote'>>
): TaskNote {
  const content = updates.content ?? note.content;
  const links = updates.content ? detectLinks(content) : note.links;

  return {
    ...note,
    ...updates,
    content,
    formattedContent: updates.content
      ? parseMarkdown(content)
      : note.formattedContent,
    links,
    updatedAt: new Date(),
  };
}

// ============================================================================
// MARKDOWN PARSING (Basic)
// ============================================================================

/**
 * Parse basic markdown to HTML
 * Supports: bold, italic, strikethrough, links, lists, code
 */
export function parseMarkdown(text: string): string {
  let result = text;

  // Escape HTML
  result = result
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links: [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Auto-link URLs
  result = result.replace(
    /(^|[^"(])(https?:\/\/[^\s<]+)/g,
    '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>'
  );

  // Unordered lists: - item or * item
  result = result.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  result = result.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists: 1. item
  result = result.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  // Note: This simple approach doesn't handle nested lists

  // Line breaks
  result = result.replace(/\n/g, '<br>');

  return result;
}

/**
 * Strip markdown formatting for plain text
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[\-\*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '');
}

// ============================================================================
// LINK DETECTION
// ============================================================================

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;

/**
 * Detect URLs in text
 */
export function detectLinks(text: string): DetectedLink[] {
  const links: DetectedLink[] = [];
  let match;

  while ((match = URL_REGEX.exec(text)) !== null) {
    links.push({
      url: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return links;
}

/**
 * Fetch link preview metadata (requires server-side implementation)
 */
export async function fetchLinkPreview(
  url: string
): Promise<Partial<DetectedLink>> {
  // This would be implemented with a server-side API
  // For now, return basic info
  try {
    const urlObj = new URL(url);
    return {
      url,
      title: urlObj.hostname,
    };
  } catch {
    return { url };
  }
}

// ============================================================================
// IMAGE HANDLING
// ============================================================================

/**
 * Create an image attachment from a file
 */
export function createImageFromFile(file: File): Promise<NoteImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        resolve({
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          url: base64,
          base64,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = reject;
      img.src = base64;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, GIF, and WebP images are allowed',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'Image must be smaller than 5MB',
    };
  }

  return { valid: true };
}

// ============================================================================
// VOICE NOTE HANDLING
// ============================================================================

/**
 * Voice recorder state
 */
export interface VoiceRecorderState {
  isRecording: boolean;
  duration: number;
  error?: string;
}

/**
 * Create a voice note from audio blob
 */
export function createVoiceNoteFromBlob(
  blob: Blob,
  duration: number
): Promise<VoiceNote> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        id: `voice_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        url: reader.result as string,
        duration,
        recordedAt: new Date(),
      });
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Search notes by content
 */
export function searchNotes(notes: TaskNote[], query: string): TaskNote[] {
  if (!query.trim()) return notes;

  const lowerQuery = query.toLowerCase();

  return notes.filter((note) => {
    // Search in plain content
    if (note.content.toLowerCase().includes(lowerQuery)) return true;

    // Search in voice note transcription
    if (note.voiceNote?.transcription?.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search in image alt text
    if (
      note.images?.some((img) =>
        img.altText?.toLowerCase().includes(lowerQuery)
      )
    ) {
      return true;
    }

    return false;
  });
}

/**
 * Highlight search matches in text
 */
export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');

  return text.replace(regex, '<mark>$1</mark>');
}

// ============================================================================
// SERIALIZATION
// ============================================================================

export interface SerializedTaskNote {
  id: string;
  taskId: string;
  content: string;
  formattedContent?: string;
  images?: NoteImage[];
  voiceNote?: {
    id: string;
    url: string;
    duration: number;
    transcription?: string;
    recordedAt: string;
  };
  links?: DetectedLink[];
  createdAt: string;
  updatedAt: string;
}

export function serializeNote(note: TaskNote): SerializedTaskNote {
  return {
    ...note,
    voiceNote: note.voiceNote
      ? {
          ...note.voiceNote,
          recordedAt: note.voiceNote.recordedAt.toISOString(),
        }
      : undefined,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export function deserializeNote(data: SerializedTaskNote): TaskNote {
  return {
    ...data,
    voiceNote: data.voiceNote
      ? {
          ...data.voiceNote,
          recordedAt: new Date(data.voiceNote.recordedAt),
        }
      : undefined,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}
