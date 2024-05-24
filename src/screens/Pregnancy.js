import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from "react-native";
import moment from "moment"; // Make sure moment is installed
import pregnancyTips from "../data/pregnancyData";

import Ionicons from "react-native-vector-icons/Ionicons";
import { Light_Purple, Purple } from "../assets/utils/palette";
import { useNavigation } from "@react-navigation/native";

export default function Pregnancy() {
    const navigation = useNavigation();
  const [currentMonth, setCurrentMonth] = useState("1");
  const [tip, setTip] = useState("");
  const [tipImage, setTipImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentWeek, setCurrentWeek] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    fetchMonthData(currentMonth);
  }, [currentMonth]);

  const fetchMonthData = (month) => {
    setLoading(true);
    const monthData = pregnancyTips[`month${month}`];
    if (monthData) {
      setTip(monthData.tip);
      setTipImage(monthData.image);
    } else {
      setTip("No data available for this month.");
      setTipImage(null);
    }
    setLoading(false);
  };

  const calculateDueDate = () => {
    const today = moment();
    const weeksLeft = 40 - parseInt(currentWeek, 10);
    const dueDate = today.add(weeksLeft, "weeks");
    setDeliveryDate(dueDate.format("MMMM Do YYYY"));
  };

  const renderMonthSelector = () => (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.monthSelectorContainer}
      style={styles.monthSelector}
    >
      {Object.keys(pregnancyTips).map((key) => {
        const monthNum = key.replace("month", "");
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.monthItem,
              currentMonth === monthNum
                ? styles.activeMonthItem
                : styles.monthItem,
            ]}
            onPress={() => setCurrentMonth(monthNum)}
            accessibilityLabel={`Month ${monthNum}`}
          >
            <Text style={styles.monthText}>{`Month ${monthNum}`}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

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
        <Text style={styles.headerText}>Pregnancy Tracker</Text>
        <View style={styles.placeholder}></View>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your current week"
          placeholderTextColor="#A79AB2"
          keyboardType="numeric"
          onChangeText={(text) => setCurrentWeek(text)}
          value={currentWeek}
        />
        <TouchableOpacity style={styles.button} onPress={calculateDueDate}>
          <Text style={styles.buttonText}>Calculate Due Date</Text>
        </TouchableOpacity>
        {deliveryDate && (
          <Text style={styles.deliveryDate}>
            Expected Delivery Date: {deliveryDate}
          </Text>
        )}
      </View>
      {renderMonthSelector()}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#5D3FD3"
          style={styles.loading}
        />
      ) : (
        <View style={styles.insightContainer}>
          {tipImage && (
            <>
              <Text style={styles.imageHeading}>
                This is how your baby looks like:
              </Text>
              <Image
                source={tipImage}
                style={styles.image}
                resizeMode="contain"
              />
            </>
          )}
          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>Monthly Insight</Text>
            <Text style={styles.tip}>{tip}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
    width: 36,
    height: 48,
  },

  monthSelector: {
    width: "100%",
    paddingHorizontal: 10,
  },
  monthSelectorContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  monthItem: {
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#E8DAEF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activeMonthItem: {
    backgroundColor: "#CBA6C3", // A different shade of purple to indicate selection
  },
  monthText: {
    fontSize: 16,
    color: "#5D3FD3",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5D3FD3",
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5D3FD3",
    marginBottom: 5,
  },
  tipContainer: {
    backgroundColor: "#F9F0FF",
    padding: 15,
    borderRadius: 10,
    width: "95%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tip: {
    fontSize: 16,
    color: "#333",
  },
  image: {
    width: "95%",
    height: 300,
    marginTop: 10,
    borderRadius: 10,
  },
  imageHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
    color: "#5D3FD3",
  },
  loading: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "column",
    width: "95%",
    marginTop: 10,
    marginBottom: 20,
  },
  input: {
    margin:5,
    height: 50,
    borderColor: "#E8DAEF",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    color: "#5D3FD3",
    width: "100%",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#5D3FD3",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  deliveryDate: {
    fontSize: 16,
    color: "#5D3FD3",
    marginTop: 10,
    fontWeight: "bold",
  },
  insightContainer: {
    width: "95%",
    alignItems: "center",
    marginTop: 10,
  },
});
