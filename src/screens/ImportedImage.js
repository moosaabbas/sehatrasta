import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, SafeAreaView, ActivityIndicator, Text, ImageBackground, FlatList, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { firebase } from "../../firebaseConfig";

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
    <TouchableOpacity onPress={() => handleImagePress(item)}>
      <Image source={{ uri: item }} style={importedStyles.galleryImage} />
    </TouchableOpacity>
  );

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
        paddingHorizontal: 10, // Adjusted padding for even spacing
      },
      galleryImage: {
        width: imageWidth,
        height: imageWidth, // Keeping aspect ratio square
        margin: 5,
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
      }
});

export default ImportedImage;

