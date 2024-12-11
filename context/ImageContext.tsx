import React, { createContext, useState, useContext } from 'react';
import { ProcessedImage } from '../types/ProcessImage';

type ImageContextType = {
  images: ProcessedImage[];
  addImage: (image: ProcessedImage) => void;
  folders: string[];
  addFolder: (folderName: string) => void;
};

const ImageContext = createContext<ImageContextType>({
  images: [],
  addImage: () => {},
  folders: [],
  addFolder: () => {},
});

export const ImageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [folders, setFolders] = useState<string[]>([]);

  // Lägg till en bild i listan
  const addImage = (image: ProcessedImage) => {
    setImages((prev) => [image, ...prev]);
  };

  // Lägg till en mapp i listan
  const addFolder = (folderName: string) => {
    if (!folders.includes(folderName)) {
      setFolders((prev) => [...prev, folderName]);
    }
  };

  return (
    <ImageContext.Provider value={{ images, addImage, folders, addFolder }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);
