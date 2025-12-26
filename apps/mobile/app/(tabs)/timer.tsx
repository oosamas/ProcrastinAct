import { useEffect, useRef, useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import * as Haptics from 'expo-haptics';
import { useAppStore, useCurrentTask, useTimer } from '../../stores/app-store';
import {
  formatTime,
  calculateTimeRemaining,
  getTimerProgress,
  TIMER_PRESETS,
} from '@procrastinact/core';

// Timer preset component
function TimerPresets({
  onSelect,
  darkMode,
}: {
  onSelect: (minutes: number) => void;
  darkMode: boolean;
}) {
  return (
    <View style={styles.presets}>
      {TIMER_PRESETS.map((minutes) => (
        <TouchableOpacity
          key={minutes}
          style={[styles.presetButton, darkMode && styles.presetButtonDark]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(minutes);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.presetText, darkMode && styles.textLight]}>
            {minutes}m
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Current task banner
function TaskBanner({ title, darkMode }: { title: string; darkMode: boolean }) {
  return (
    <View style={[styles.taskBanner, darkMode && styles.taskBannerDark]}>
      <Icon name="radio-button-on" size={16} color="#6366f1" />
      <Text
        style={[styles.taskBannerText, darkMode && styles.textLight]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}

// Circular progress component
function CircularProgress({
  progress,
  isRunning,
  timeRemaining,
  label,
  darkMode,
}: {
  progress: number;
  isRunning: boolean;
  timeRemaining: number;
  label: string;
  darkMode: boolean;
}) {
  return (
    <View style={styles.timerContainer}>
      <View style={[styles.timerCircle, darkMode && styles.timerCircleDark]}>
        {/* Progress ring - simplified without SVG */}
        <View
          style={[
            styles.progressRing,
            {
              borderColor: isRunning ? '#22c55e' : '#6366f1',
              opacity: 0.2,
            },
          ]}
        />
        <View
          style={[
            styles.progressRingActive,
            {
              borderColor: isRunning ? '#22c55e' : '#6366f1',
              transform: [{ rotate: `${progress * 360}deg` }],
            },
          ]}
        />
        <Text style={[styles.timerText, darkMode && styles.textLight]}>
          {formatTime(timeRemaining)}
        </Text>
        <Text style={[styles.timerLabel, darkMode && styles.subtitleDark]}>
          {label}
        </Text>
        {/* Progress bar fallback */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress * 100}%`,
                backgroundColor: isRunning ? '#22c55e' : '#6366f1',
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export default function TimerScreen() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTask = useCurrentTask();
  const timer = useTimer();
  const darkMode = useAppStore((state) => state.darkMode);

  const startFocusTimer = useAppStore((state) => state.startFocusTimer);
  const pauseFocusTimer = useAppStore((state) => state.pauseFocusTimer);
  const resumeFocusTimer = useAppStore((state) => state.resumeFocusTimer);
  const extendFocusTimer = useAppStore((state) => state.extendFocusTimer);
  const endTimerEarly = useAppStore((state) => state.endTimerEarly);
  const updateTimerRemaining = useAppStore(
    (state) => state.updateTimerRemaining
  );

  // Calculate real-time values
  const timeRemaining = timer ? calculateTimeRemaining(timer) : 0;
  const progress = timer ? getTimerProgress(timer) : 0;
  const isRunning = timer?.isRunning ?? false;
  const isPaused =
    timer && !timer.isRunning && timer.remaining < timer.duration;

  // Timer tick effect
  useEffect(() => {
    if (timer?.isRunning) {
      intervalRef.current = setInterval(() => {
        const remaining = calculateTimeRemaining(timer);
        updateTimerRemaining(remaining);

        if (remaining <= 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          endTimerEarly();
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    timer?.isRunning,
    timer?.startedAt,
    updateTimerRemaining,
    endTimerEarly,
    timer,
  ]);

  const getTimerLabel = useCallback(() => {
    if (!timer) return 'Select duration';
    if (isPaused) return 'Paused';
    if (isRunning) return 'Focusing...';
    return 'Ready';
  }, [timer, isPaused, isRunning]);

  const handleStart = (minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startFocusTimer(minutes);
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pauseFocusTimer();
  };

  const handleResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resumeFocusTimer();
  };

  const handleExtend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    extendFocusTimer(5);
  };

  const handleEnd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    endTimerEarly();
  };

  const getEncouragementMessage = () => {
    if (!timer) {
      return currentTask
        ? 'Pick a duration and dive in!'
        : 'Add a task first, then come back to focus.';
    }
    if (isRunning) {
      return 'Stay focused. You can do this!';
    }
    if (isPaused) {
      return 'Take a breath. Resume when ready.';
    }
    return "Just starting is the hardest part. You've got this.";
  };

  return (
    <SafeAreaView
      style={[styles.container, darkMode && styles.containerDark]}
      edges={['bottom']}
    >
      <View style={styles.content}>
        {/* Current task banner */}
        {currentTask && (
          <TaskBanner title={currentTask.title} darkMode={darkMode} />
        )}

        {/* Timer display */}
        <CircularProgress
          progress={progress}
          isRunning={isRunning}
          timeRemaining={timer ? timeRemaining : 0}
          label={getTimerLabel()}
          darkMode={darkMode}
        />

        {/* Controls */}
        <View style={styles.controls}>
          {!timer ? (
            // Duration presets when no timer
            <TimerPresets onSelect={handleStart} darkMode={darkMode} />
          ) : !isRunning && !isPaused ? (
            // Just created timer, show start
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => resumeFocusTimer()}
              activeOpacity={0.8}
            >
              <Icon name="play" size={32} color="#ffffff" />
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            // Active/paused timer controls
            <View style={styles.activeControls}>
              {isPaused ? (
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={handleResume}
                  activeOpacity={0.8}
                >
                  <Icon name="play" size={28} color="#ffffff" />
                  <Text style={styles.controlButtonText}>Resume</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={handlePause}
                  activeOpacity={0.8}
                >
                  <Icon name="pause" size={28} color="#ffffff" />
                  <Text style={styles.controlButtonText}>Pause</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.extendButton,
                  darkMode && styles.extendButtonDark,
                ]}
                onPress={handleExtend}
                activeOpacity={0.8}
              >
                <Icon name="add-circle-outline" size={24} color="#6366f1" />
                <Text style={styles.extendButtonText}>+5m</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.endButton, darkMode && styles.endButtonDark]}
                onPress={handleEnd}
                activeOpacity={0.8}
              >
                <Icon name="stop" size={24} color="#ef4444" />
                <Text style={styles.endButtonText}>End</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Encouragement */}
        <View style={styles.encouragement}>
          <Text
            style={[styles.encouragementText, darkMode && styles.subtitleDark]}
          >
            {getEncouragementMessage()}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },

  // Task banner
  taskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 16,
    maxWidth: '90%',
  },
  taskBannerDark: {
    backgroundColor: '#1f2937',
  },
  taskBannerText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  textLight: {
    color: '#f9fafb',
  },
  subtitleDark: {
    color: '#9ca3af',
  },

  // Timer
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  timerCircleDark: {
    backgroundColor: '#1f2937',
  },
  progressRing: {
    position: 'absolute',
    width: 268,
    height: 268,
    borderRadius: 134,
    borderWidth: 6,
  },
  progressRingActive: {
    position: 'absolute',
    width: 268,
    height: 268,
    borderRadius: 134,
    borderWidth: 6,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#1f2937',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 50,
    width: 180,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },

  // Presets
  presets: {
    flexDirection: 'row',
    gap: 12,
  },
  presetButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  presetButtonDark: {
    backgroundColor: '#1f2937',
    borderColor: '#6366f1',
  },
  presetText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
  },

  // Controls
  controls: {
    paddingVertical: 32,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  activeControls: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  extendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 4,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  extendButtonDark: {
    backgroundColor: '#1f2937',
  },
  extendButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  endButtonDark: {
    backgroundColor: '#1f2937',
  },
  endButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },

  // Encouragement
  encouragement: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  encouragementText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
