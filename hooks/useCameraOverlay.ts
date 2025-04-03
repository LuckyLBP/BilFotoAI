import { useState } from 'react';

export type CarAngle = {
  id: string;
  label: string;
  overlayImage: any;
};

export function useCameraOverlay(
  onComplete: (capturedPhotos: Record<string, string>) => void
) {
  // Bilvinklar
  const carAngles: CarAngle[] = [
    {
      id: 'front',
      label: 'Fram',
      overlayImage: require('../assets/overlays/car-front.png'),
    },
    {
      id: 'side-driver',
      label: 'Förarsida',
      overlayImage: require('../assets/overlays/car-side-driver.png'),
    },
    {
      id: 'interior',
      label: 'Interiör',
      overlayImage: require('../assets/overlays/car-interior.png'),
    },
    {
      id: 'rear',
      label: 'Bak',
      overlayImage: require('../assets/overlays/car-rear.png'),
    },
    {
      id: 'side',
      label: 'Sida',
      overlayImage: require('../assets/overlays/car-rear.png'),
    },
    {
      id: 'rear-side',
      label: 'Baksida',
      overlayImage: require('../assets/overlays/car-rear-angle.png'),
    },
  ];

  // Status för kameravyn
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, string>>(
    {}
  );

  const currentAngle = carAngles[currentAngleIndex];
  const totalAngles = carAngles.length;
  const isLastAngle = currentAngleIndex === carAngles.length - 1;

  // Gå till nästa vinkel
  const goToNextAngle = (photoUri?: string) => {
    if (photoUri) {
      setCapturedPhotos((prev) => ({
        ...prev,
        [currentAngle.id]: photoUri,
      }));
    }

    if (isLastAngle) {
      onComplete({
        ...capturedPhotos,
        ...(photoUri ? { [currentAngle.id]: photoUri } : {}),
      });
    } else {
      setCurrentAngleIndex(currentAngleIndex + 1);
    }
  };

  // Försök igen med aktuell vinkel (efter fel)
  const retryCurrentAngle = () => {
    // Behåll samma vinkel men ta bort eventuell tidigare bild
    setCapturedPhotos((prev) => {
      const updated = { ...prev };
      delete updated[currentAngle.id];
      return updated;
    });
  };

  // Markera som komplett
  const markAsDone = () => {
    onComplete(capturedPhotos);
  };

  // Gå till föregående vinkel
  const goToPreviousAngle = () => {
    if (currentAngleIndex > 0) {
      setCurrentAngleIndex(currentAngleIndex - 1);
    }
  };

  return {
    currentAngle,
    totalAngles,
    currentAngleIndex,
    isLastAngle,
    capturedPhotos,
    goToNextAngle,
    goToPreviousAngle,
    markAsDone,
    retryCurrentAngle,
  };
}
