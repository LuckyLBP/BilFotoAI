import React from 'react';
import {
  View,
  Modal,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import CustomButton from './CustomButton';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface ImageModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

export default function ImageModal({
  visible,
  imageUri,
  onClose,
}: ImageModalProps) {
  const onSave = async () => {
    if (!imageUri) {
      Alert.alert('Ingen bild', 'Det finns ingen bild att spara.');
      return;
    }

    console.log('Image URI:', imageUri);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Behörighet nekad',
          'Appen har inte behörighet att spara bilder.'
        );
        return;
      }

      let uriToSave = imageUri;

      // Bilden kommer från en base64-sträng
      if (!uriToSave.match(/\.\w+$/)) {
        console.log('Creating file with extension...');
        const tempUri = `${FileSystem.cacheDirectory}image.png`;
        await FileSystem.writeAsStringAsync(
          tempUri,
          uriToSave.replace(/^data:image\/\w+;base64,/, ''),
          {
            encoding: FileSystem.EncodingType.Base64,
          }
        );
        uriToSave = tempUri;
        console.log('Temporary file created at:', tempUri);
      }

      // Spara bilden
      const asset = await MediaLibrary.createAssetAsync(uriToSave);
      await MediaLibrary.createAlbumAsync('BilFotoAI', asset, false);
      Alert.alert('Lyckat!', 'Bilden sparades till galleriet.');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Fel', 'Ett fel uppstod vid sparande av bilden.');
    }
  };

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              )}
              <View style={styles.buttonRow}>
                <CustomButton
                  title="Stäng"
                  onPress={onClose}
                  backgroundColor="#F44336"
                  style={{ flex: 1, marginRight: 10 }}
                />
                <CustomButton
                  title="Spara till Galleri"
                  onPress={onSave}
                  backgroundColor="#8BC34A"
                  style={{ flex: 1, marginLeft: 10 }}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderRadius: 20,
  },
  modalImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
