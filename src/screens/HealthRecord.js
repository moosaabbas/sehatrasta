import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ImageBackground,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { firebase } from "../../firebaseConfig";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import Ionicons
import { Light_Purple, Purple } from "../assets/utils/palette";
import { useSelector } from "react-redux";

const UploadMediaFile = () => {
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();
  const userDetail = useSelector((state) => state.user);

  const pickImageAndUpload = async () => {
    let results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      multiple: true,
    });

    if (!results.cancelled) {
      setUploading(true);

      try {
        const uploadTasks = results.assets.map(async (asset) => {
          const { uri } = await FileSystem.getInfoAsync(asset.uri);
          const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => resolve(xhr.response);
            xhr.onerror = (e) =>
              reject(new TypeError("Network request failed"));
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
          });

          const filename = asset.uri.substring(asset.uri.lastIndexOf("/") + 1);
          const storageRef = firebase.storage().ref().child(filename);
          const snapshot = await storageRef.put(blob);
          return await snapshot.ref.getDownloadURL();
        });

        const downloadURLs = await Promise.all(uploadTasks);

        const user = firebase.auth().currentUser;
        if (userDetail) {
          const userDocRef = firebase
            .firestore()
            .collection("users")
            .doc(userDetail.uid);
          await userDocRef.update({
            images: firebase.firestore.FieldValue.arrayUnion(...downloadURLs),
          });
          Alert.alert("Photos Uploaded!");
        } else {
          console.error("No user is logged in.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const navigateToImportedImage = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (userDetail) {
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(userDetail.uid)
          .get();
        if (userDoc.exists && userDoc.data().images) {
          navigation.navigate("ImportedImage", {
            imageUri: userDoc.data().images,
          });
        } else {
          Alert.alert(
            "No Image Found",
            "You have not uploaded any images yet."
          );
        }
      } else {
        console.error("No user is logged in.");
        Alert.alert("No user is logged in.");
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      Alert.alert("Error", "An error occurred while fetching your image.");
    }
  };

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
        <Text style={styles.headerText}>Scan your reports</Text>
        <View style={styles.placeholder}></View>
      </View>
      <View
        source={require("../assets/images/bg-med.jpg")}
        style={styles.backgroundImage}
      >
        <View style={styles.formContainer}>
          <Text style={styles.subHeaderText}>Choose an image to upload</Text>
          <Image
            source={require("../assets/images/upload-icon2.png")}
            style={styles.uploadIcon}
          />

          <TouchableOpacity
            style={styles.selectButton}
            onPress={pickImageAndUpload}
          >
            <Text style={styles.buttonText}>Choose Image</Text>
          </TouchableOpacity>

          {uploading && (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={styles.loadingIndicator}
            />
          )}

          <TouchableOpacity
            style={styles.importButton}
            onPress={navigateToImportedImage}
          >
            <Text style={styles.buttonText}>View Files</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
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
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  formContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
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
  subHeaderText: {
    fontSize: 16,
    color: "#03161c",
    textAlign: "center",
    marginVertical: 10,
  },
  uploadIcon: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  selectButton: {
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
  importButton: {
    backgroundColor: Light_Purple,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 10,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default UploadMediaFile;
