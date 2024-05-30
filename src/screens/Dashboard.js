import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Alert,
  Linking,
  StatusBar,
} from "react-native";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { firebase } from "../../firebaseConfig";
import * as Location from "expo-location";
import { Calendar } from "react-native-calendars";
import { Light_Purple, Purple } from "../assets/utils/palette";

const Dashboard = () => {
  const navigation = useNavigation();
  const userDetail = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [fullName, setFullName] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

StatusBar.setBarStyle("dark-content");

  const [medicines, setMedicines] = useState([
    {
      name: "Paracetamol",
      times: ["17:00", "21:00"],
      days: ["Thu", "Fri", "Sat", "Sun"],
    },
    { name: "Vitamin D", times: ["10:00"], days: ["Sat"] },
    {
      name: "Calcium Supliments",
      times: ["17:00", "21:00"],
      days: ["Thu", "Fri", "Sat", "Sun"],
    },
    { name: "Vitamin C", times: ["10:00"], days: ["Sat"] },
  ]);
  const [selectedDate, setSelectedDate] = useState("");
  const [newMedicine, setNewMedicine] = useState("");
  const [daysToTake, setDaysToTake] = useState(0);

  const renderMedicineSchedule = (medicine) => {
    return (
      <View style={styles.medicineContainer} key={medicine.name}>
      <Text style={styles.medicineName}>{medicine.name}</Text>
      <View style={styles.detailRow}>
        <MaterialCommunityIcons name="clock-outline" size={20} color="#333" />
        {medicine.times.map((time, index) => (
          <View style={styles.timeBadge} key={index}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        ))}
      </View>
      <View style={styles.detailRow}>
        <MaterialCommunityIcons name="calendar-blank-outline" size={20} color="#333" />
        {medicine.days.map((day, index) => (
          <View style={styles.dayBadge} key={index}>
            <Text style={styles.dayText}>{day}</Text>
          </View>
        ))}
      </View>
    </View>
    );
  };

  const fetchUserData = async () => {
    console.log(userDetail.uid);
    try {
      const user = firebase.auth().currentUser;

      const userDoc = await firebase
        .firestore()
        .collection("users")
        .doc(userDetail.uid)
        .get();
      console.log("doc", userDoc);
      if (userDoc.exists) {
        const userData = userDoc.data();
        setFullName(userData.fullName);
      } else {
        console.log("User document does not exist.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    console.log("Dashboard component is mounted or focused");
    fetchUserData();
    fetchMedicines();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchMedicines = async () => {
    console.log("fetch meds");
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        const medicinesDoc = await firebase
          .firestore()
          .collection("medicines")
          .doc(user.uid)
          .get();
        if (medicinesDoc.exists) {
          setMedicines(medicinesDoc.data());
          console.log("medicisnes coming", medicinesDoc.data());
        }
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  const addMedicine = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (user && selectedDate && newMedicine) {
        let updatedMedicines = { ...medicines };
        for (let i = 0; i <= daysToTake; i++) {
          let date = new Date(selectedDate);
          date.setDate(date.getDate() + i);
          let formattedDate = date.toISOString().split("T")[0];
          if (updatedMedicines[formattedDate]) {
            updatedMedicines[formattedDate].push(newMedicine);
          } else {
            updatedMedicines[formattedDate] = [newMedicine];
          }
        }
        await firebase
          .firestore()
          .collection("medicines")
          .doc(user.uid)
          .set(updatedMedicines);
        setMedicines(updatedMedicines);
        setNewMedicine("");
        setDaysToTake(0);
        fetchMedicines();
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
    }
  };

  const deleteData = async () => {
    try {
      await AsyncStorage.removeItem("userDetail");
      dispatch({ type: "setUser", payload: null });
      navigation.reset({
        index: 0,
        routes: [{ name: "AuthStack" }],
      });
    } catch (e) {
      console.error("Failed to delete the data", e);
    }
  };

  const toggleModal = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access location was denied"
      );
      return;
    }
    setModalVisible(!isModalVisible);
  };

  const shareLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const url = `http://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
      Linking.openURL(url);
    } catch (error) {
      Alert.alert("Error", "Unable to fetch location");
    }
    setModalVisible(false);
  };

  const callEmergency = () => {
    Linking.openURL("tel:1122");
    setModalVisible(false);
  };

  const featuresData = [
    {
      key: "1",
      icon: "clipboard-pulse-outline",
      text: "Medication Interaction",
      redirection: "MedChecker",
    },
    {
      key: "2",
      icon: "human-pregnant",
      text: "Pregnancy Tracker",
      redirection: "Pregnancy",
    },
    {
      key: "3",
      icon: "shield-account-outline",
      text: "Mental Guidance",
      redirection: "MentalHealth",
    },
    {
      key: "4",
      icon: "heart-pulse",
      text: "Calorie Goals",
      redirection: "GoalForm",
    },
    {
      key: "5",
      icon: "pill",
      text: "Calories Tracking",
      redirection: "DailyActivity",
    },
    {
      key: "6",
      icon: "file-document-edit-outline",
      text: "Scan Your Report",
      redirection: "HealthRecord",
    },
  ];

  const renderFeature = ({ item }) => (
    <View style={styles.feature}>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() =>
          item.redirection && navigation.navigate(item.redirection)
        }
      >
        <MaterialCommunityIcons name={item.icon} size={30} color={Purple} />
        <Text style={styles.featureTextCenter}>{item.text}</Text>
      </TouchableOpacity>
    </View>
  );

  const getMarkedDates = () => {
    let markedDates = {};
    Object.keys(medicines).forEach((date) => {
      markedDates[date] = { marked: true };
    });
    if (selectedDate) {
      markedDates[selectedDate] = { selected: true, selectedColor: "blue" };
    }
    return markedDates;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Hello, {fullName}!</Text>
        </View>
        <View style={styles.headerButtons}>
      <TouchableOpacity onPress={toggleModal}>
        <View style={styles.ambulanceIconBadge}>
          <MaterialCommunityIcons
            name="ambulance"
            size={28}
            color="white"
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={deleteData}>
        <View style={styles.iconBadge}>
          <MaterialIcons
            name="logout"
            size={22}
            color={Purple}
          />
        </View>
      </TouchableOpacity>
    </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.aiHeader}
          onPress={() => navigation.navigate("ChatAssistant")}
        >
          <Image
            source={require("../assets/images/chatbot.png")}
            style={styles.chatBot}
          />
          <Text style={styles.aiText}>
            Discover Our Healthcare Chat Assistant
          </Text>
          <View style={styles.arrow}>
            <Ionicons
              name={"chevron-forward"}
              size={40}
              style={{ color: "white" }}
            />
          </View>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
            Our Features
          </Text>
          <View
            style={{ backgroundColor: "#fff", padding: 0, borderRadius: 30 }}
          >
            <FlatList
              data={featuresData}
              renderItem={renderFeature}
              keyExtractor={(item) => item.key}
              numColumns={3}
              horizontal={false}
              columnWrapperStyle={styles.featuresGrid}
            />
          </View>
        </ScrollView>

        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>
            Upcoming Medicines
          </Text>

          <View>
            <ScrollView style={styles.scrollView}>
              <View style={styles.medicineListContainer}>
                {/* <Text style={styles.sectionTitle}>Upcoming Medicines</Text> */}
                {medicines.map((medicine) => renderMedicineSchedule(medicine))}
              </View>
            </ScrollView>
          </View>
          {/* <Calendar
            style={{borderRadius: 30}}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
          />
          {selectedDate && (
            <View style={styles.medicineInputContainer}>
              <Text style={styles.medicineInputLabel}>
                Add Medicine for {selectedDate}:
              </Text>
              <TextInput
                style={styles.medicineInput}
                value={newMedicine}
                onChangeText={setNewMedicine}
              />
              <TextInput
                style={styles.daysInput}
                placeholder="Days to take"
                keyboardType="numeric"
                value={daysToTake.toString()}
                onChangeText={(text) => setDaysToTake(Number(text))}
              />
              <TouchableOpacity style={styles.addButton} onPress={addMedicine}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
          {selectedDate && medicines[selectedDate] && (
            <View style={styles.medicineList}>
              <Text style={styles.medicineListTitle}>
                Medicines for {selectedDate}:
              </Text>
              {medicines[selectedDate].map((medicine, index) => (
                <Text key={index} style={styles.medicineListItem}>
                  {medicine}
                </Text>
              ))}
            </View>
          )} */}
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Emergency Services</Text>
            <Text style={styles.modalMessage}>
              Do you want to share your location or call emergency services?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={shareLocation}
              >
                <Text style={styles.modalButtonText}>Share Location</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={callEmergency}
              >
                <Text style={styles.modalButtonText}>Call 1122</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  sehatRasta: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  header: {
    height: 140,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTextContainer: {
    maxWidth: "70%",
  },
  headerText: {
    color: "black",
    fontSize: 26,
    fontWeight: "bold",
    flexWrap: "wrap",
    maxWidth: "100%",
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 40, // Adjust the size as needed
    height: 40, // Adjust the size as needed
    borderRadius: 25, // This makes the View circular
    backgroundColor: '#E8F0FE', // Background color of the badge
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5, // Optional, for spacing between buttons
  },
  ambulanceIconBadge: {
    width: 40, // Adjust the size as needed
    height: 40, // Adjust the size as needed
    borderRadius: 25, // This makes the View circular
    backgroundColor: 'red', // Background color of the badge
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5, // Optional, for spacing between buttons
  },
  emergencyIcon: {
    marginRight: 10,
  },
 
  


  scrollView: {
    margin: 8,
    flex: 1,
  },
  medicineListContainer: {
    marginTop: 5,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  medicineContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#E8F0FE',
    borderRadius: 10,
  },


  medicineContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#E8F0FE',
    borderRadius: 10,
  },
  medicineName: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  timeBadge: {
    backgroundColor: '#d7e2f4',
    marginLeft: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dayBadge: {
    backgroundColor: "#c3a3f0",
    marginLeft: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: "600"
  },
  dayText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: "600"
  },


  
  medicineDetails: {
    fontSize: 14,
    color: '#666',
  },




  aiHeader: {
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Purple,
    padding: 10,
    marginBottom: 10,
  },
  chatBot: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 10,
  },
  arrow: {
    marginLeft: 15,
    padding: 8,
    borderRadius: 100,
    backgroundColor: Light_Purple,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  featuresGrid: {
    justifyContent: "space-between",
  },
  feature: {
    width: "32%",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#E8F0FE",
    height: 100,
    width: 110,
    padding: 20,
    borderRadius: 30,
    margin: 6,
  },
  featureTextCenter: {
    fontSize: 13,
    color: "#2C3E50",
  },
  aiText: {
    width: 200,
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
  calendarContainer: {
    marginVertical: 12,
  },
  medicineInputContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  medicineInputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  medicineInput: {
    height: 40,
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  daysInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  addButton: {
    backgroundColor: "#5D3FD3",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  medicineList: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  medicineListTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  medicineListItem: {
    fontSize: 14,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#5D3FD3",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    justifyContent: "center",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#5D3FD3",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Dashboard;
