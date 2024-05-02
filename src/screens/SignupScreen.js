import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  View,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const SignupScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  StatusBar.setBarStyle("dark-content");

  // const handleLogin = async () => {
  //   console.log("Login attempt with:", mobileNumber);
  //   // Placeholder for login logic
  //   navigation.navigate("HomeScreen"); // Assuming 'HomeScreen' is a valid route
  // };
  const auth = getAuth();
  const onSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("account created", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
      });
  };

  // const auth = getAuth();
  // createUserWithEmailAndPassword(auth, email, password)
  //   .then((userCredential) => {
  //     console.log('user created', userCredential);
  //     // Signed up
  //     // const user = userCredential.user;
  //     // ...
  //   })
  //   .catch((error) => {
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //     // ..
  //   });

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

        <View style={styles.headingConctainer}>
          <Text style={styles.headingText}>Sign up</Text>
        </View>
      </SafeAreaView>
      <View style={styles.contentContainer}>
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
          keyboardType="password"
        />
        <TouchableOpacity style={styles.loginButton} onPress={onSignUp}>
          <Text style={styles.loginButtonText}>Sign up</Text>
        </TouchableOpacity>
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
        <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
          <Text style={styles.registerText}>
            Don't have an account?{" "}
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
  safeArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  backButton: {
    margin: 10,
    padding: 8,
    borderRadius: 100,
    backgroundColor: "purple",
  },
  backIcon: {
    fontSize: 24,
    color: "purple",
  },
  headingText: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    color: "purple",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  headingConctainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
  },
  headingText: {
    fontSize: 18,
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
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
