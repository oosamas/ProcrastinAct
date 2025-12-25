import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Icon name="person" size={48} color="#6366f1" />
          </View>
          <Text style={styles.greeting}>Welcome!</Text>
          <Text style={styles.subtitle}>
            Your journey to better task initiation starts here.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="flame-outline" size={32} color="#f97316" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="checkmark-circle-outline" size={32} color="#22c55e" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="time-outline" size={32} color="#6366f1" />
            <Text style={styles.statValue}>0h</Text>
            <Text style={styles.statLabel}>Focus Time</Text>
          </View>
        </View>

        <View style={styles.encouragement}>
          <Text style={styles.encouragementText}>
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
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
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
