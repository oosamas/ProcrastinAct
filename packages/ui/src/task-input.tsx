'use client';

import {
  type CSSProperties,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
} from './tokens';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult:
    | ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void)
    | null;
  onerror:
    | ((
        this: SpeechRecognitionInstance,
        ev: SpeechRecognitionErrorEvent
      ) => void)
    | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface TaskInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  voiceEnabled?: boolean;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onVoiceError?: (error: string) => void;
  darkMode?: boolean;
  style?: CSSProperties;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

// Check for speech recognition support
const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
};

export function TaskInput({
  onSubmit,
  placeholder = "What's on your mind?",
  autoFocus = false,
  voiceEnabled = true,
  onVoiceStart,
  onVoiceEnd,
  onVoiceError,
  darkMode = false,
  style,
}: TaskInputProps) {
  const [text, setText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSpeechSupported =
    typeof window !== 'undefined' && getSpeechRecognition() !== null;

  // Handle text submission
  const handleSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (trimmed) {
        onSubmit(trimmed);
        setText('');
        setInterimTranscript('');
      }
    },
    [onSubmit]
  );

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(text);
  };

  // Stop speech recognition
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    setVoiceState('idle');
    setInterimTranscript('');
    onVoiceEnd?.();
  }, [onVoiceEnd]);

  // Start speech recognition
  const startRecognition = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      onVoiceError?.('Speech recognition not supported');
      return;
    }

    // Stop any existing recognition
    stopRecognition();

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceState('listening');
      onVoiceStart?.();
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result) {
          const transcript = result[0]?.transcript ?? '';
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }
      }

      if (finalTranscript) {
        setText((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        setInterimTranscript('');

        // Reset silence timeout on new speech
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Auto-submit after 2 seconds of silence
        silenceTimeoutRef.current = setTimeout(() => {
          stopRecognition();
          // Submit if we have text
          if (text || finalTranscript) {
            handleSubmit(text + (text ? ' ' : '') + finalTranscript);
          }
        }, 2000);
      }

      if (interim) {
        setInterimTranscript(interim);
        // Reset silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          // If we have interim but no final, wait a bit more
        }, 3000);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setVoiceState('error');
      onVoiceError?.(event.error);

      // Auto-recover from no-speech error
      if (event.error === 'no-speech') {
        setTimeout(() => setVoiceState('idle'), 1500);
      }
    };

    recognition.onend = () => {
      // Don't reset state here - let stopRecognition handle it
      // or auto-restart if we're still in listening mode
      if (voiceState === 'listening') {
        // Recognition ended unexpectedly, restart
        try {
          recognition.start();
        } catch {
          stopRecognition();
        }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      onVoiceError?.('Failed to start speech recognition');
      setVoiceState('error');
    }
  }, [
    stopRecognition,
    onVoiceStart,
    onVoiceError,
    voiceState,
    text,
    handleSubmit,
  ]);

  // Toggle voice input
  const toggleVoice = useCallback(() => {
    if (voiceState === 'listening' || voiceState === 'processing') {
      stopRecognition();
    } else {
      startRecognition();
    }
  }, [voiceState, stopRecognition, startRecognition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  // Styles
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    width: '100%',
    ...style,
  };

  const inputContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.md,
    border: `2px solid ${
      voiceState === 'listening'
        ? colors.primary[500]
        : voiceState === 'error'
          ? colors.danger
          : 'transparent'
    }`,
    transition: `border-color ${animation.duration.fast}ms ${animation.easing.easeOut}`,
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    padding: spacing[2],
    minHeight: 48, // Large touch target
  };

  const voiceButtonStyle: CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    border: 'none',
    backgroundColor:
      voiceState === 'listening'
        ? colors.danger
        : voiceState === 'error'
          ? colors.neutral[300]
          : colors.primary[500],
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    transform: voiceState === 'listening' ? 'scale(1.1)' : 'scale(1)',
    boxShadow: voiceState === 'listening' ? shadows.lg : shadows.sm,
  };

  const submitButtonStyle: CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    border: 'none',
    backgroundColor: text.trim() ? colors.primary[500] : colors.neutral[200],
    color: text.trim() ? 'white' : colors.neutral[400],
    cursor: text.trim() ? 'pointer' : 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
  };

  const transcriptStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    fontStyle: 'italic',
    padding: `0 ${spacing[4]}px`,
    minHeight: 20,
    opacity: interimTranscript ? 1 : 0,
    transition: `opacity ${animation.duration.fast}ms`,
  };

  const displayText =
    text + (interimTranscript ? (text ? ' ' : '') + interimTranscript : '');

  return (
    <div style={containerStyle}>
      <form onSubmit={handleFormSubmit} style={{ display: 'contents' }}>
        <div style={inputContainerStyle}>
          <input
            ref={inputRef}
            type="text"
            value={displayText}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              voiceState === 'listening' ? 'Listening...' : placeholder
            }
            autoFocus={autoFocus}
            style={inputStyle}
            aria-label="Task input"
          />

          {/* Submit button */}
          <button
            type="submit"
            style={submitButtonStyle}
            disabled={!text.trim()}
            aria-label="Add task"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>

          {/* Voice button */}
          {voiceEnabled && isSpeechSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              style={voiceButtonStyle}
              aria-label={
                voiceState === 'listening'
                  ? 'Stop listening'
                  : 'Start voice input'
              }
            >
              {voiceState === 'listening' ? (
                // Stop icon (square)
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                // Microphone icon
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Live transcript display */}
      <div style={transcriptStyle} aria-live="polite">
        {interimTranscript}
      </div>

      {/* Voice state indicator */}
      {voiceState === 'listening' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: spacing[1],
            padding: spacing[2],
          }}
          aria-hidden="true"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: borderRadius.full,
                backgroundColor: colors.primary[500],
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}
