// Profile screen - user profile and role selection

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { ROLE_LABELS, ROLE_ICONS } from '../src/utils/formatting';
import type { ActorRole } from '../src/models/types';

const ROLES: ActorRole[] = [
  'consumer',
  'roaster',
  'retailer',
  'importer',
  'exporter',
  'processor',
  'producer',
];

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<ActorRole>('consumer');
  const [location, setLocation] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    // In a real app, this would persist to storage/backend
    setIsSaved(true);
    Alert.alert('Saved', 'Your profile has been updated');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {name ? name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.roleLabel}>
          {ROLE_ICONS[selectedRole]} {ROLE_LABELS[selectedRole]}
        </Text>
      </View>

      {/* Name Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Information</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="City, Country"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Role Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Role in the Supply Chain</Text>
        <Text style={styles.sectionSubtitle}>
          Select how you participate in the coffee industry
        </Text>

        <View style={styles.rolesContainer}>
          {ROLES.map(role => (
            <Pressable
              key={role}
              style={[
                styles.roleCard,
                selectedRole === role && styles.roleCardActive,
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text style={styles.roleIcon}>{ROLE_ICONS[role]}</Text>
              <Text
                style={[
                  styles.roleName,
                  selectedRole === role && styles.roleNameActive,
                ]}
              >
                {ROLE_LABELS[role]}
              </Text>
              <Text style={styles.roleDescription}>
                {getRoleDescription(role)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About CoffeeChain</Text>
        <Text style={styles.aboutText}>
          CoffeeChain is built for transparency in the coffee supply chain. 
          Track lots from farm to cup, understand price distribution, and 
          connect with every actor in the chain.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Supply Chain Stages</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>∞</Text>
            <Text style={styles.statLabel}>Lots to Track</Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function getRoleDescription(role: ActorRole): string {
  const descriptions: Record<ActorRole, string> = {
    producer: 'Grow and harvest coffee',
    processor: 'Process cherry to green',
    exporter: 'Export green coffee',
    importer: 'Import to destination',
    roaster: 'Roast green to brown',
    retailer: 'Sell to consumers',
    consumer: 'Enjoy the final cup',
  };
  return descriptions[role];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#2C1810',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C1810',
  },
  roleLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  rolesContainer: {
    gap: 10,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  roleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  roleName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    width: 80,
  },
  roleNameActive: {
    color: '#92400e',
  },
  roleDescription: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
  },
  aboutText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C1810',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  saveContainer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#2C1810',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
