// Add Lot screen - form for creating new coffee lots

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createLot, createActor, addToCollection } from '../src/database/operations';
import type { ProcessingMethod } from '../src/models/types';

const PROCESSING_OPTIONS: { value: ProcessingMethod; label: string }[] = [
  { value: 'washed', label: 'Washed' },
  { value: 'natural', label: 'Natural' },
  { value: 'honey', label: 'Honey' },
  { value: 'anaerobic', label: 'Anaerobic' },
  { value: 'carbonic', label: 'Carbonic Maceration' },
  { value: 'experimental', label: 'Experimental' },
];

export default function AddLotScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [lotCode, setLotCode] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [farm, setFarm] = useState('');
  const [altitude, setAltitude] = useState('');
  const [processingMethod, setProcessingMethod] = useState<ProcessingMethod>('washed');
  const [producerName, setProducerName] = useState('');

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a lot name');
      return;
    }
    if (!variety.trim()) {
      Alert.alert('Required', 'Please enter a coffee variety');
      return;
    }
    if (!country.trim() || !region.trim()) {
      Alert.alert('Required', 'Please enter country and region');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create producer actor if name provided
      let producerId: string | undefined;
      if (producerName.trim()) {
        const producer = await createActor({
          name: producerName.trim(),
          role: 'producer',
          location: {
            country: country.trim(),
            region: region.trim(),
          },
        });
        producerId = producer.id;
      }

      // Create the lot
      const lot = await createLot({
        name: name.trim(),
        variety: variety.trim(),
        lotCode: lotCode.trim() || undefined,
        processingMethod,
        currentState: 'harvested',
        origin: {
          country: country.trim(),
          region: region.trim(),
          farm: farm.trim() || undefined,
          altitude: altitude ? parseInt(altitude, 10) : undefined,
        },
        currentHolderId: producerId,
      });

      // Add to user's collection
      await addToCollection(lot.id);

      Alert.alert('Success', 'Lot added to your collection', [
        { text: 'OK', onPress: () => router.push('/') },
      ]);
    } catch (err) {
      console.error('Failed to create lot:', err);
      Alert.alert('Error', 'Failed to create lot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Add New Lot</Text>
        <Text style={styles.subtitle}>Enter details about this coffee</Text>
      </View>

      {/* Basic Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.field}>
          <Text style={styles.label}>Lot Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., El Paraíso Gesha Lot 42"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Variety *</Text>
          <TextInput
            style={styles.input}
            value={variety}
            onChangeText={setVariety}
            placeholder="e.g., Gesha, Bourbon, Caturra"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Lot Code</Text>
          <TextInput
            style={styles.input}
            value={lotCode}
            onChangeText={setLotCode}
            placeholder="Producer's lot identifier"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Origin Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Origin</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Country *</Text>
          <TextInput
            style={styles.input}
            value={country}
            onChangeText={setCountry}
            placeholder="e.g., Colombia, Ethiopia, Kenya"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Region *</Text>
          <TextInput
            style={styles.input}
            value={region}
            onChangeText={setRegion}
            placeholder="e.g., Huila, Yirgacheffe, Nyeri"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Farm</Text>
          <TextInput
            style={styles.input}
            value={farm}
            onChangeText={setFarm}
            placeholder="Farm or estate name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Altitude (masl)</Text>
          <TextInput
            style={styles.input}
            value={altitude}
            onChangeText={setAltitude}
            placeholder="e.g., 1850"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Processing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Processing</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Processing Method *</Text>
          <View style={styles.optionsGrid}>
            {PROCESSING_OPTIONS.map(option => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  processingMethod === option.value && styles.optionButtonActive,
                ]}
                onPress={() => setProcessingMethod(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    processingMethod === option.value && styles.optionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Producer Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Producer (Optional)</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Producer Name</Text>
          <TextInput
            style={styles.input}
            value={producerName}
            onChangeText={setProducerName}
            placeholder="Farmer or cooperative name"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Pressable
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Adding...' : 'Add to Collection'}
          </Text>
        </Pressable>
      </View>

      {/* Bottom spacer */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionButtonActive: {
    backgroundColor: '#2C1810',
    borderColor: '#2C1810',
  },
  optionText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#fff',
  },
  submitContainer: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#2C1810',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
