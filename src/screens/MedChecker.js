import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
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
            return "They do react";
        } else {
            return "They do not react";
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

    const checkInteraction = async () => {
        const interactionResult = await classifyAndQuery(medicine1, medicine2);
        setResult(interactionResult);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Medication Interaction Checker</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter Medicine 1"
                value={medicine1}
                onChangeText={setMedicine1}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter Medicine 2"
                value={medicine2}
                onChangeText={setMedicine2}
            />
            <Button title="Check Interaction" onPress={checkInteraction} />
            {result ? <Text style={styles.result}>{result}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    result: {
        marginTop: 20,
        fontSize: 18,
        textAlign: 'center',
    },
});
