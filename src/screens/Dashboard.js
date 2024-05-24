// Dashboard.js
import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Define the DoctorCard component
const DoctorCard = ({ doctor }) => {
  return (
    <View style={styles.card}>
      <Image source={doctor.imageUrl} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{doctor.doctorName}</Text>
        <Text style={styles.timing}>{doctor.timing}</Text>
        <Text style={styles.availability}>{doctor.availability}</Text>
      </View>
    </View>
  );
};

const Dashboard = () => {
  const navigation = useNavigation();

  const featuresData = [
    { key: "1", icon: "clipboard-pulse-outline", text: "Symptom Checker", redirection: "MedChecker" },
    { key: "2", icon: "phone-in-talk", text: "Pregnancy Tracker", redirection: "Pregnancy" },
    { key: "3", icon: "shield-account-outline", text: "Mental Guidance", redirection: "MentalHealth" },
    { key: "4", icon: "heart-pulse", text: "Calorie Goals", redirection: "GoalForm" },
    { key: "5", icon: "pill", text: "Daily Calories Tracking", redirection: "DailyActivity" },
    { key: "6", icon: "file-document-edit-outline", text: "Scan Your Report", redirection: "HealthRecord" },
  ];

  const renderFeature = ({ item }) => (
    <View style={styles.feature}>
      <TouchableOpacity style={styles.iconContainer} onPress={() => item.redirection && navigation.navigate(item.redirection)}>
        <MaterialCommunityIcons name={item.icon} size={30} color="#4A90E2" />
        <Text style={styles.featureTextCenter}>{item.text}</Text>
      </TouchableOpacity>
    </View>
  );

  const doctorsData = [
    {
      key: "1",
      doctorName: "Dr. Mohammad",
      timing: "9:00 AM - 5:00 PM",
      availability: "Available",
      imageUrl: require("../assets/images/chatbot.png")
    },
    {
      key: "2",
      doctorName: "Dr. John Doe",
      timing: "10:00 AM - 4:00 PM",
      availability: "Available",
      imageUrl: require("../assets/images/chatbot.png")
    },
    {
      key: "3",
      doctorName: "Dr. Lisa Ray",
      timing: "8:00 AM - 3:00 PM",
      availability: "Busy",
      imageUrl: require("../assets/images/chatbot.png")
    },
    {
      key: "4",
      doctorName: "Dr. Mark Evans",
      timing: "9:00 AM - 5:00 PM",
      availability: "Available",
      imageUrl: require("../assets/images/chatbot.png")
    },
    {
      key: "5",
      doctorName: "Dr. Sarah Connor",
      timing: "7:00 AM - 2:00 PM",
      availability: "Available",
      imageUrl: require("../assets/images/chatbot.png")
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View
          style={{ width: 150, flexDirection: "row", alignItems: "center" }}
        >
          <Text style={styles.headerText}>Hello, Robertson!</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="settings" size={24} color="blue" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.aiHeader}
          onPress={() => navigation.navigate('ChatAssistant')}
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
              style={{ color: "black" }}
            />
          </View>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.headerText, { marginBottom: 12 }]}>
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

        <View style={styles.appointmentContainer}>
          <Text style={[styles.headerText, { marginBottom: 12 }]}>
            Appointment Scheduling
          </Text>

          <FlatList
            data={doctorsData}
            renderItem={({ item }) => <DoctorCard doctor={item} />}
            keyExtractor={(item) => item.key}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
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
  headerText: {
    color: "black",
    fontSize: 26,
    fontWeight: "bold",
  },
  scrollView: {
    margin: 8,
  },
  aiHeader: {
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3F6ECA",
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
    backgroundColor: "#e8f4fd",
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
  appointmentContainer: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    width: 300,
    marginRight: 10,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timing: {
    fontSize: 14,
    color: "#333",
  },
  availability: {
    fontSize: 14,
    fontWeight: "bold",
    color: "green",
  },
});

export default Dashboard;
