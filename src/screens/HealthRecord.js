import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { firebase } from "../../firebaseConfig";
import 'firebase/compat/firestore'; 
import 'firebase/compat/auth'; 
import 'firebase/compat/storage'; // Include for Firebase Storage
import { useNavigation } from '@react-navigation/native';

const UploadMediaFile = () => {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setImage(result.assets[0].uri);
        }
    };

    const navigation = useNavigation();

    const navigateToImportedImage = async () => {
        if (image) { // If the user has selected an image, navigate immediately
            navigation.navigate('ImportedImage', { imageUri: image });
            return; // Exit the function early
        }

        try {
            const user = firebase.auth().currentUser;
            if (user) {
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                if (userDoc.exists && userDoc.data().image) { 
                    navigation.navigate('ImportedImage', { imageUri: userDoc.data().image });
                } else {
                    Alert.alert('No Image Found', 'You have not uploaded any images yet.');
                }
            }
        } catch (error) {
            console.error('Error fetching image:', error);
            Alert.alert('Error', 'An error occurred while fetching your image.');
        }
    };


    const uploadMedia = async () => {
        setUploading(true);

        try {
            const { uri } = await FileSystem.getInfoAsync(image);
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = async () => { resolve(xhr.response); };
                xhr.onerror = (e) => { reject(new TypeError('Network request failed')); };
                xhr.responseType = 'blob';
                xhr.open('GET', uri, true);
                xhr.send(null);
            });

            const filename = image.substring(image.lastIndexOf('/') + 1);
            const storageRef = firebase.storage().ref().child(filename); 
            const snapshot = await storageRef.put(blob);
            const downloadURL = await snapshot.ref.getDownloadURL();

            const user = firebase.auth().currentUser;
            if (user) {
                const userDocRef = firebase.firestore().collection('users').doc(user.uid);
                await userDocRef.update({ image: downloadURL });
                setUploading(false);
                Alert.alert('Photo Uploaded!!');
                setImage(null);
            } else {
                console.error('No user is logged in.');
            }
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };
 
    return (
 
 
        <SafeAreaView style={styles.container}>
 
 
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Upload Medical Record</Text>
                <Text style={styles.subHeaderText}>Choose an image to upload</Text>
            </View>
 
 
            <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
                <Text style={styles.buttonText}>Pick an Image</Text>
            </TouchableOpacity>
 
 
            <View style={styles.imageContainer}>
                {image && <Image
                    source={{ uri: image }}
                    style={{ width: 300, height: 300 }}
                />}
 
 
            <TouchableOpacity style={styles.uploadButton} onPress={uploadMedia}>
                <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.importButton} onPress={navigateToImportedImage}>
                <Text style={styles.buttonText}>Import</Text>
            </TouchableOpacity>
 
            </View>
        </SafeAreaView>
    );
 };
 
 const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#666566',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subHeaderText: {
        color: '#fff',
        fontSize: 16,
    },
    selectButton: {
        borderRadius: 10, // Increased border radius for a smoother look
        width: 200, // Slightly wider button
        height: 50, // Reduced height for a more compact design
        backgroundColor: '#9c0309', // Changed to a brighter red color
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: '#000', // Added shadow for depth
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, // Elevation for Android shadow
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    uploadButton: {
        borderRadius: 10, // Increased border radius for a smoother look
        width: 200, // Slightly wider button
        height: 50, // Reduced height for a more compact design
        backgroundColor: '#0062ff', // Changed to a brighter red color
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: '#000', // Added shadow for depth
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, // Elevation for Android shadow
      },     
    imageContainer: {
        marginTop: 30,
        marginBottom: 50,
        alignItems: 'center'
    },
    importButton: {
        borderRadius: 10,
        width: 200,
        height: 50,
        backgroundColor: '#4CAF50', // Green color for the import button
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }

 });
 
 export default UploadMediaFile;
 
