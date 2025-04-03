import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  SectionList,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useImageContext } from '../context/ImageContext';
import { LinearGradient } from 'expo-linear-gradient';
import ImageModal from '../components/ImageModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

// Interface for section data structure
interface Section {
  title: string;
  data: Array<{
    beforeUri: string;
    afterUri: string;
    folderName: string;
  }>;
}

export default function GalleryScreen() {
  const { images, folders } = useImageContext();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savingFolder, setSavingFolder] = useState<string | null>(null);

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showMessage('Åtkomst till bildbiblioteket nekad');
      }
    })();
  }, []);

  // Helper function to show messages across platforms
  const showMessage = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Meddelande', message);
    }
  };

  // Check if the URI is a base64 data URI
  const isBase64DataUri = (uri: string): boolean => {
    return uri.startsWith('data:');
  };

  // Convert a base64 data URI to a file URI
  const saveBase64ToFile = async (dataUri: string): Promise<string> => {
    try {
      const base64Data = dataUri.split(',')[1]; // Remove the data:image/xxx;base64, part
      const fileType = dataUri.split(';')[0].split(':')[1] || 'image/jpeg';
      const fileExtension = fileType.split('/')[1] || 'jpg';

      const fileName = `${
        FileSystem.cacheDirectory
      }temp-${Date.now()}.${fileExtension}`;

      await FileSystem.writeAsStringAsync(fileName, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return fileName;
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      throw error;
    }
  };

  // Save all images in a folder to library
  const handleSaveAllImages = async (
    folderName: string,
    folderImages: any[]
  ) => {
    setSavingFolder(folderName);

    try {
      let savedCount = 0;

      // Request permissions again just to be sure
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showMessage('Behörighet saknas för att spara bilder');
        setSavingFolder(null);
        return;
      }

      // Save each image in the folder
      for (const img of folderImages) {
        try {
          let fileUri = img.afterUri;

          // If the image is a base64 data URI, convert it to a file first
          if (isBase64DataUri(fileUri)) {
            fileUri = await saveBase64ToFile(fileUri);
          }

          // Now we have a file URI that MediaLibrary can work with
          const asset = await MediaLibrary.createAssetAsync(fileUri);

          // Optionally create an album and add to it
          const album = await MediaLibrary.getAlbumAsync('BilFotoAI');
          if (album === null) {
            await MediaLibrary.createAlbumAsync('BilFotoAI', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }

          savedCount++;
        } catch (error) {
          console.error(`Failed to save image:`, error);
          // You can log the URI to help with debugging, but truncate it for readability
          const logUri = img.afterUri.substring(0, 50) + '...';
          console.error(`URI that failed: ${logUri}`);
        }
      }

      showMessage(
        `${savedCount} av ${folderImages.length} bilder sparade i albumet "BilFotoAI"`
      );
    } catch (error) {
      console.error('Error saving images:', error);
      showMessage('Ett fel uppstod när bilderna skulle sparas');
    } finally {
      setSavingFolder(null);
    }
  };

  // Filtrera mappar baserat på sökfrågan
  const filteredFolders = folders.filter((folder) =>
    folder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Organisera bilder i sektioner
  const imageSections = useMemo(() => {
    if (selectedFolder) {
      // Om en specifik mapp är vald, filtrera bilderna
      const folderImages = images.filter(
        (img) => img.folderName === selectedFolder
      );
      return folderImages.length > 0
        ? [{ title: selectedFolder, data: folderImages }]
        : [];
    } else {
      // Gruppera bilderna efter mappnamn
      const sections: Section[] = [];
      const folderMap = new Map<string, typeof images>();

      // Gruppar bilderna i mappar
      images.forEach((img) => {
        if (!folderMap.has(img.folderName)) {
          folderMap.set(img.folderName, []);
        }
        folderMap.get(img.folderName)?.push(img);
      });

      // Konvertera mapparna till sektioner
      folderMap.forEach((folderImages, folderName) => {
        sections.push({
          title: folderName,
          data: folderImages,
        });
      });

      // Sortera sektionerna alfabetiskt
      return sections.sort((a, b) => a.title.localeCompare(b.title));
    }
  }, [images, selectedFolder]);

  // Öppna modal för att visa en bild
  const handleImagePress = (uri: string) => {
    setSelectedImage(uri);
  };

  // Stäng modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  // Rendera varje bildpar
  const renderImagePair = ({ item }: any) => (
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
  );

  // Rendera sektionens rubrik
  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeaderContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon
            name="folder"
            size={20}
            color="#FF5722"
            style={styles.folderIcon}
          />
          <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>

        <Pressable
          style={styles.saveButton}
          onPress={() => handleSaveAllImages(section.title, section.data)}
          disabled={savingFolder === section.title}
        >
          {savingFolder === section.title ? (
            <Icon
              name="sync"
              size={22}
              color="#FFFFFF"
              style={styles.spinningIcon}
            />
          ) : (
            <Icon name="save-alt" size={22} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.container}>
      <Text style={styles.title}>Galleri</Text>

      {folders.length > 0 ? (
        <View style={styles.folderContainer}>
          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size={20}
              color="#FFFFFF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Sök mappar..."
              placeholderTextColor="#CCCCCC"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery !== '' && (
              <Pressable
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Icon name="clear" size={18} color="#FFFFFF" />
              </Pressable>
            )}
          </View>

          <FlatList
            data={filteredFolders}
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
                <View style={styles.chipContent}>
                  {selectedFolder === item && (
                    <Icon
                      name="check-circle"
                      size={16}
                      color="#FFFFFF"
                      style={styles.checkIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.folderChipText,
                      selectedFolder === item && styles.selectedChipText,
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              </Pressable>
            )}
            style={styles.folderList}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.noSearchResults}>Inga matchande mappar</Text>
            }
          />
        </View>
      ) : (
        <Text style={styles.noFolders}>Inga mappar ännu</Text>
      )}

      <SectionList
        sections={imageSections}
        keyExtractor={(item, index) => item.folderName + index}
        renderItem={renderImagePair}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={
          imageSections.length === 0
            ? styles.emptyContainer
            : styles.sectionListContent
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Inga bilder här ännu</Text>
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  folderList: {
    flexGrow: 0,
  },
  folderChip: {
    backgroundColor: 'rgba(255, 87, 34, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  folderChipText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  selectedChip: {
    backgroundColor: '#FF5722',
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  selectedChipText: {
    fontWeight: '700',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    marginRight: 5,
  },
  noFolders: {
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  noSearchResults: {
    color: '#FFFFFF',
    fontStyle: 'italic',
    fontSize: 14,
    paddingHorizontal: 20,
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
  sectionListContent: {
    paddingBottom: 20,
  },
  sectionHeaderContainer: {
    backgroundColor: 'rgba(106, 17, 203, 0.8)', // Match gradient with some transparency
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 87, 34, 0.9)',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinningIcon: {
    // In a real app, you would add an animation here
    opacity: 0.7,
  },
  sectionHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  folderIcon: {
    marginRight: 8,
  },
});
