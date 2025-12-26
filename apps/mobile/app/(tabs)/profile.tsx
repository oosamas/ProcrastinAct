import { Text, View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import * as Haptics from 'expo-haptics';
import { useAppStore, useCompletedTasksCount } from '../../stores/app-store';

export default function ProfileScreen() {
  const streak = useAppStore((state) => state.streak);
  const darkMode = useAppStore((state) => state.darkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const completedTasksCount = useCompletedTasksCount();

  const handleToggleDarkMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleDarkMode();
  };

  return (
    <SafeAreaView
      style={[styles.container, darkMode && styles.containerDark]}
      edges={['bottom']}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.avatar, darkMode && styles.avatarDark]}>
            <Icon name="person" size={48} color="#6366f1" />
          </View>
          <Text style={[styles.greeting, darkMode && styles.textLight]}>
            Welcome!
          </Text>
          <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>
            Your journey to better task initiation starts here.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, darkMode && styles.statCardDark]}>
            <Icon name="flame-outline" size={32} color="#f97316" />
            <Text style={[styles.statValue, darkMode && styles.textLight]}>
              {streak.currentStreak}
            </Text>
            <Text style={[styles.statLabel, darkMode && styles.subtitleDark]}>
              Day Streak
            </Text>
          </View>
          <View style={[styles.statCard, darkMode && styles.statCardDark]}>
            <Icon name="checkmark-circle-outline" size={32} color="#22c55e" />
            <Text style={[styles.statValue, darkMode && styles.textLight]}>
              {completedTasksCount}
            </Text>
            <Text style={[styles.statLabel, darkMode && styles.subtitleDark]}>
              Tasks Done
            </Text>
          </View>
          <View style={[styles.statCard, darkMode && styles.statCardDark]}>
            <Icon name="trophy-outline" size={32} color="#6366f1" />
            <Text style={[styles.statValue, darkMode && styles.textLight]}>
              {streak.longestStreak}
            </Text>
            <Text style={[styles.statLabel, darkMode && styles.subtitleDark]}>
              Best Streak
            </Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, darkMode && styles.textMuted]}>
            Settings
          </Text>
          <View
            style={[styles.settingCard, darkMode && styles.settingCardDark]}
          >
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleToggleDarkMode}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Icon
                  name={darkMode ? 'moon' : 'sunny-outline'}
                  size={24}
                  color={darkMode ? '#fbbf24' : '#6b7280'}
                />
                <Text
                  style={[styles.settingLabel, darkMode && styles.textLight]}
                >
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
                thumbColor="#ffffff"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.encouragement}>
          <Text
            style={[styles.encouragementText, darkMode && styles.subtitleDark]}
          >
            Every small step counts. Progress, not perfection.
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
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarDark: {
    backgroundColor: '#312e81',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
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
    marginTop: 8,
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardDark: {
    backgroundColor: '#1f2937',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  // Settings
  settingsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingCardDark: {
    backgroundColor: '#1f2937',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },

  encouragement: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  encouragementText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
