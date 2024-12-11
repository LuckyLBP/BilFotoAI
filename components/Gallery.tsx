import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ProcessedImage } from '../types/ProcessImage';
import GalleryItem from './GalleryItem';

interface GalleryProps {
  images: ProcessedImage[];
  onSelectAfterImage: (uri: string) => void;
}

export default function Gallery({ images, onSelectAfterImage }: GalleryProps) {
  return (
    <FlatList
      data={images}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={({ item }) => (
        <GalleryItem
          beforeUri={item.beforeUri}
          afterUri={item.afterUri}
          onPressAfter={() => onSelectAfterImage(item.afterUri)}
        />
      )}
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    paddingHorizontal: 10,
  },
  contentContainer: {
    paddingBottom: 30,
  },
});
