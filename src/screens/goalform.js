import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  BackgroundColor,
  Light_Purple,
  Purple,
  White,
} from "../assets/utils/palette";
import { useSelector } from "react-redux";

const GoalForm = ({ navigation }) => {
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [bmr, setBmr] = useState(0);
  const [deficitDays, setDeficitDays] = useState([]);
  const userDetail = useSelector((state) => state.user);

  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (userDetail) {
        const userDocRef = doc(firestore, "users", userDetail.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentWeight(
            data.currentWeight ? data.currentWeight.toString() : ""
          );
          setTargetWeight(
            data.targetWeight ? data.targetWeight.toString() : ""
          );
          setDailyCalorieGoal(
            data.dailyCalorieGoal ? data.dailyCalorieGoal.toString() : ""
          );
          setGender(data.gender ? data.gender : "");
          setHeight(data.height ? data.height.toString() : "");
          setAge(data.age ? data.age.toString() : "");
          setActivityLevel(
            data.activityLevel ? data.activityLevel : "sedentary"
          );
        } else {
          console.log("No such document!");
        }
      } else {
        console.log("User is not authenticated");
      }
    };

    fetchUserData();
  }, [userDetail]);

  useEffect(() => {
    if (currentWeight && height && age && gender) {
      calculateBMR();
    }
  }, [currentWeight, height, age, gender, activityLevel]);

  const calculateBMR = () => {
    let weight = parseFloat(currentWeight);
    let heightInCm = parseFloat(height);
    let userAge = parseInt(age);

    if (!weight || !heightInCm || !userAge) return;

    let bmrCalculation =
      gender === "Male"
        ? 10 * weight + 6.25 * heightInCm - 5 * userAge + 5
        : 10 * weight + 6.25 * heightInCm - 5 * userAge - 161;

    switch (activityLevel) {
      case "sedentary":
        bmrCalculation *= 1.2;
        break;
      case "lightly active":
        bmrCalculation *= 1.375;
        break;
      case "moderately active":
        bmrCalculation *= 1.55;
        break;
      case "very active":
        bmrCalculation *= 1.725;
        break;
      case "extra active":
        bmrCalculation *= 1.9;
        break;
    }

    setBmr(Math.round(bmrCalculation));
    calculateDaysToGoal(bmrCalculation);
  };

  const calculateDaysToGoal = (caloriesNeeded) => {
    const weightToLose = parseFloat(currentWeight) - parseFloat(targetWeight);
    const deficits = [300, 500, 700, 1000]; // Define different caloric deficits
    const results = deficits.map((deficit) => {
      const dailyDeficit =
        caloriesNeeded - parseInt(dailyCalorieGoal) + deficit;
      const caloriesToLoseWeight = weightToLose * 7700;
      const days = Math.ceil(caloriesToLoseWeight / dailyDeficit);
      return { deficit, days };
    });
    setDeficitDays(results);
  };

  const handleUpdateGoals = async () => {
    if (
      !currentWeight ||
      !targetWeight ||
      !dailyCalorieGoal ||
      !gender ||
      !height ||
      !age
    ) {
      alert("Please fill all fields");
      return;
    }

    if (userDetail) {
      const userDocRef = doc(firestore, "users", userDetail.uid);
      try {
        await updateDoc(userDocRef, {
          currentWeight: parseFloat(currentWeight),
          targetWeight: parseFloat(targetWeight),
          dailyCalorieGoal: parseInt(dailyCalorieGoal),
          gender,
          height: parseInt(height),
          age: parseInt(age),
          activityLevel,
          caloriesBurnedAtRest: bmr,
        });
        alert("Goals updated successfully!");
        navigation.navigate("DailyActivity");
      } catch (error) {
        console.error("Error updating goals: ", error);
      }
    } else {
      alert("User is not authenticated");
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
        <Text style={styles.headerText}>Set Goals</Text>
        <View style={styles.placeholder}></View>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Current Weight (kg)"
            keyboardType="numeric"
            onChangeText={setCurrentWeight}
            value={currentWeight}
            placeholderTextColor={Light_Purple}
          />
          <TextInput
            style={styles.input}
            placeholder="Target Weight (kg)"
            keyboardType="numeric"
            onChangeText={setTargetWeight}
            value={targetWeight}
            placeholderTextColor={Light_Purple}
          />
          <TextInput
            style={styles.input}
            placeholder="Daily Calorie Burn Goal"
            keyboardType="numeric"
            onChangeText={setDailyCalorieGoal}
            value={dailyCalorieGoal}
            placeholderTextColor={Light_Purple}
          />
          <TextInput
            style={styles.input}
            placeholder="Gender"
            onChangeText={setGender}
            value={gender}
            placeholderTextColor={Light_Purple}
          />
          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            keyboardType="numeric"
            onChangeText={setHeight}
            value={height}
            placeholderTextColor={Light_Purple}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            keyboardType="numeric"
            onChangeText={setAge}
            value={age}
            placeholderTextColor={Light_Purple}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={activityLevel}
              style={Platform.OS === "ios" ? styles.pickerIOS : styles.picker}
              onValueChange={(itemValue) => setActivityLevel(itemValue)}
              mode="dropdown" // You can use 'dialog' for Android if preferred
            >
              <Picker.Item
                label="Sedentary: little or no exercise"
                value="sedentary"
              />
              <Picker.Item
                label="Lightly active: light exercise/sports 1-3 days/week"
                value="lightly active"
              />
              <Picker.Item
                label="Moderately active: moderate exercise/sports 3-5 days/week"
                value="moderately active"
              />
              <Picker.Item
                label="Very active: hard exercise/sports 6-7 days a week"
                value="very active"
              />
              <Picker.Item
                label="Extra active: very hard exercise/physical job & exercise 2x/day"
                value="extra active"
              />
            </Picker>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUpdateGoals}>
            <Text style={styles.buttonText}>Update Goals</Text>
          </TouchableOpacity>
          <Text style={styles.bmrText}>Your BMR is: {bmr} calories/day</Text>
          {deficitDays.map(({ deficit, days }) => (
            <Text key={deficit} style={styles.bmrText}>
              Days to reach goal with a {deficit} calorie deficit: {days}
            </Text>
          ))}
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
    width: 46,
    height: 48,
  },
  scrollView: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  formContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

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
  pickerContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: "#F6F6F6",
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: "100%",
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
  bmrText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default GoalForm;
