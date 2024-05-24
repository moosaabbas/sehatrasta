import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking, Alert, SafeAreaView, Share, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

const Emergency = () => {
    const [loading, setLoading] = useState(false);

    const handleEmergencyCall = () => {
        const emergencyNumber = '112'; // Replace with your local emergency number
        Linking.openURL(`tel:${emergencyNumber}`);
    };

    const shareLocation = async () => {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need location permissions to make this work!');
            setLoading(false);
            return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLoading(false);
        if (loc) {
            const message = `My current location is: Latitude: ${loc.coords.latitude}, Longitude: ${loc.coords.longitude}`;
            Share.share({
                message: message,
                title: 'Share Location', // Optional title in supported sharing options
                url: `http://maps.google.com/maps?q=${loc.coords.latitude},${loc.coords.longitude}` // Link to show location in Google Maps
            });
        } else {
            Alert.alert('Location Error', 'Unable to fetch location.');
        }
    };

    const firstAidGuideUrl = 'https://www.yourfirstaidguide.com'; // Replace this with your actual First Aid guide URL

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ uri: firstAidGuideUrl }}
                style={styles.webView}
            />
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleEmergencyCall} style={styles.emergencyCallButton}>
                    <Text style={styles.buttonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={shareLocation} style={styles.shareLocationButton} disabled={loading}>
                    <Text style={styles.buttonText}>Share Location</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    webView: {
        flex: 1,
        width: '100%',
        marginBottom: 20,
    },
    loadingContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
    },
    emergencyCallButton: {
        backgroundColor: 'red',
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    shareLocationButton: {
        backgroundColor: 'blue',
        width: '90%',
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
    }
});

export default Emergency;