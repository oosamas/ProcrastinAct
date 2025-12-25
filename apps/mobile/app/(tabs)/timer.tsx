import { useState, useEffect, useRef, useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import * as Haptics from 'expo-haptics';

const FOCUS_TIME = 25 * 60; // 25 minutes in seconds

export default function TimerScreen() {
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get timer label based on state
  const getTimerLabel = () => {
    if (!isRunning && !isPaused) return 'Focus Time';
    if (isPaused) return 'Paused';
    return 'Focusing...';
  };

  // Handle timer countdown
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer complete
            setIsRunning(false);
            setIsPaused(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return FOCUS_TIME;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(true);
  };

  const handleResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(false);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(FOCUS_TIME);
  };

  // Calculate progress for visual indicator
  const progress = (FOCUS_TIME - timeRemaining) / FOCUS_TIME;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <View
            style={[
              styles.timerCircle,
              isRunning && !isPaused && styles.timerCircleActive,
            ]}
          >
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>{getTimerLabel()}</Text>
            {isRunning && (
              <View style={styles.progressContainer}>
                <View
                  style={[styles.progressBar, { width: `${progress * 100}%` }]}
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.controls}>
          {!isRunning ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Icon name="play" size={32} color="#ffffff" />
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
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
                style={styles.resetButton}
                onPress={handleReset}
                activeOpacity={0.8}
              >
                <Icon name="refresh" size={28} color="#6366f1" />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.encouragement}>
          <Text style={styles.encouragementText}>
            {isRunning && !isPaused
              ? 'Stay focused. You can do this!'
              : isPaused
                ? 'Take a breath. Resume when ready.'
                : "Just starting is the hardest part. You've got this."}
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
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
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
    borderWidth: 6,
    borderColor: '#6366f1',
  },
  timerCircleActive: {
    borderColor: '#22c55e',
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
    bottom: 40,
    width: 200,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
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
    gap: 16,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  resetButtonText: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '600',
  },
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
