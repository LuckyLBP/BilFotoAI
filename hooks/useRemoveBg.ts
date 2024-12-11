import { useEffect, useState } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-asset';

const API_KEY = 'aay9Lpk91psu5LSvMhMtyoCk';
const REMOVE_BG_URL = 'https://api.remove.bg/v1.0/removebg';

export default function useRemoveBg() {
  const [backgroundUri, setBackgroundUri] = useState<string | null>(null);
  const [mediaLibraryGranted, setMediaLibraryGranted] = useState(false);

  // Ladda in bakgrundsbilden
  useEffect(() => {
    (async () => {
      const asset = Asset.fromModule(require('../assets/background.jpg'));
      await asset.downloadAsync();
      setBackgroundUri(asset.localUri || asset.uri);
    })();

    // Kontrollera om användaren har gett åtkomst till bildbiblioteket
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryGranted(status === 'granted');
    })();
  }, []);

  // Fixa bilden med Remove.bg
  const processImage = async (beforeUri: string): Promise<string | null> => {
    if (!backgroundUri) {
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('image_file', {
        uri: beforeUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      formData.append('size', 'auto');
      formData.append('add_shadow', 'true');
      formData.append('bg_image_file', {
        uri: backgroundUri,
        type: 'image/png',
        name: 'background.png',
      } as any);

      const response = await axios.post(REMOVE_BG_URL, formData, {
        headers: {
          'X-Api-Key': API_KEY,
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer',
      });

      const buffer = response.data;
      const base64Image = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
      return base64Image;
    } catch (error: any) {
      console.error('Fel vid bearbetning av bilden:', error);
      return null;
    }
  };

  // Spara bild till biblioteket
  const saveImageToLibrary = async (imageDataUri: string) => {
    if (!mediaLibraryGranted) return false;

    try {
      const base64Data = imageDataUri.replace(/^data:image\/\w+;base64,/, '');
      const fileUri = `${FileSystem.cacheDirectory}processed.png`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.saveToLibraryAsync(fileUri);
      return true;
    } catch (err) {
      console.error('Fel vid sparande av bilden:', err);
      return false;
    }
  };

  return {
    processImage,
    saveImageToLibrary,
  };
}
