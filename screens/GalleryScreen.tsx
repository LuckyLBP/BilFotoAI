import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { useImageContext } from '../context/ImageContext';
import { LinearGradient } from 'expo-linear-gradient';
import ImageModal from '../components/ImageModal';

export default function GalleryScreen() {
  const { images, folders } = useImageContext();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filtrera ut bilder baserat på mapp
  const displayedImages = selectedFolder
    ? images.filter((img) => img.folderName === selectedFolder)
    : images;

  // Öppna modal för att visa en bild
  const handleImagePress = (uri: string) => {
    setSelectedImage(uri);
  };

  // Stäng modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.container}>
      <Text style={styles.title}>Galleri</Text>

      {folders.length > 0 ? (
        <View style={styles.folderContainer}>
          <FlatList
            data={folders}
            horizontal
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.folderChip,
                  selectedFolder === item && styles.selectedChip,
                ]}
                onPress={() =>
                  setSelectedFolder(item === selectedFolder ? null : item)
                }
              >
                <Text style={styles.folderChipText}>{item}</Text>
              </Pressable>
            )}
            style={styles.folderList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ) : (
        <Text style={styles.noFolders}>Inga mappar ännu</Text>
      )}

      <FlatList
        data={displayedImages}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.imagePair}>
            <View style={styles.imageContainer}>
              <Text style={styles.label}>Före</Text>
              <Image
                source={{ uri: item.beforeUri }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <Pressable
              style={styles.imageContainer}
              onPress={() => handleImagePress(item.afterUri)}
            >
              <Text style={styles.label}>Efter</Text>
              <Image
                source={{ uri: item.afterUri }}
                style={styles.image}
                resizeMode="cover"
              />
            </Pressable>
          </View>
        )}
        contentContainerStyle={
          displayedImages.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Inga bilder här ännu</Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {selectedImage && (
        <ImageModal
          visible={!!selectedImage}
          imageUri={selectedImage}
          onClose={closeModal}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    paddingTop: 40,
  },
  folderContainer: {
    marginBottom: 20,
  },
  folderList: {
    flexGrow: 0,
  },
  folderChip: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  folderChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedChip: {
    backgroundColor: '#FF8A50',
  },
  noFolders: {
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  imagePair: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  imageContainer: {
    alignItems: 'center',
    width: '50%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  image: {
    width: 160,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
