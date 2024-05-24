import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import fetch from 'node-fetch';
import { BackgroundColor, Light_Purple, Purple, White } from '../assets/utils/palette';

const apiKey = "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";
const chatCompletionUrl = "https://api.groq.com/openai/v1/chat/completions"; // Correct endpoint

StatusBar.setBarStyle("dark-content");

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
        <Text
          key={index}
          style={part.bold ? styles.boldText : styles.normalText}
        >
          {part.text}
        </Text>
      ))}
    </Text>
  );
};

const ChatAssistant = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    const userMessage = { text: query, sender: 'user' };
    setMessages([...messages, userMessage]);
    setQuery('');

    const chatPayload = {
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: "You're the best doctor. Based on the medical queries you get answer them. In case of a non medical query just reply 'I dont answer non medical questions'.",
        },
        { role: 'user', content: query },
      ],
      temperature: 0.6,
      max_tokens: 1024,
      top_p: 1,
    };

    try {
      const response = await fetch(chatCompletionUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const { choices } = data;
      if (choices && choices.length > 0) {
        const botMessage = { text: choices[0].message.content, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error('Error during chat completion:', error);
      setError('Failed to fetch advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  StatusBar.setBarStyle("dark-content");
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons
                name={"chevron-back"}
                size={30}
                style={{ color: "white" }}
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>
              Medication Interaction Checker
            </Text>
            <View style={styles.placeholder}></View>
          </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.chatContainer}>
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.chatBubble,
                message.sender === 'user'
                  ? styles.userBubble
                  : styles.botBubble,
              ]}
            >
              <BoldText text={message.text} />
            </View>
          ))}
          {loading && <ActivityIndicator size="large" color="#3F6ECA" />}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Describe your medical issue..."
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.button} onPress={fetchAdvice}>
        <FontAwesome5
                name={"paper-plane"}
                size={20}
                style={{ color: BackgroundColor }}
              />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColor,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Purple,
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
    backgroundColor: Light_Purple,
    borderRadius: 100,
  },
  placeholder: {
    width: 22,
    height: 48,
  },
  scrollView: {
    margin: 8,
  },
  chatContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginVertical: 10,
    flex:1,
    minHeight: 618
  },
  chatBubble: {
    padding: 15,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: "#BCA5DD",
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  botBubble: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  chatText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: BackgroundColor, // Set your desired color here
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingBottom: 36
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    padding: 15,
    fontSize: 16,
    marginRight: 10,
  },
  button: {
    backgroundColor: Purple,
    borderRadius: 25,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    
    fontWeight: 'bold',
  },
  normalText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ChatAssistant;
