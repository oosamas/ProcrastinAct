import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Icon } from '../../components/Icon';
import {
  useAppStore,
  useCurrentTask,
  usePendingTasks,
} from '../../stores/app-store';
import type { ShrunkTask } from '@procrastinact/core';

// Celebration Overlay Component
function CelebrationOverlay({
  visible,
  taskTitle,
  streakCount,
  onDismiss,
  darkMode,
}: {
  visible: boolean;
  taskTitle: string | null;
  streakCount: number;
  onDismiss: () => void;
  darkMode: boolean;
}) {
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.5));
  // Use ref to avoid re-running effect when onDismiss reference changes
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDismissRef.current());
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.celebrationOverlay, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.celebrationContent,
          darkMode && styles.celebrationContentDark,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={[styles.checkmark, darkMode && styles.checkmarkDark]}>
          <Icon name="checkmark" size={48} color="#10b981" />
        </View>
        <Text style={[styles.celebrationTitle, darkMode && styles.textLight]}>
          Done!
        </Text>
        {taskTitle && (
          <Text
            style={[styles.celebrationTask, darkMode && styles.subtitleDark]}
            numberOfLines={2}
          >
            {taskTitle}
          </Text>
        )}
        {streakCount > 0 && (
          <View
            style={[styles.streakBadge, darkMode && styles.streakBadgeDark]}
          >
            <Icon name="flame" size={16} color="#f59e0b" />
            <Text
              style={[styles.streakText, darkMode && styles.streakTextDark]}
            >
              {streakCount} day streak
            </Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

// Empty State Component
function EmptyState({
  onAddTask,
  darkMode,
}: {
  onAddTask: (title: string) => void;
  darkMode: boolean;
}) {
  const [taskTitle, setTaskTitle] = useState('');

  const handleSubmit = () => {
    if (taskTitle.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAddTask(taskTitle.trim());
      setTaskTitle('');
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.emptyState}>
      <Icon name="leaf-outline" size={64} color="#6366f1" />
      <Text style={[styles.title, darkMode && styles.textLight]}>
        No tasks yet
      </Text>
      <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>
        Start small. What&apos;s one tiny thing you could do right now?
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, darkMode && styles.inputDark]}
          placeholder="e.g., Send that email"
          placeholderTextColor={darkMode ? '#6b7280' : '#9ca3af'}
          value={taskTitle}
          onChangeText={setTaskTitle}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            !taskTitle.trim() && styles.addButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!taskTitle.trim()}
          activeOpacity={0.8}
        >
          <Icon name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Focus View Component
function FocusView({
  taskTitle,
  onComplete,
  onShrink,
  onStop,
  darkMode,
}: {
  taskTitle: string;
  onComplete: () => void;
  onShrink: () => void;
  onStop: () => void;
  darkMode: boolean;
}) {
  return (
    <View style={styles.focusView}>
      <View style={styles.focusHeader}>
        <Text style={[styles.focusLabel, darkMode && styles.textMuted]}>
          Current Focus
        </Text>
      </View>
      <View style={[styles.taskCard, darkMode && styles.taskCardDark]}>
        <Text style={[styles.taskTitle, darkMode && styles.textLight]}>
          {taskTitle}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onComplete();
          }}
          activeOpacity={0.8}
        >
          <Icon name="checkmark" size={28} color="#ffffff" />
          <Text style={styles.actionButtonText}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.shrinkButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onShrink();
          }}
          activeOpacity={0.8}
        >
          <Icon name="contract-outline" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Shrink</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.stopButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onStop();
          }}
          activeOpacity={0.8}
        >
          <Icon name="close" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Shrink Suggestions View
function ShrinkSuggestionsView({
  suggestions,
  encouragement,
  onSelect,
  onCancel,
  darkMode,
}: {
  suggestions: ShrunkTask[];
  encouragement?: string;
  onSelect: (suggestion: ShrunkTask) => void;
  onCancel: () => void;
  darkMode: boolean;
}) {
  return (
    <ScrollView
      style={styles.shrinkView}
      contentContainerStyle={styles.shrinkContent}
    >
      <View style={styles.shrinkHeader}>
        <Icon name="sparkles" size={32} color="#6366f1" />
        <Text style={[styles.shrinkTitle, darkMode && styles.textLight]}>
          Too big? Try one of these:
        </Text>
      </View>
      {encouragement && (
        <Text style={[styles.encouragement, darkMode && styles.subtitleDark]}>
          {encouragement}
        </Text>
      )}
      <View style={styles.suggestionsList}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.suggestionCard,
              darkMode && styles.suggestionCardDark,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(suggestion);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.suggestionContent}>
              <Text
                style={[styles.suggestionTitle, darkMode && styles.textLight]}
              >
                {suggestion.title}
              </Text>
              {suggestion.motivation && (
                <Text
                  style={[
                    styles.suggestionMotivation,
                    darkMode && styles.subtitleDark,
                  ]}
                >
                  {suggestion.motivation}
                </Text>
              )}
            </View>
            <View style={styles.suggestionMeta}>
              <Text style={styles.suggestionTime}>
                ~{suggestion.estimatedMinutes}m
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.cancelButton, darkMode && styles.cancelButtonDark]}
        onPress={onCancel}
        activeOpacity={0.8}
      >
        <Text style={[styles.cancelButtonText, darkMode && styles.textMuted]}>
          Keep original task
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Add Task Button (floating)
function AddTaskButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.floatingAddButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name="add" size={28} color="#ffffff" />
    </TouchableOpacity>
  );
}

// Quick Add Modal
function QuickAddInput({
  visible,
  onAdd,
  onCancel,
  darkMode,
}: {
  visible: boolean;
  onAdd: (title: string) => void;
  onCancel: () => void;
  darkMode: boolean;
}) {
  const [taskTitle, setTaskTitle] = useState('');

  const handleSubmit = () => {
    if (taskTitle.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onAdd(taskTitle.trim());
      setTaskTitle('');
    }
  };

  if (!visible) return null;

  return (
    <View
      style={[
        styles.quickAddContainer,
        darkMode && styles.quickAddContainerDark,
      ]}
    >
      <TextInput
        style={[styles.quickAddInput, darkMode && styles.inputDark]}
        placeholder="What needs to be done?"
        placeholderTextColor={darkMode ? '#6b7280' : '#9ca3af'}
        value={taskTitle}
        onChangeText={setTaskTitle}
        onSubmitEditing={handleSubmit}
        autoFocus
        returnKeyType="done"
      />
      <View style={styles.quickAddButtons}>
        <TouchableOpacity
          style={styles.quickAddCancel}
          onPress={() => {
            setTaskTitle('');
            onCancel();
          }}
        >
          <Text
            style={[styles.quickAddCancelText, darkMode && styles.textMuted]}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.quickAddSubmit,
            !taskTitle.trim() && styles.quickAddSubmitDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!taskTitle.trim()}
        >
          <Text style={styles.quickAddSubmitText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Main Tasks Screen
export default function TasksScreen() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const currentTask = useCurrentTask();
  const pendingTasks = usePendingTasks();
  const shrinkSuggestions = useAppStore((state) => state.shrinkSuggestions);
  const showCelebration = useAppStore((state) => state.showCelebration);
  const completedTaskTitle = useAppStore((state) => state.completedTaskTitle);
  const streak = useAppStore((state) => state.streak);
  const darkMode = useAppStore((state) => state.darkMode);

  const addTask = useAppStore((state) => state.addTask);
  const completeCurrentTask = useAppStore((state) => state.completeCurrentTask);
  const stopCurrentTask = useAppStore((state) => state.stopCurrentTask);
  const shrinkCurrentTask = useAppStore((state) => state.shrinkCurrentTask);
  const selectShrinkSuggestion = useAppStore(
    (state) => state.selectShrinkSuggestion
  );
  const cancelShrink = useAppStore((state) => state.cancelShrink);
  const dismissCelebration = useAppStore((state) => state.dismissCelebration);

  const handleAddTask = useCallback(
    (title: string) => {
      addTask(title);
      setShowQuickAdd(false);
    },
    [addTask]
  );

  const handleDismissCelebration = useCallback(() => {
    dismissCelebration();
  }, [dismissCelebration]);

  const hasNoTasks = pendingTasks.length === 0 && !currentTask;

  return (
    <SafeAreaView
      style={[styles.container, darkMode && styles.containerDark]}
      edges={['bottom']}
    >
      <View style={styles.content}>
        {/* Shrink Suggestions View */}
        {shrinkSuggestions && (
          <ShrinkSuggestionsView
            suggestions={shrinkSuggestions.shrunkTasks}
            encouragement={shrinkSuggestions.encouragement}
            onSelect={selectShrinkSuggestion}
            onCancel={cancelShrink}
            darkMode={darkMode}
          />
        )}

        {/* Empty State */}
        {!shrinkSuggestions && hasNoTasks && (
          <EmptyState onAddTask={handleAddTask} darkMode={darkMode} />
        )}

        {/* Focus View */}
        {!shrinkSuggestions && currentTask && (
          <FocusView
            taskTitle={currentTask.title}
            onComplete={completeCurrentTask}
            onShrink={shrinkCurrentTask}
            onStop={stopCurrentTask}
            darkMode={darkMode}
          />
        )}

        {/* Quick Add Input */}
        <QuickAddInput
          visible={showQuickAdd}
          onAdd={handleAddTask}
          onCancel={() => setShowQuickAdd(false)}
          darkMode={darkMode}
        />
      </View>

      {/* Floating Add Button (when has tasks and not showing shrink) */}
      {!hasNoTasks && !shrinkSuggestions && !showQuickAdd && (
        <AddTaskButton onPress={() => setShowQuickAdd(true)} />
      )}

      {/* Celebration Overlay */}
      <CelebrationOverlay
        visible={showCelebration}
        taskTitle={completedTaskTitle}
        streakCount={streak.currentStreak}
        onDismiss={handleDismissCelebration}
        darkMode={darkMode}
      />
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
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  textLight: {
    color: '#f9fafb',
  },
  textMuted: {
    color: '#9ca3af',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    color: '#f9fafb',
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },

  // Focus View
  focusView: {
    flex: 1,
    justifyContent: 'center',
  },
  focusHeader: {
    marginBottom: 12,
  },
  focusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskCardDark: {
    backgroundColor: '#1f2937',
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 32,
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 90,
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  shrinkButton: {
    backgroundColor: '#6366f1',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },

  // Shrink View
  shrinkView: {
    flex: 1,
  },
  shrinkContent: {
    paddingBottom: 24,
  },
  shrinkHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  shrinkTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
    textAlign: 'center',
  },
  encouragement: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  suggestionCardDark: {
    backgroundColor: '#1f2937',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  suggestionMotivation: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  suggestionMeta: {
    marginLeft: 12,
  },
  suggestionTime: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  cancelButtonDark: {
    opacity: 0.8,
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Floating Add Button
  floatingAddButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#6366f1',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Quick Add
  quickAddContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  quickAddContainerDark: {
    backgroundColor: '#1f2937',
  },
  quickAddInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
  },
  quickAddButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  quickAddCancel: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quickAddCancelText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  quickAddSubmit: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  quickAddSubmitDisabled: {
    opacity: 0.5,
  },
  quickAddSubmitText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },

  // Celebration Overlay
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  celebrationContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
    maxWidth: 320,
  },
  celebrationContentDark: {
    backgroundColor: '#1f2937',
  },
  checkmark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkmarkDark: {
    backgroundColor: '#064e3b',
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  celebrationTask: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  streakBadgeDark: {
    backgroundColor: '#78350f',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b45309',
  },
  streakTextDark: {
    color: '#fef3c7',
  },
});
