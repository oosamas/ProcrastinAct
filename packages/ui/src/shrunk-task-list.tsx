'use client';

import { type CSSProperties } from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animation,
} from './tokens';

interface ShrunkTask {
  title: string;
  description?: string;
  estimatedMinutes: number;
  difficulty: 'trivial' | 'easy' | 'medium';
  motivation?: string;
}

interface ShrunkTaskListProps {
  tasks: ShrunkTask[];
  onSelectTask: (task: ShrunkTask, index: number) => void;
  selectedIndex?: number;
  originalTask?: string;
  encouragement?: string;
  onGoBack?: () => void;
  darkMode?: boolean;
  style?: CSSProperties;
}

const difficultyColors = {
  trivial: '#22c55e', // green
  easy: '#3b82f6', // blue
  medium: '#f97316', // orange
};

const difficultyLabels = {
  trivial: 'Super easy',
  easy: 'Manageable',
  medium: 'Moderate',
};

export function ShrunkTaskList({
  tasks,
  onSelectTask,
  selectedIndex,
  originalTask,
  encouragement,
  onGoBack,
  darkMode = false,
  style,
}: ShrunkTaskListProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[3],
    ...style,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  };

  const backButtonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    padding: 0,
    backgroundColor: 'transparent',
    border: `1px solid ${darkMode ? colors.neutral[600] : colors.neutral[300]}`,
    borderRadius: borderRadius.full,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms`,
  };

  const originalTaskStyle: CSSProperties = {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
    textDecoration: 'line-through',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const encouragementStyle: CSSProperties = {
    padding: spacing[4],
    backgroundColor: darkMode ? colors.primary[900] : colors.primary[50],
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.primary[200] : colors.primary[700],
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing[2],
  };

  const taskCardStyle = (index: number): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    padding: spacing[4],
    backgroundColor: darkMode ? colors.surface.dark : colors.surface.light,
    borderRadius: borderRadius.lg,
    boxShadow: selectedIndex === index ? shadows.lg : shadows.sm,
    border: `2px solid ${
      selectedIndex === index ? colors.primary[500] : 'transparent'
    }`,
    cursor: 'pointer',
    transition: `all ${animation.duration.fast}ms ${animation.easing.easeOut}`,
    transform: selectedIndex === index ? 'scale(1.02)' : 'scale(1)',
  });

  const taskHeaderStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  };

  const taskTitleStyle: CSSProperties = {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.primary.dark : colors.text.primary.light,
    margin: 0,
  };

  const badgeContainerStyle: CSSProperties = {
    display: 'flex',
    gap: spacing[2],
    alignItems: 'center',
  };

  const difficultyBadgeStyle = (
    difficulty: 'trivial' | 'easy' | 'medium'
  ): CSSProperties => ({
    padding: `${spacing[1]}px ${spacing[2]}px`,
    backgroundColor: `${difficultyColors[difficulty]}20`,
    color: difficultyColors[difficulty],
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
  });

  const timeBadgeStyle: CSSProperties = {
    padding: `${spacing[1]}px ${spacing[2]}px`,
    backgroundColor: darkMode ? colors.neutral[700] : colors.neutral[100],
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.sans,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.text.secondary.dark : colors.text.secondary.light,
    margin: 0,
    lineHeight: typography.lineHeight.relaxed,
  };

  const motivationStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    color: darkMode ? colors.primary[300] : colors.primary[600],
    margin: 0,
    paddingTop: spacing[2],
    borderTop: `1px solid ${darkMode ? colors.neutral[700] : colors.neutral[200]}`,
  };

  const stepIndicatorStyle = (_index: number): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    backgroundColor: colors.primary[500],
    color: 'white',
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.sans,
    flexShrink: 0,
  });

  return (
    <div style={containerStyle}>
      {/* Header with back button and original task */}
      {(onGoBack || originalTask) && (
        <div style={headerStyle}>
          {onGoBack && (
            <button
              style={backButtonStyle}
              onClick={onGoBack}
              aria-label="Go back to original task"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          )}
          {originalTask && (
            <span style={originalTaskStyle} title={originalTask}>
              {originalTask}
            </span>
          )}
        </div>
      )}

      {/* Encouragement message */}
      {encouragement && <div style={encouragementStyle}>{encouragement}</div>}

      {/* Task list */}
      {tasks.map((task, index) => (
        <div
          key={index}
          style={taskCardStyle(index)}
          onClick={() => onSelectTask(task, index)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTask(task, index);
            }
          }}
          aria-label={`Step ${index + 1}: ${task.title}`}
        >
          <div style={taskHeaderStyle}>
            <span style={stepIndicatorStyle(index)}>{index + 1}</span>
            <h3 style={taskTitleStyle}>{task.title}</h3>
            <div style={badgeContainerStyle}>
              <span style={difficultyBadgeStyle(task.difficulty)}>
                {difficultyLabels[task.difficulty]}
              </span>
              <span style={timeBadgeStyle}>~{task.estimatedMinutes}min</span>
            </div>
          </div>

          {task.description && (
            <p style={descriptionStyle}>{task.description}</p>
          )}

          {task.motivation && (
            <p style={motivationStyle}>
              <em>{task.motivation}</em>
            </p>
          )}
        </div>
      ))}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: spacing[8],
            color: darkMode ? colors.text.muted.dark : colors.text.muted.light,
            fontFamily: typography.fontFamily.sans,
          }}
        >
          No subtasks yet. Click &quot;Make it smaller&quot; to break down your
          task.
        </div>
      )}
    </div>
  );
}
