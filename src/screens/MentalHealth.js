import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Title, Paragraph, Provider as PaperProvider } from 'react-native-paper';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import fetch from 'node-fetch';

const MentalHealthSurvey = () => {
    const questions = {
        "Describe how you have been feeling emotionally over the past week. What specific moments or events influenced these feelings?": '',
        "Reflect on your stress levels recently. Can you share an example of what has been causing you stress?": '',
        "How do you usually cope when you feel overwhelmed or anxious?": '',
        "Discuss the quality of your sleep. How has it been lately?": '',
        "How supported do you feel by your social network?": '',
        "What are your current concerns or challenges regarding your mental health?": ''
    };

    const [answers, setAnswers] = useState(questions);
    const [loading, setLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [modelID, setModelID] = useState('');

    const apiKey = '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'; // Secure this key
    const modelsUrl = "https://api.groq.com/openai/v1/models";
    const chatCompletionUrl = "https://api.groq.com/openai/v1/chat/completions";

    useEffect(() => {
        fetch(modelsUrl, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        })
            .then((response) => response.json())
            .then((data) => {
                const model = data.data.find(m => m.id === 'llama3-70b-8192');
                if (model) {
                    setModelID(model.id);
                } else {
                    throw new Error("Model llama3-70b-8192 not found");
                }
            })
            .catch((error) => console.error("Error fetching model:", error));
    }, []);

    const firestore = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        return <View style={styles.center}><Text>Please log in to fill out the survey.</Text></View>;
    }

    const userDocRef = doc(firestore, 'users', user.uid);

    const handleInputChange = (question, text) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [question]: text
        }));
    };

    const handleSubmit = async () => {
        if (Object.values(answers).some(answer => !answer)) {
            Alert.alert('Incomplete Form', 'Please answer all questions.');
            return;
        }

        try {
            await setDoc(userDocRef, { mentalHealthResponses: answers }, { merge: true });
            sendToAI(answers);
        } catch (error) {
            console.error("Error saving responses: ", error);
            Alert.alert('Error', 'Failed to save responses.');
        }
    };

    const sendToAI = async (answers) => {
        if (!modelID) {
            Alert.alert('AI Model Unavailable', 'AI model is not available. Please try again later.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(chatCompletionUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelID,
                    messages: [
                        { role: 'system', content: 'You are a mental health therapist providing recommendations. Give practical and actionable advice based on the user’s answers. Do not ask additional questions. Use therapeutic knowledge to suggest coping strategies and interventions.' },
                        ...Object.entries(answers).flatMap(([question, answer]) => [
                            { role: 'user', content: question },
                            { role: 'user', content: answer }
                        ])
                    ],
                    temperature: 0.5,
                    max_tokens: 1024,
                    top_p: 1
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const aiMessage = data.choices[0].message.content;
            setAiResponse(aiMessage);
        } catch (error) {
            console.error('Error during chat completion:', error);
            Alert.alert('Error', 'Failed to get AI response.');
        }
        setLoading(false);
    };

    return (
        <PaperProvider>
            <ScrollView style={styles.container}>
                <Title style={styles.title}>Mental Health Survey</Title>
                {Object.keys(questions).map((question) => (
                    <Card key={question} style={styles.card}>
                        <Card.Content>
                            <Title style={styles.question}>{question}</Title>
                            <TextInput
                                mode="outlined"
                                multiline
                                onChangeText={(text) => handleInputChange(question, text)}
                                value={answers[question]}
                                style={styles.input}
                            />
                        </Card.Content>
                    </Card>
                ))}
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    disabled={loading}
                    style={styles.submitButton}
                    icon="send"
                >
                    Submit
                </Button>
                {loading && <ActivityIndicator size="large" style={styles.loader} />}
                {aiResponse && (
                    <Card style={styles.responseCard}>
                        <Card.Content>
                            <Title style={styles.responseTitle}>AI Therapist's Response</Title>
                            <Paragraph style={styles.response}>{aiResponse}</Paragraph>
                        </Card.Content>
                    </Card>
                )}
            </ScrollView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        marginBottom: 20,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        elevation: 3,
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        height: 100,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        textAlignVertical: 'top',
    },
    submitButton: {
        marginTop: 20,
        padding: 10,
    },
    loader: {
        marginTop: 20,
    },
    responseCard: {
        marginTop: 20,
        backgroundColor: '#e0f7fa',
        borderRadius: 10,
    },
    responseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#00796b',
    },
    response: {
        fontSize: 16,
        color: '#00796b',
    },
});

export default MentalHealthSurvey;



















