import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCameraOverlay } from '../hooks/useCameraOverlay';

interface CameraComponentProps {
  onClose: () => void;
  onPhotoCapture: (photos: Record<string, string>) => void;
}

export default function CameraComponent({
  onClose,
  onPhotoCapture,
}: CameraComponentProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );

  // Use Dimensions to get current screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Använd kamerahook för att hantera bilvinklar
  const {
    currentAngle,
    totalAngles,
    currentAngleIndex,
    goToNextAngle,
    markAsDone,
  } = useCameraOverlay((photos) => {
    onPhotoCapture(photos);
    onClose();
  });

  // Enhanced orientation detection that combines both ScreenOrientation and Dimensions
  useEffect(() => {
    // Function to determine orientation based on screen dimensions
    const determineOrientation = () => {
      const { width, height } = Dimensions.get('window');
      if (width > height) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    // Set initial orientation
    determineOrientation();

    // Add dimension change listener
    const dimensionSubscription = Dimensions.addEventListener(
      'change',
      determineOrientation
    );

    // Add screen orientation listener as backup
    const orientationSubscription =
      ScreenOrientation.addOrientationChangeListener(() => {
        // Small delay to ensure Dimensions has updated
        setTimeout(determineOrientation, 50);
      });

    // Unlock screen orientation to allow rotation
    ScreenOrientation.unlockAsync();

    return () => {
      // Clean up all listeners
      dimensionSubscription.remove();
      ScreenOrientation.removeOrientationChangeListener(
        orientationSubscription
      );
    };
  }, []);

  // Ta en bild
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          exif: true, // Include EXIF data for proper orientation
        });
        if (photo) {
          goToNextAngle(photo.uri);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Fel', 'Kunde inte ta bilden. Försök igen.');
      }
    }
  };

  // Helper functions for UI actions with console logging for debugging
  const handleClosePress = () => {
    console.log('Close button pressed');
    onClose();
  };

  const handleCapturePress = () => {
    console.log('Capture button pressed');
    takePicture();
  };

  const handleDonePress = () => {
    console.log('Done button pressed');
    markAsDone();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Begär kameraåtkomst...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Ingen åtkomst till kameran</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Ge åtkomst</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={'back'} ref={cameraRef}>
        {/* Overlay image */}
        <Image
          source={currentAngle.overlayImage}
          style={styles.overlay}
          resizeMode="contain"
        />

        {/* Debug info - remove in production */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            {orientation} ({screenWidth}x{screenHeight})
          </Text>
        </View>

        {/* Angle indicator */}
        <View
          style={
            orientation === 'portrait'
              ? styles.angleIndicator
              : styles.angleIndicatorLandscape
          }
        >
          <Text style={styles.angleText}>
            {currentAngle.label} ({currentAngleIndex + 1}/{totalAngles})
          </Text>
        </View>

        {/* Control buttons positioned above the overlay */}
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {/* Camera controls (close and capture) */}
          <View
            style={
              orientation === 'portrait'
                ? styles.controlsContainer
                : styles.controlsContainerLandscape
            }
          >
            <TouchableOpacity
              style={styles.button}
              onPress={handleClosePress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapturePress}
              activeOpacity={0.7}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>

          {/* Done button - always visible in both orientations */}
          <TouchableOpacity
            style={
              orientation === 'portrait'
                ? styles.doneButtonContainer
                : styles.doneButtonContainerLandscape
            }
            onPress={handleDonePress}
            activeOpacity={0.7}
          >
            <View style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Klar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#03A9F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  angleIndicator: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
  },
  angleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  doneButtonContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    zIndex: 1000,
  },
  doneButtonContainerLandscape: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 1000,
  },
  angleIndicatorLandscape: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    zIndex: 100,
  },
  controlsContainerLandscape: {
    position: 'absolute',
    right: 30,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    zIndex: 1000,
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    borderRadius: 5,
    zIndex: 1000,
  },
  debugText: {
    color: 'yellow',
    fontSize: 10,
  },
});
