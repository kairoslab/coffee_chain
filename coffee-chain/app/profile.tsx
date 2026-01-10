// Profile screen - user settings and role selection

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
import type { ActorRole } from '../src/models/types';
import { ROLE_LABELS, ROLE_ICONS } from '../src/utils/formatting';

const ROLES: ActorRole[] = [
  'producer',
  'processor',
  'exporter',
  'importer',
  'roaster',
  'retailer',
  'consumer',
];

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<ActorRole>('consumer');
  const [location, setLocation] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    Alert.alert('Saved', 'Your profile has been updated');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {name ? name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>
          Define your role in the coffee supply chain
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>
        
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name or business name"
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Role</Text>
        <Text style={styles.sectionSubtitle}>
          Select your primary position in the coffee value chain
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
                  styles.roleLabel,
                  selectedRole === role && styles.roleLabelActive,
                ]}
              >
                {ROLE_LABELS[role]}
              </Text>
              {selectedRole === role && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.roleDescription}>
          {getRoleDescription(selectedRole)}
        </Text>
      </View>

      <View style={styles.saveContainer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </Pressable>
      </View>

      <View style={styles.appInfo}>
        <Text style={styles.appName}>CoffeeChain</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.appTagline}>Transparency from farm to cup</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function getRoleDescription(role: ActorRole): string {
  const descriptions: Record<ActorRole, string> = {
    producer: 'You grow and harvest coffee cherries. You can add cultivation notes, harvest details, and set farmgate prices for your lots.',
    processor: 'You process coffee cherries into green beans. You can document processing methods, drying times, and quality metrics.',
    exporter: 'You source and export green coffee. You can record FOB prices, shipping details, and connect producers to importers.',
    importer: 'You import green coffee to consuming countries. You can track shipments, CIF prices, and quality upon arrival.',
    roaster: 'You roast green coffee. You can add roast profiles, cupping notes, and retail pricing for your roasted lots.',
    retailer: 'You sell roasted coffee to consumers. You can set retail prices and connect customers to the full supply chain.',
    consumer: 'You enjoy drinking coffee. You can track your collection, add brew notes, and discover the stories behind your coffee.',
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
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2C1810',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
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
    paddingHorizontal: 14,
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
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roleCardActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  roleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  roleLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  roleLabelActive: {
    fontWeight: '600',
    color: '#1f2937',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
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
  appInfo: {
    alignItems: 'center',
    padding: 24,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C1810',
  },
  appVersion: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  appTagline: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
