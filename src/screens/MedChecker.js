import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native'; // Import LottieView
import fetch from 'node-fetch';

const auth1 = "Bearer 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";  // Token for detailed medical inquiries
const auth2 = "Bearer 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";  // Token for initial classification

async function queryWithAuthorization(data, auth) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
        {
            headers: {
                "Authorization": auth,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(data)
        }
    );
    const jsonResponse = await response.json();
    return jsonResponse;  // Do not log here, only return the JSON response
}

async function classifyAndQuery(input, input1) {
    try {
        // First, classify if the input is related to medical questions
        const classificationResponse = await queryWithAuthorization({ "inputs": `Following are given 2 medicing please check if they do react or not? When taken together "${input}", "${input1}" Please answer in just "yes" or "no"!` }, auth1);
        const classificationText = classificationResponse[0].generated_text;  // Extract the text

        // Normalize and extract the actual yes/no response
        const isMedical = ["yes.", " yes.", " Yes", " YES", " yes", "Yes", "   Yes", "YES"].some(phrase => classificationText.includes(phrase));

        // Check the classification result
        if (isMedical) {
            return "Potential reaction detected. \n\nThis could lead to side effects. It's crucial to seek advice from your healthcare provider or pharmacist for personalized guidance and safety precautions.";
        } else {
            return "The medications do not appear to interact. \n\nHowever, consulting with your healthcare provider or pharmacist is always recommended for personalized advice and safety measures.";
        }
    } catch (error) {
        console.error('Error:', error);
        return "Error in checking interaction";
    }
}

export default function MedChecker() {
    const [medicine1, setMedicine1] = useState('');
    const [medicine2, setMedicine2] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);  // State for loading

    const checkInteraction = async () => {
        setLoading(true);  // Start loading
        const interactionResult = await classifyAndQuery(medicine1, medicine2);
        setResult(interactionResult);
        setLoading(false);  // End loading
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Medication Interaction Checker</Text>
                    <LottieView
                        style={styles.animation}
                        source={require('../assets/Animation.json')} // Replace with your animation JSON file
                        autoPlay
                        loop
                    />
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#ccc" // White placeholder text color
                        placeholder="Enter Medicine 1"
                        value={medicine1}
                        onChangeText={setMedicine1}
                    />
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#ccc" // White placeholder text color
                        placeholder="Enter Medicine 2"
                        value={medicine2}
                        onChangeText={setMedicine2}
                    />
                    <TouchableOpacity style={styles.button} onPress={checkInteraction}>
                        <Text style={styles.buttonText}>Check Interaction</Text>
                    </TouchableOpacity>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
                    ) : (
                        result ? <Text style={styles.result}>{result}</Text> : null
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#404040', // Updated background color
    },
    scrollViewContainer: {
        flexGrow: 1, // Allows content to be scrolled
    },
    innerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
        color: '#fff', 
    },
    input: {
        height: 50,
        width: 325,
        borderWidth: 1,
        borderColor: '#ccc', 
        borderRadius: 10,
        paddingHorizontal: 20,
        marginBottom: 20,
        fontSize: 16,
        color: '#fff', 
        backgroundColor: '#404040',
    },
    result: {
        marginTop: 20,
        fontSize: 18,
        textAlign: 'center',
        color: '#fff',
    },
    loader: {
        marginTop: 20,
    },
    animation: {
        width: 200,
        height: 200,
        marginBottom: 20
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#265e99',
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }    
});
