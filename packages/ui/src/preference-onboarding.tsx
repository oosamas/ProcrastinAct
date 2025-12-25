'use client';

import { type CSSProperties, useState, useCallback } from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  animation,
  touchTarget,
  shadows,
} from './tokens';
import { useMotion } from './motion';
import { useHaptics } from './haptics';

// ============================================================================
// TYPES
// ============================================================================

export interface PreferenceQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'single' | 'multi';
  options: PreferenceOption[];
  skippable: boolean;
}

export interface PreferenceOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  emoji?: string;
}

export interface PreferenceAnswer {
  questionId: string;
  value: string | number | boolean | (string | number | boolean)[];
}

// ============================================================================
// PREFERENCE QUESTION CARD
// ============================================================================

interface QuestionCardProps {
  question: PreferenceQuestion;
  selectedValue: string | number | boolean | null;
  selectedValues: (string | number | boolean)[];
  onSelect: (value: string | number | boolean) => void;
  onSkip: () => void;
  darkMode?: boolean;
}

/**
 * Single preference question card
 */
export function QuestionCard({
  question,
  selectedValue,
  selectedValues,
  onSelect,
  onSkip,
  darkMode = false,
}: QuestionCardProps) {
  const { trigger } = useHaptics();
  const { reducedMotion: _reducedMotion } = useMotion();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[6],
    padding: spacing[6],
    maxWidth: 500,
    margin: '0 auto',
  };

  const headerStyle: CSSProperties = {
    textAlign: 'center',
  };

  const questionStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[2],
    lineHeight: typography.lineHeight.tight,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    lineHeight: typography.lineHeight.relaxed,
  };

  const optionsStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
  };

  const skipStyle: CSSProperties = {
    marginTop: spacing[4],
    textAlign: 'center',
  };

  const skipButtonStyle: CSSProperties = {
    padding: `${spacing[2]}px ${spacing[4]}px`,
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    border: 'none',
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
  };

  const handleSelect = useCallback(
    (value: string | number | boolean) => {
      trigger('tap');
      onSelect(value);
    },
    [trigger, onSelect]
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={questionStyle}>{question.question}</h2>
        {question.description && (
          <p style={descriptionStyle}>{question.description}</p>
        )}
      </div>

      <div style={optionsStyle}>
        {question.options.map((option) => {
          const isSelected =
            question.type === 'multi'
              ? selectedValues.includes(option.value)
              : selectedValue === option.value;

          return (
            <OptionButton
              key={String(option.value)}
              option={option}
              isSelected={isSelected}
              onClick={() => handleSelect(option.value)}
              darkMode={darkMode}
            />
          );
        })}
      </div>

      {question.skippable && (
        <div style={skipStyle}>
          <button
            style={skipButtonStyle}
            onClick={() => {
              trigger('tap');
              onSkip();
            }}
            type="button"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// OPTION BUTTON
// ============================================================================

interface OptionButtonProps {
  option: PreferenceOption;
  isSelected: boolean;
  onClick: () => void;
  darkMode?: boolean;
}

function OptionButton({
  option,
  isSelected,
  onClick,
  darkMode = false,
}: OptionButtonProps) {
  const { reducedMotion } = useMotion();

  const buttonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[4],
    minHeight: touchTarget.comfortable,
    backgroundColor: isSelected
      ? darkMode
        ? colors.primary[900]
        : colors.primary[50]
      : darkMode
        ? colors.neutral[800]
        : colors.neutral[50],
    border: `2px solid ${isSelected ? colors.primary[500] : 'transparent'}`,
    borderRadius: borderRadius.xl,
    cursor: 'pointer',
    textAlign: 'left',
    transition: reducedMotion
      ? 'none'
      : `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    boxShadow: isSelected ? shadows.focus : 'none',
  };

  const emojiStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    width: 40,
    textAlign: 'center',
  };

  const contentStyle: CSSProperties = {
    flex: 1,
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: option.description ? spacing[1] : 0,
  };

  const descStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
  };

  const checkStyle: CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: isSelected ? colors.primary[500] : 'transparent',
    border: isSelected
      ? 'none'
      : `2px solid ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <button style={buttonStyle} onClick={onClick} type="button">
      {option.emoji && <span style={emojiStyle}>{option.emoji}</span>}
      <div style={contentStyle}>
        <p style={labelStyle}>{option.label}</p>
        {option.description && <p style={descStyle}>{option.description}</p>}
      </div>
      <div style={checkStyle}>
        {isSelected && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </div>
    </button>
  );
}

// ============================================================================
// PREFERENCE ONBOARDING FLOW
// ============================================================================

interface PreferenceOnboardingProps {
  questions: PreferenceQuestion[];
  onComplete: (answers: PreferenceAnswer[]) => void;
  onSkipAll?: () => void;
  darkMode?: boolean;
}

/**
 * Full preference onboarding flow
 */
export function PreferenceOnboarding({
  questions,
  onComplete,
  onSkipAll,
  darkMode = false,
}: PreferenceOnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, string | number | boolean | (string | number | boolean)[]>
  >({});
  const { trigger } = useHaptics();
  const { reducedMotion } = useMotion();

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelect = useCallback(
    (value: string | number | boolean) => {
      const questionId = currentQuestion?.id;
      if (!questionId) return;

      if (currentQuestion?.type === 'multi') {
        setAnswers((prev) => {
          const current =
            (prev[questionId] as (string | number | boolean)[]) || [];
          const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
          return { ...prev, [questionId]: updated };
        });
      } else {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));

        // Auto-advance after selection for single-choice
        setTimeout(
          () => {
            if (currentIndex < questions.length - 1) {
              setCurrentIndex((i) => i + 1);
              trigger('success');
            } else {
              handleComplete();
            }
          },
          reducedMotion ? 0 : 300
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQuestion, currentIndex, questions.length, reducedMotion, trigger]
  );

  const handleComplete = useCallback(() => {
    const answerList: PreferenceAnswer[] = Object.entries(answers).map(
      ([questionId, value]) => ({
        questionId,
        value,
      })
    );
    trigger('success');
    onComplete(answerList);
  }, [answers, trigger, onComplete]);

  const handleSkip = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleComplete();
    }
  }, [currentIndex, questions.length, handleComplete]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      trigger('tap');
    }
  }, [currentIndex, trigger]);

  if (!currentQuestion) {
    return null;
  }

  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: darkMode
      ? colors.background.dark
      : colors.background.light,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderBottom: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
  };

  const backButtonStyle: CSSProperties = {
    width: touchTarget.minimum,
    height: touchTarget.minimum,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: currentIndex > 0 ? 'pointer' : 'default',
    opacity: currentIndex > 0 ? 1 : 0.3,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
  };

  const progressContainerStyle: CSSProperties = {
    flex: 1,
    height: 4,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  };

  const progressBarStyle: CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    backgroundColor: colors.primary[500],
    transition: reducedMotion
      ? 'none'
      : `width ${animation.duration.normal}ms ${animation.easing.easeOut}`,
  };

  const skipAllStyle: CSSProperties = {
    padding: spacing[2],
    backgroundColor: 'transparent',
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    border: 'none',
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: spacing[8],
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button
          style={backButtonStyle}
          onClick={handleBack}
          disabled={currentIndex === 0}
          type="button"
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        <div style={progressContainerStyle}>
          <div style={progressBarStyle} />
        </div>

        {onSkipAll && (
          <button
            style={skipAllStyle}
            onClick={() => {
              trigger('tap');
              onSkipAll();
            }}
            type="button"
          >
            Skip all
          </button>
        )}
      </div>

      <div style={contentStyle}>
        <QuestionCard
          question={currentQuestion}
          selectedValue={
            currentQuestion.type === 'single'
              ? ((answers[currentQuestion.id] as
                  | string
                  | number
                  | boolean
                  | null) ?? null)
              : null
          }
          selectedValues={
            currentQuestion.type === 'multi'
              ? ((answers[currentQuestion.id] as (
                  | string
                  | number
                  | boolean
                )[]) ?? [])
              : []
          }
          onSelect={handleSelect}
          onSkip={handleSkip}
          darkMode={darkMode}
        />
      </div>

      {currentQuestion.type === 'multi' && (
        <div
          style={{
            padding: spacing[4],
            borderTop: `1px solid ${darkMode ? colors.border.dark : colors.border.light}`,
          }}
        >
          <button
            style={{
              width: '100%',
              padding: spacing[4],
              backgroundColor: colors.primary[500],
              color: 'white',
              border: 'none',
              borderRadius: borderRadius.xl,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              cursor: 'pointer',
              minHeight: touchTarget.comfortable,
            }}
            onClick={() => {
              if (currentIndex < questions.length - 1) {
                setCurrentIndex((i) => i + 1);
                trigger('success');
              } else {
                handleComplete();
              }
            }}
            type="button"
          >
            {currentIndex < questions.length - 1 ? 'Continue' : 'Finish'}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PREFERENCE PROFILE SELECTOR
// ============================================================================

interface ProfileOption {
  name: string;
  description: string;
  emoji?: string;
}

interface ProfileSelectorProps {
  profiles: ProfileOption[];
  selectedProfile: string | null;
  onSelect: (name: string) => void;
  darkMode?: boolean;
}

/**
 * Quick profile selection for preference presets
 */
export function ProfileSelector({
  profiles,
  selectedProfile,
  onSelect,
  darkMode = false,
}: ProfileSelectorProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    marginBottom: spacing[2],
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: spacing[3],
  };

  const cardStyle = (isSelected: boolean): CSSProperties => ({
    padding: spacing[4],
    backgroundColor: isSelected
      ? darkMode
        ? colors.primary[900]
        : colors.primary[50]
      : darkMode
        ? colors.neutral[800]
        : colors.neutral[50],
    border: `2px solid ${isSelected ? colors.primary[500] : 'transparent'}`,
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    textAlign: 'center',
  });

  const nameStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[1],
  };

  const descStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Quick Setup</h3>
      <div style={gridStyle}>
        {profiles.map((profile) => (
          <button
            key={profile.name}
            style={cardStyle(selectedProfile === profile.name)}
            onClick={() => {
              trigger('tap');
              onSelect(profile.name);
            }}
            type="button"
          >
            {profile.emoji && (
              <div
                style={{
                  fontSize: typography.fontSize['2xl'],
                  marginBottom: spacing[2],
                }}
              >
                {profile.emoji}
              </div>
            )}
            <p style={nameStyle}>{profile.name}</p>
            <p style={descStyle}>{profile.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// PREFERENCE SUMMARY
// ============================================================================

interface PreferenceSummaryProps {
  answers: PreferenceAnswer[];
  questions: PreferenceQuestion[];
  onEdit: (questionId: string) => void;
  onConfirm: () => void;
  darkMode?: boolean;
}

/**
 * Summary of selected preferences before confirming
 */
export function PreferenceSummary({
  answers,
  questions,
  onEdit,
  onConfirm,
  darkMode = false,
}: PreferenceSummaryProps) {
  const { trigger } = useHaptics();

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4],
    padding: spacing[4],
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
    marginBottom: spacing[2],
    textAlign: 'center',
  };

  const listStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
  };

  const itemStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: darkMode ? colors.neutral[800] : colors.neutral[50],
    borderRadius: borderRadius.lg,
  };

  const labelStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
  };

  const valueStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
  };

  const editButtonStyle: CSSProperties = {
    padding: spacing[2],
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.primary[500],
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
  };

  const confirmButtonStyle: CSSProperties = {
    marginTop: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    cursor: 'pointer',
    minHeight: touchTarget.comfortable,
  };

  const getAnswerLabel = (answer: PreferenceAnswer): string => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return String(answer.value);

    if (Array.isArray(answer.value)) {
      return answer.value
        .map(
          (v) => question.options.find((o) => o.value === v)?.label || String(v)
        )
        .join(', ');
    }

    return (
      question.options.find((o) => o.value === answer.value)?.label ||
      String(answer.value)
    );
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Your Preferences</h2>

      <div style={listStyle}>
        {answers.map((answer) => {
          const question = questions.find((q) => q.id === answer.questionId);
          if (!question) return null;

          return (
            <div key={answer.questionId} style={itemStyle}>
              <div>
                <div style={labelStyle}>{question.question}</div>
                <div style={valueStyle}>{getAnswerLabel(answer)}</div>
              </div>
              <button
                style={editButtonStyle}
                onClick={() => {
                  trigger('tap');
                  onEdit(answer.questionId);
                }}
                type="button"
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>

      <button
        style={confirmButtonStyle}
        onClick={() => {
          trigger('success');
          onConfirm();
        }}
        type="button"
      >
        Looks good!
      </button>
    </div>
  );
}
