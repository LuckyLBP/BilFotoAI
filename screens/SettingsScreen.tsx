import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  // Visa eller dölj meddelanden
  const toggleNotifications = () => setIsNotificationsEnabled(!isNotificationsEnabled);

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Inställningar</Text>

        <View style={styles.settingGroup}>
          <Text style={styles.settingItemTitle}>Namn</Text>
          <Text style={styles.settingItemValue}>Test Testsson</Text>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingItemTitle}>E-post</Text>
          <Text style={styles.settingItemValue}>test@test.com</Text>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingItemTitle}>Meddelanden</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isNotificationsEnabled ? '#4CAF50' : '#f4f3f4'}
            onValueChange={toggleNotifications}
            value={isNotificationsEnabled}
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingItemTitle}>App-version</Text>
          <Text style={styles.settingItemValue}>1.0.0</Text>
        </View>

        <Text style={styles.infoText}>Detta är bara dummy-inställningar.</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 40,
    color: '#FFFFFF',
  },
  settingGroup: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  settingItemValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    marginTop: 5,
  },
  infoText: {
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#DDD',
  },
});
