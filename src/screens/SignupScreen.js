import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  View,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useDispatch } from "react-redux";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Helper function to validate email and password
const validate = (email, password) => {
  // Basic validation for email and password
  return email.length > 0 && password.length > 6;
};

// Helper function to create initial user record
const createInitialUserRecordThroughEmail = async (user, fullName) => {
  const firestore = getFirestore();
  const userDocRef = doc(firestore, 'users', user.uid);
  await setDoc(userDocRef, {
    fullName: fullName,
    email: user.email,
    createdAt: new Date(),
    currentWeight: 0,  // Initialize with default value
    height: 0,         // Initialize with default value
    age: 0,            // Initialize with default value
    gender: "",        // Initialize with default value
    targetWeight: 0,   // Initialize with default value
    dailyCalorieGoal: 0, // Initialize with default value
    caloriesBurnedAtRest: 0 // Initialize with default value
  });
};

const SignupScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const auth = getAuth();
  const firestore = getFirestore();

  const onSignUp = async () => {
    if (validate(email, password)) {
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createInitialUserRecordThroughEmail(userCredential.user, fullName); // Pass full name
        dispatch({ type: "setUser", payload: userCredential.user });
        setLoading(false);
        navigation.navigate("GoalForm"); // Navigate to goals form after sign up
      } catch (error) {
        setLoading(false);
        console.error("Signup error:", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <SafeAreaView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name={"chevron-back"}
              size={35}
              style={{ color: "white" }}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headingContainer}>
          <Text style={styles.headingText}>Sign up</Text>
        </View>
      </SafeAreaView>
      <View style={styles.contentContainer}>
        <TextInput
          autoCapitalize="words"
          style={styles.input}
          placeholder="Enter your full name"
          onChangeText={setFullName}
          keyboardType="default"
        />
        <TextInput
          autoCapitalize="none"
          style={styles.input}
          placeholder="Enter your email address"
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          autoCapitalize="none"
          secureTextEntry={true}
          style={styles.input}
          placeholder="Enter your password"
          onChangeText={setPassword}
          keyboardType="default"
        />
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={onSignUp}>
            <Text style={styles.loginButtonText}>Sign up</Text>
          </TouchableOpacity>
        )}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or login with</Text>
          <View style={styles.divider} />
        </View>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          <Text style={styles.registerText}>
            Already have an account?{" "}
            <Text style={styles.registerLinkText}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    margin: 10,
    padding: 8,
    borderRadius: 100,
    backgroundColor: "purple",
  },
  headingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
  },
  headingText: {
    fontSize: 22,
    color: "purple",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "purple",
    borderRadius: 50,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#929DA9",
  },
  dividerText: {
    paddingHorizontal: 12,
    color: "#929DA9",
  },
  socialButton: {
    backgroundColor: "#EAECEE",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  socialButtonText: {
    fontSize: 16,
    color: "black",
  },
  registerText: {
    textAlign: "center",
    color: "#929DA9",
    marginTop: 20,
  },
  registerLinkText: {
    color: "purple",
  },
});





