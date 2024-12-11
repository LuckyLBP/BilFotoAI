import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface GalleryItemProps {
  beforeUri: string;
  afterUri: string;
  onPressAfter: () => void;
}

export default function GalleryItem({ beforeUri, afterUri, onPressAfter }: GalleryItemProps) {
  return (
    <View style={styles.imagePair}>
      <View style={styles.imageContainer}>
        <Text style={styles.label}>Före</Text>
        <Image source={{ uri: beforeUri }} style={styles.image} resizeMode="contain" />
      </View>
      <TouchableOpacity style={styles.imageContainer} onPress={onPressAfter}>
        <Text style={styles.label}>Efter (tryck för att öppna)</Text>
        <Image source={{ uri: afterUri }} style={styles.image} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  imagePair: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  imageContainer: {
    alignItems: 'center',
    width: '45%',
  },
  label: {
    marginBottom: 5,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 15,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
  },
});
