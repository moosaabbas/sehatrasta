import React, { useState, useEffect } from 'react';
import { Alert, View, Image, StyleSheet, SafeAreaView, ActivityIndicator, Text, ImageBackground, FlatList, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { firebase } from "../../firebaseConfig";
import { Ionicons } from '@expo/vector-icons';


const ImportedImage = ({ route }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // State to track the selected image
  const [modalVisible, setModalVisible] = useState(false); // State to control the modal visibility

  useEffect(() => {
    const fetchImagesFromFirestore = async () => {
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists && userDoc.data().images) {
            setImages(userDoc.data().images);
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false); // Data fetching is complete
      }
    };

    fetchImagesFromFirestore();
  }, []);

  const handleImagePress = (imageUri) => {
    setSelectedImage(imageUri); // Set the selected image URI
    setModalVisible(true); // Show the modal
  };

  const renderItem = ({ item }) => (
    <View style={importedStyles.imageContainer}>
      <TouchableOpacity onPress={() => handleImagePress(item)}>
        <Image source={{ uri: item }} style={importedStyles.galleryImage} />
      </TouchableOpacity>
      <TouchableOpacity
        style={importedStyles.deleteButton}
        onPress={() => handleDeleteImage(item)}
      >
        <Ionicons name="close-circle" size={24} color="red" /> 
      </TouchableOpacity>
    </View>
  );

  const handleDeleteImage = async (imageUri) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this record?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const user = firebase.auth().currentUser;
              if (user) {
                // Update Firestore
                await firebase.firestore().collection('users').doc(user.uid).update({
                  images: firebase.firestore.FieldValue.arrayRemove(imageUri)
                });

                // Update local state
                setImages(images.filter(img => img !== imageUri)); 
              }
            } catch (error) {
              console.error("Error deleting image:", error);
            }
          }
        }
      ]
    );
  };

  return (
    <ImageBackground source={require('../assets/bg-med.jpg')} style={importedStyles.backgroundImage}>
      <SafeAreaView style={importedStyles.container}>
        <View style={importedStyles.headerContainer}>
            <Text style={importedStyles.headerText}>Records Repository</Text>
            <Text style={importedStyles.subHeaderText}>View all your medical records</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : images.length > 0 ? (
          <FlatList
            data={images}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2} 
            contentContainerStyle={importedStyles.galleryContainer}
          />
        ) : (
          <Text style={importedStyles.noImagesText}>No images found</Text>
        )}

        {/* Modal to display the selected image */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={importedStyles.modalContainer}>
            <Image source={{ uri: selectedImage }} style={importedStyles.modalImage} />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={importedStyles.closeButton}>
              <Text style={importedStyles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const screenWidth = Dimensions.get('window').width;
const imageWidth = (screenWidth - 40) / 2; // Adjusted width calculation with even spacing

const importedStyles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'contain' 
        justifyContent: 'center',
    },
    headerContainer: {
        alignItems: 'center', 
        marginBottom: 10,
    },
    headerText: {
        color: '#03161c',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 20
    },
    subHeaderText: {
        fontSize: 16,
        color: '#03161c'
    },
    container: {
        flex: 1,
        alignItems: 'center', // Center content horizontally
    },
    galleryContainer: {
        justifyContent: 'center', // Center content vertically

      },
      galleryImage: {
        width: imageWidth,
        height: imageWidth, // Keeping aspect ratio square
        margin: 1,
        resizeMode: 'cover', // Or 'contain' if you don't want to crop
      },
      noImagesText: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 20,
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Semi-transparent background for the modal
      },
      modalImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
      },
      closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 10,
      },
      closeButtonText: {
        fontSize: 16,
        color: '#000000',
      },
      imageContainer: { // New style for the image and delete button container
        position: 'relative', 
        margin: 5,
      },
      deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
      }
});

export default ImportedImage;

