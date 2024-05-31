import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Title, Paragraph, Provider as PaperProvider } from 'react-native-paper';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import fetch from 'node-fetch';
import { BackgroundColor, Light_Purple, Purple, White } from "../assets/utils/palette";

const parseBoldText = (text) => {
    const regex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ text: text.substring(lastIndex, match.index), bold: false });
        }
        parts.push({ text: match[1], bold: true });
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex), bold: false });
    }

    return parts;
};

const BoldText = ({ text }) => {
    const parsedText = parseBoldText(text);
    return (
        <Text style={styles.chatText}>
            {parsedText.map((part, index) => (
                <Text key={index} style={part.bold ? styles.boldText : styles.normalText}>
                    {part.text}
                </Text>
            ))}
        </Text>
    );
};

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

    const navigation = useNavigation();

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

    const auth = getAuth();
    const user = auth.currentUser;


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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons
                        name={"chevron-back"}
                        size={30}
                        style={{ color: "white" }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>Mental Health Survey</Text>
                <View style={styles.placeholder}></View>
            </View>
            <ScrollView style={styles.scrollView}>
                <View style={styles.formContainer}>
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
                                    placeholderTextColor={Light_Purple}
                                />
                            </Card.Content>
                        </Card>
                    ))}
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    {loading && <ActivityIndicator size="large" style={styles.loader} />}
                    {aiResponse && (
                        <Card style={styles.responseCard}>
                            <Card.Content>
                                <Title style={styles.responseTitle}>AI Therapist's Response</Title>
                                <BoldText text={aiResponse} />
                            </Card.Content>
                        </Card>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BackgroundColor,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Purple,
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        padding: 8,
        backgroundColor: Light_Purple,
        borderRadius: 100,
    },
    placeholder: {
        width: 46,
        height: 48,
    },
    scrollView: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    formContainer: {
        padding: 20,
        backgroundColor: White,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    card: {
        marginBottom: 20,
        backgroundColor: White,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Purple,
    },
    input: {
        height: 100,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        textAlignVertical: 'top',
        borderRadius: 10,
        backgroundColor: "#F6F6F6",
    },
    submitButton: {
        backgroundColor: Purple,
        borderRadius: 25,
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    loader: {
        marginTop: 20,
    },
    responseCard: {
        marginTop: 20,
        backgroundColor: '#E2D5FB',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    responseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000000',
    },
    response: {
        fontSize: 16,
        color: '#000000',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatText: {
        fontSize: 16,
        color: "#333",
    },
    normalText: {
        fontSize: 16,
        color: "#333",
    },
    boldText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
});

export default MentalHealthSurvey;
