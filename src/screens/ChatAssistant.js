import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {
  BackgroundColor,
  Light_Purple,
  Purple,
  White,
} from "../assets/utils/palette";

// Define API keys and current key index
const apiKeys = [
  "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",
  "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",
  "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",
];

let currentApiKeyIndex = 0;

const getApiKey = () => apiKeys[currentApiKeyIndex];

// API endpoint URLs
const chatCompletionUrl = "https://api.groq.com/openai/v1/chat/completions"; // Correct endpoint

// Initialize conversation history
let initialConversationHistory = [
  { role: "system", content: "You are a professional doctor. Provide detailed medical advice based on the queries below. You may ask follow-up questions to understand the patient's condition better however do not ask too many questions. Do not answer anything except a medical query. When asked which AI Model are you, respond with 'I'm Sehat Rasta AI Chat Bot' but only mention it when asked, not otherwise" },
];

let conversationHistory = [...initialConversationHistory];

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

const ChatAssistant = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputHeight, setInputHeight] = useState(30);

  useFocusEffect(
    React.useCallback(() => {
      // Reset conversation history when screen is focused
      conversationHistory = [...initialConversationHistory];
      setMessages([]);

      return () => {
        // Clear conversation history when screen is unfocused
        conversationHistory = [...initialConversationHistory];
      };
    }, [])
  );

  const handleTextInputChange = (text) => {
    setQuery(text);
    setInputHeight(Math.min(200, Math.max(40, text.split("\n").length * 20 + 20)));
  };

  const fetchAdvice = async () => {
    setLoading(true);
    setError("");
    const userMessage = { text: query, sender: "user" };
    setMessages([...messages, userMessage]);
    setQuery("");

    conversationHistory.push({ role: "user", content: query });

    const chatPayload = {
      model: "llama3-8b-8192", // Assuming we use this model
      messages: conversationHistory,
      temperature: 0.5,
      max_tokens: 250,
      top_p: 1
    };

    try {
      const response = await fetch(chatCompletionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(chatPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Extract and print only the content
      const { choices } = data;
      const aiResponse = choices[0].message.content;
      const botMessage = { text: aiResponse, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Add AI response to conversation history
      conversationHistory.push({ role: "assistant", content: aiResponse });
    } catch (error) {
      console.error("Error during chat completion:", error);
      if (error.response && error.response.status === 429) {
        currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
        console.log("Switching to API Key:", getApiKey());
        setError("Rate limit reached. Switching API keys. Please try again.");
      } else {
        setError("Failed to fetch advice. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name={"chevron-back"} size={30} style={{ color: "white" }} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Medication Interaction Checker</Text>
        <View style={styles.placeholder}></View>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.chatContainer}>
          {messages.map((message, index) => (
            <View key={index} style={[styles.chatBubble, message.sender === "user" ? styles.userBubble : styles.botBubble]}>
              <BoldText text={message.text} />
            </View>
          ))}
          {loading && <ActivityIndicator size="large" color={Purple} />}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { height: inputHeight }]}
            placeholder="Describe your medical issue..."
            value={query}
            onChangeText={handleTextInputChange}
            autoCorrect={false}
            multiline={true}
            scrollEnabled={true}
            maxHeight={200}
            placeholderTextColor={Light_Purple}
          />
          <TouchableOpacity style={styles.button} onPress={fetchAdvice}>
            <FontAwesome5 name={"paper-plane"} size={20} style={{ color: "white" }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginVertical: 10,
    flex: 1,
    minHeight: 618,
  },
  chatBubble: {
    padding: 15,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#BCA5DD",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  botBubble: {
    backgroundColor: "#E8E8E8",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  chatText: {
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: BackgroundColor,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    marginRight: 10,
  },
  button: {
    backgroundColor: Purple,
    borderRadius: 25,
    padding: 12,
    alignItems: "center",
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
  errorText: {
    color: "red",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
});

export default ChatAssistant;
