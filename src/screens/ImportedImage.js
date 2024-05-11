import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, SafeAreaView, ActivityIndicator, Text, ImageBackground, FlatList } from 'react-native';
import { firebase } from "../../firebaseConfig";

const ImportedImage = ({ route }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // Handle errors (consider showing an error message to the user)
      } finally {
        setLoading(false); // Data fetching is complete
      }
    };

    fetchImagesFromFirestore();
  }, []);

  const renderItem = ({ item }) => (
    <Image source={{ uri: item }} style={importedStyles.galleryImage} />
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
            numColumns={2} // 2 columns for a gallery-like layout
            contentContainerStyle={importedStyles.galleryContainer}
          />
        ) : (
          <Text style={importedStyles.noImagesText}>No images found</Text>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const importedStyles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'contain' depending on your preference
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
        flex: 1
    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '90%', 
        height: '90%',
        resizeMode: 'contain',
    },
    galleryContainer: {
        padding: 10,
      },
      galleryImage: {
        width: '45%', // Adjust as needed for spacing
        height: 200, // Adjust as needed
        margin: 10,
        resizeMode: 'cover', // Or 'contain' if you don't want to crop
      },
      noImagesText: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 20,
      }
});

export default ImportedImage;
