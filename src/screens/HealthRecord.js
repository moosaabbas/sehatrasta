import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image, ImageBackground, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { firebase } from "../../firebaseConfig";
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import { useNavigation } from '@react-navigation/native';

const UploadMediaFile = () => {
    const [uploading, setUploading] = useState(false);
    const navigation = useNavigation();

    const pickImageAndUpload = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setUploading(true); // Start the loading indicator

            try {
                const { uri } = await FileSystem.getInfoAsync(result.assets[0].uri);
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = async () => { resolve(xhr.response); };
                    xhr.onerror = (e) => { reject(new TypeError('Network request failed')); };
                    xhr.responseType = 'blob';
                    xhr.open('GET', uri, true);
                    xhr.send(null);
                });

                const filename = result.assets[0].uri.substring(result.assets[0].uri.lastIndexOf('/') + 1);
                const storageRef = firebase.storage().ref().child(filename);
                const snapshot = await storageRef.put(blob);
                const downloadURL = await snapshot.ref.getDownloadURL();

                const user = firebase.auth().currentUser;
                if (user) {
                    const userDocRef = firebase.firestore().collection('users').doc(user.uid);
                    await userDocRef.update({ image: downloadURL });
                    Alert.alert('Photo Uploaded!');
                } else {
                    console.error('No user is logged in.');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Upload failed. Please try again.');
            } finally {
                setUploading(false); // Stop the loading indicator
            }
        }
    };

    const navigateToImportedImage = async () => {
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

    return (
        <ImageBackground source={require('../assets/bg-med.jpg')} style={styles.backgroundImage}>
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>Upload Medical Record</Text>
                    <Text style={styles.subHeaderText}>Choose an image to upload</Text>
                    <Image
                        source={require('../assets/upload-icon2.png')}
                        style={styles.uploadIcon}
                    />
                </View>

                <TouchableOpacity style={styles.selectButton} onPress={pickImageAndUpload}>
                    <Text style={styles.buttonText}>Choose Image</Text>
                </TouchableOpacity>

                {/* Loading indicator */}
                {uploading && <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />}

                <TouchableOpacity style={styles.importButton} onPress={navigateToImportedImage}>
                    <Text style={styles.buttonText}>View File</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </ImageBackground>
    );
};


const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'contain' depending on your preference
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        color: '#03161c',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5
    },
    subHeaderText: {
        color: '#03161c',
        fontSize: 16,
        marginBottom: 20
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
    },
    uploadIcon: {
        width: 100,  
        height: 100,
        marginTop: 20,
    },
    loadingIndicator: {
        marginTop: 20, // Add some spacing above the indicator
    },
});


export default UploadMediaFile;
