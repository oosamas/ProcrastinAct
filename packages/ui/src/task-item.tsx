'use client';

import { type CSSProperties } from 'react';
import type { Task, TaskStatus } from '@procrastinact/types';
import { colors, borderRadius, spacing, typography, shadows } from './tokens';

interface TaskItemProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onShrink?: (taskId: string) => void;
  style?: CSSProperties;
}

const statusColors: Record<TaskStatus, string> = {
  pending: colors.neutral[400],
  in_progress: colors.primary[500],
  completed: colors.success,
  stopped: colors.warning,
};

export function TaskItem({
  task,
  onStatusChange,
  onShrink,
  style,
}: TaskItemProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.sm,
    borderLeft: `4px solid ${statusColors[task.status]}`,
    ...style,
  };

  const checkboxStyle: CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    border: `2px solid ${task.status === 'completed' ? colors.success : colors.neutral[300]}`,
    backgroundColor:
      task.status === 'completed' ? colors.success : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color:
      task.status === 'completed'
        ? colors.text.muted.light
        : colors.text.primary.light,
    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
    fontFamily: typography.fontFamily.sans,
    margin: 0,
  };

  const shrinkBadgeStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: colors.primary[500],
    backgroundColor: colors.primary[50],
    padding: `${spacing[1]}px ${spacing[2]}px`,
    borderRadius: borderRadius.sm,
    marginTop: spacing[1],
    display: 'inline-block',
  };

  const handleToggle = () => {
    if (onStatusChange) {
      const newStatus: TaskStatus =
        task.status === 'completed' ? 'pending' : 'completed';
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <div style={containerStyle}>
      <div
        style={checkboxStyle}
        onClick={handleToggle}
        role="checkbox"
        aria-checked={task.status === 'completed'}
      >
        {task.status === 'completed' && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </div>
      <div style={contentStyle}>
        <p style={titleStyle}>{task.title}</p>
        {task.shrinkLevel > 0 && (
          <span style={shrinkBadgeStyle}>Shrunk {task.shrinkLevel}x</span>
        )}
      </div>
      {onShrink && task.status !== 'completed' && (
        <button
          onClick={() => onShrink(task.id)}
          style={{
            padding: spacing[2],
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: colors.primary[500],
          }}
          title="Make it smaller"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
