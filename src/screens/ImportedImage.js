import React, { useState, useEffect } from 'react';
import { Alert, View, Image, StyleSheet, SafeAreaView, ActivityIndicator, Text, ImageBackground, FlatList, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { firebase } from "../../firebaseConfig";
import { Ionicons } from '@expo/vector-icons';

const ImportedImage = ({ route }) => {
    const { imageUri } = route.params; // Get imageUri from navigation params
    const [images, setImages] = useState(imageUri || []);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null); // State to track the selected image
    const [modalVisible, setModalVisible] = useState(false); // State to control the modal visibility

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleImagePress = (imageUri) => {
        setSelectedImage(imageUri); // Set the selected image URI
        setModalVisible(true); // Show the modal
    };

    const renderItem = ({ item }) => (
        <View style={styles.imageContainer}>
            <TouchableOpacity onPress={() => handleImagePress(item)}>
                <Image source={{ uri: item }} style={styles.galleryImage} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteImage(item)}>
                <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    const handleDeleteImage = async (imageUri) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this record?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            const user = firebase.auth().currentUser;
                            if (user) {
                                await firebase.firestore().collection('users').doc(user.uid).update({
                                    images: firebase.firestore.FieldValue.arrayRemove(imageUri),
                                });
                                setImages(images.filter((img) => img !== imageUri));
                            }
                        } catch (error) {
                            console.error("Error deleting image:", error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name={"chevron-back"} size={30} style={{ color: "white" }} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Records Repository</Text>
            </View>
            <ImageBackground source={require('../assets/images/bg-med.jpg')} style={styles.backgroundImage}>
                <View style={styles.contentContainer}>
                    <Text style={styles.subHeaderText}>View all your medical records</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : images.length > 0 ? (
                        <FlatList
                            data={images}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={2}
                            contentContainerStyle={styles.galleryContainer}
                        />
                    ) : (
                        <Text style={styles.noImagesText}>No images found</Text>
                    )}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <Image source={{ uri: selectedImage }} style={styles.modalImage} />
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

const screenWidth = Dimensions.get('window').width;
const imageWidth = (screenWidth - 40) / 2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F6F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#3F6ECA',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backButton: {
        marginRight: 10,
        padding: 8,
        borderRadius: 100,
        backgroundColor: '#6894e8',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    contentContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    subHeaderText: {
        fontSize: 16,
        color: '#03161c',
        textAlign: 'center',
        marginVertical: 10,
    },
    galleryContainer: {
        justifyContent: 'center',
    },
    galleryImage: {
        width: imageWidth,
        height: imageWidth,
        margin: 1,
        resizeMode: 'cover',
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
    imageContainer: {
        position: 'relative',
        margin: 5,
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
});

export default ImportedImage;
