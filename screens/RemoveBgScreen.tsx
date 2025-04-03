import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import useRemoveBg from '../hooks/useRemoveBg';
import CustomButton from '../components/CustomButton';
import ProcessedImageModal from '../components/ProcessedImageModal';
import CameraComponent from '../components/CameraComponent';
import { ProcessedImage } from '../types/ProcessImage';

export default function RemoveBgScreen() {
  const { processImage } = useRemoveBg();
  const [currentProcessedImage, setCurrentProcessedImage] =
    useState<ProcessedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Välj bild
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Behörighet krävs',
        'Appen behöver åtkomst till ditt fotobibliotek för att välja bilder.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    // När användare har valt en bild
    if (!result.canceled && result.assets && result.assets.length > 0) {
      processSelectedImage(result.assets[0].uri);
    }
  };

  // Process the selected or captured image
  const processSelectedImage = async (imageUri: string) => {
    if (imageUri) {
      setIsLoading(true);
      const afterUri = await processImage(imageUri);
      setIsLoading(false);
      if (afterUri) {
        setCurrentProcessedImage({
          beforeUri: imageUri,
          afterUri,
          folderName: '',
        });
        Alert.alert('Lyckat!', 'Bilden bearbetades framgångsrikt!');
      } else {
        Alert.alert('Fel', 'Ett fel uppstod vid bearbetning av bilden.');
      }
    }
  };

  // Handle photo captured from camera
  const handlePhotoCapture = (imageUri: string) => {
    setShowCamera(false);
    processSelectedImage(imageUri);
  };

  // Stäng modal
  const closeModal = () => {
    setCurrentProcessedImage(null);
  };

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.container}>
      {showCamera ? (
        <CameraComponent
          onClose={() => setShowCamera(false)}
          onPhotoCapture={handlePhotoCapture}
        />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>BilFotoAI</Text>
            <Text style={styles.tagline}>Få dina bilder att sticka ut!</Text>
          </View>
          <View style={styles.body}>
            <CustomButton
              title="Välj Foto"
              onPress={pickImage}
              style={styles.button}
            />
            <CustomButton
              title="Öppna Kamera"
              onPress={() => setShowCamera(true)}
              style={styles.dummyButton}
            />
          </View>
        </>
      )}

      {currentProcessedImage && (
        <ProcessedImageModal
          visible={true}
          processedImage={currentProcessedImage}
          onClose={closeModal}
        />
      )}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Bearbetar bilden...</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#ddd',
    marginTop: 5,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#ff5722',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  dummyButton: {
    backgroundColor: '#03A9F4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});
