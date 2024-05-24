import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import LottieView from "lottie-react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import fetch from "node-fetch";
import {
  BackgroundColor,
  Light_Purple,
  Purple,
  White,
} from "../assets/utils/palette";

const apiKey = "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";
const modelsUrl = "https://api.groq.com/openai/v1/models";
const chatCompletionUrl = "https://api.groq.com/openai/v1/chat/completions";

async function performChatCompletion(model, medicine1, medicine2) {
  const chatPayload = {
    model: model,
    messages: [
      {
        role: "system",
        content:
          "You're given 2 medicines below. Check if they react with each other when taken together. In case they react say 'The Medicines React.' else say 'They donot React'. Donot answer anything except this.",
      },
      { role: "user", content: medicine1 },
      { role: "user", content: medicine2 },
    ],
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1,
  };

  try {
    const response = await fetch(chatCompletionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatPayload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const { choices } = data;
    return choices[0].message.content.replace(/\*/g, "");
  } catch (error) {
    console.error("Error during chat completion:", error);
    return "Error in checking interaction";
  }
}

async function fetchModels() {
  try {
    const response = await fetch(modelsUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

export default function MedChecker({ navigation }) {
  const [medicine1, setMedicine1] = useState("");
  const [medicine2, setMedicine2] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const checkInteraction = async () => {
    setLoading(true);
    try {
      const models = await fetchModels();
      const model = models.find((m) => m.id === "llama3-70b-8192");
      if (model) {
        const response = await performChatCompletion(
          model.id,
          medicine1,
          medicine2
        );
        setResult(response);
      } else {
        setResult("Model llama3-70b-8192 not found");
      }
    } catch (error) {
      setResult("Error in checking interaction");
    }
    setLoading(false);
  };
  StatusBar.setBarStyle("dark-content");

  return (
    <>
      {loading ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            backgroundColor: "#f2f2f2",
          }}
        >
          <ActivityIndicator size={"large"} color={Purple} />
        </View>
      ) : (
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
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.formContainer}>
              <View style={styles.centeredContainer}>
                <LottieView
                  style={styles.animation}
                  source={require("../assets/animations/Animation.json")}
                  autoPlay
                  loop
                />
              </View>
              <TextInput
                style={styles.input}
                placeholderTextColor="#ccc"
                placeholder="Enter Medicine 1"
                value={medicine1}
                onChangeText={setMedicine1}
              />
              <TextInput
                style={styles.input}
                placeholderTextColor="#ccc"
                placeholder="Enter Medicine 2"
                value={medicine2}
                onChangeText={setMedicine2}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={checkInteraction}
              >
                <Text style={styles.buttonText}>Check Interaction</Text>
              </TouchableOpacity>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  style={styles.loader}
                />
              ) : result ? (
                <Text style={styles.result}>{result}</Text>
              ) : null}
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColor,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
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
  scrollViewContainer: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: "#F6F6F6",
  },
  button: {
    backgroundColor: Purple,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
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
  result: {
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
  },
  animation: {
    width: 260,
    height: 260,
  },
});
