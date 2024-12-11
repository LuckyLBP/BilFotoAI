import React, { useState } from 'react';
import {
  View,
  Modal,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  Pressable,
  TextInput
} from 'react-native';
import CustomButton from './CustomButton';
import { ProcessedImage } from '../types/ProcessImage';
import { useImageContext } from '../context/ImageContext';

interface ProcessedImageModalProps {
  visible: boolean;
  processedImage: ProcessedImage;
  onClose: () => void;
}

export default function ProcessedImageModal({ visible, processedImage, onClose }: ProcessedImageModalProps) {
  const { folders, addFolder, addImage } = useImageContext();

  const [showFolderOptions, setShowFolderOptions] = useState<'NONE' | 'EXISTING' | 'NEW'>('NONE');
  const [newFolderName, setNewFolderName] = useState('');

  // Välj en befintlig mapp
  const handleSelectExistingFolder = (folderName: string) => {
    addImage({ ...processedImage, folderName });
    onClose();
  };

  // Skapa en ny mapp
  const handleCreateFolder = () => {
    if (newFolderName.trim() === '') return;
    addFolder(newFolderName.trim());
    addImage({ ...processedImage, folderName: newFolderName.trim() });
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              <Image source={{ uri: processedImage.afterUri }} style={styles.modalImage} resizeMode="contain" />
              {showFolderOptions === 'NONE' && (
                <View style={styles.initialButtons}>
                  <CustomButton
                    title="Lägg till i befintlig mapp"
                    onPress={() => setShowFolderOptions('EXISTING')}
                    backgroundColor="#8BC34A"
                    style={{ marginBottom: 10 }}
                  />
                  <CustomButton
                    title="Skapa ny mapp"
                    onPress={() => setShowFolderOptions('NEW')}
                    backgroundColor="#E91E63"
                  />
                </View>
              )}

              {showFolderOptions === 'EXISTING' && (
                <View style={styles.folderSelection}>
                  <Text style={styles.modalTitle}>Välj en mapp</Text>
                  {folders.length > 0 ? (
                    folders.map((f) => (
                      <Pressable key={f} style={styles.folderButton} onPress={() => handleSelectExistingFolder(f)}>
                        <Text style={styles.folderButtonText}>{f}</Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={styles.noFoldersText}>Inga mappar ännu</Text>
                  )}
                </View>
              )}

              {showFolderOptions === 'NEW' && (
                <View style={styles.newFolderContainer}>
                  <Text style={styles.modalTitle}>Skapa en ny mapp</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ange mappnamn"
                    value={newFolderName}
                    onChangeText={setNewFolderName}
                  />
                  <View style={styles.buttonRow}>
                    <CustomButton
                      title="Skapa"
                      onPress={handleCreateFolder}
                      backgroundColor="#8BC34A"
                      style={{ flex: 1, marginRight: 10 }}
                    />
                    <CustomButton
                      title="Avbryt"
                      onPress={() => setShowFolderOptions('NONE')}
                      backgroundColor="#F44336"
                      style={{ flex: 1, marginLeft: 10 }}
                    />
                  </View>
                </View>
              )}

              {showFolderOptions !== 'NONE' && (
                <CustomButton
                  title="Tillbaka"
                  onPress={() => setShowFolderOptions('NONE')}
                  backgroundColor="#9E9E9E"
                  style={{ marginTop: 20 }}
                />
              )}
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
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 20,
  },
  initialButtons: {
    width: '100%',
    alignItems: 'center',
  },
  folderSelection: {
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  folderButton: {
    backgroundColor: '#E91E63',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    width: '100%',
  },
  folderButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  noFoldersText: {
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 10,
  },
  newFolderContainer: {
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
