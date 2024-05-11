import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { firebase } from "../../firebaseConfig";

const ImportedImage = ({ route }) => {
  const { imageUri } = route.params;
  const [imageUrl, setImageUrl] = useState(imageUri); // Start with passed imageUri
  const [loading, setLoading] = useState(false); // To display loading indicator

  useEffect(() => {
    const fetchImageFromFirestore = async () => {
      if (!imageUrl) { // Only fetch if not passed directly from upload
        setLoading(true); 
        try {
          const user = firebase.auth().currentUser;
          if (user) {
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().image) {
              setImageUrl(userDoc.data().image);
            } 
          }
        } catch (error) {
          console.error('Error fetching image:', error);
          // Handle errors (e.g., show error message)
        } finally {
          setLoading(false);
        }
      }
    };

    fetchImageFromFirestore();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <SafeAreaView style={importedStyles.container}>
        <View style={importedStyles.headerContainer}>
        <Text style={importedStyles.headerText}>Records Repository</Text>
        <Text style={importedStyles.subHeaderText}>View all your medical records</Text>
      </View>
      <View style={importedStyles.imageContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Image source={{ uri: imageUrl }} style={importedStyles.image} /> 
        )}
      </View>
    </SafeAreaView>
  );
};

const importedStyles = StyleSheet.create({
    headerContainer: {
        alignItems: 'center', 
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white', // Adjust color as needed
    },
    subHeaderText: {
        fontSize: 16,
        color: 'lightgray', // Adjust color as needed
    },
    container: {
        flex: 1,
        backgroundColor: '#666566',
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
});

export default ImportedImage;
