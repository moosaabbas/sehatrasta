import React, { useState, useEffect } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, FlatList, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BackgroundColor, Light_Purple, Purple, White } from '../assets/utils/palette'; // Ensure to import your color palette
import { useSelector } from 'react-redux';

const DailyActivity = () => {
  const userDetail = useSelector((state) => state.user);
  const navigation = useNavigation();
  const [activityInput, setActivityInput] = useState('');
  const [duration, setDuration] = useState('');
  const [activityOptions, setActivityOptions] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [caloriesBurned, setCaloriesBurned] = useState(null);
  const [goalMessage, setGoalMessage] = useState('');
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (activityInput.length > 2) {
      fetchActivities(activityInput);
    }
  }, [activityInput]);

  const fetchActivities = async (activity) => {
    const url = `https://api.api-ninjas.com/v1/caloriesburned?activity=${encodeURIComponent(activity)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': '3FUcQPj9gx2UZZd4hBQrdQ==p8hNU32iRPfILSWR' // Replace with your API Key or an environment variable
      }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      setActivityOptions(data);
    } else {
      setActivityOptions([]);
    }
  };

  const logActivity = async () => {
    if (!selectedActivity || duration === '') {
      console.log("Please select an activity and enter the duration");
      return;
    }
    if (!userDetail) {
      console.log("User is not authenticated!");
      return;
    }
    const userDocRef = doc(firestore, 'users', userDetail.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const weightPounds = userData.currentWeight * 2.20462;
      const calories = selectedActivity.calories_per_hour * (weightPounds / 150) * (parseInt(duration) / 60);
      setCaloriesBurned(calories);
      await updateDoc(userDocRef, {
        dailyActivity: {
          activity: selectedActivity.name,
          duration: parseInt(duration),
          calories
        }
      });
      checkGoal(calories, userData.dailyCalorieGoal);
    } else {
      console.log("No user document found!");
    }
  };

  const checkGoal = (calories, goal) => {
    const message = calories >= goal ? 'Goal met or exceeded!' : 'Under the goal.';
    setGoalMessage(message);
  };

  const renderActivityOption = ({ item }) => (
    <TouchableOpacity onPress={() => setSelectedActivity(item)} style={styles.option}>
      <Text style={styles.optionText}>{item.name} ({item.calories_per_hour} cal/hr)</Text>
      {selectedActivity?.name === item.name && (
        <Ionicons name="checkmark-circle" size={20} color={Purple} style={styles.checkmark} />
      )}
    </TouchableOpacity>
  );

  // Debouncing logic
  let lastPress = 0;

  const handleBackPress = () => {
    const timeNow = new Date().getTime();
    if (timeNow - lastPress < 1000) {
      return;
    }
    lastPress = timeNow;
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
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
        <Text style={styles.headerText}>Daily Activity</Text>
        <View style={styles.placeholder}></View>
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type activity (e.g., boxing)"
            value={activityInput}
            onChangeText={setActivityInput}
            placeholderTextColor={Light_Purple}
          />
          {activityOptions.length > 0 && (
            <FlatList
              data={activityOptions}
              renderItem={renderActivityOption}
              keyExtractor={(item) => item.name}
              style={styles.optionList}
            />
          )}
          <TextInput
            style={[styles.input, { marginTop: activityOptions.length > 0 ? 0 : 15 }]}
            placeholder="Duration (in minutes)"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
            placeholderTextColor={Light_Purple}
          />
          <TouchableOpacity style={styles.button} onPress={logActivity}>
            <Text style={styles.buttonText}>Log Activity</Text>
          </TouchableOpacity>
          {caloriesBurned !== null && <Text style={styles.caloriesText}>Calories Burned: {caloriesBurned.toFixed(2)}</Text>}
          {goalMessage && <Text style={styles.goalText}>{goalMessage}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
  container: {
    flex: 1,
    backgroundColor: White,
    padding: 20,
    margin: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F6F6F6',
    borderRadius: 25,
    fontSize: 16,
  },
  optionList: {
    width: '100%',
    maxHeight: 200,
    marginBottom: 15,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: Purple,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: White,
    fontSize: 18,
    fontWeight: 'bold',
  },
  caloriesText: {
    fontSize: 18,
    color: '#333',
    marginVertical: 10,
    textAlign: 'center',
  },
  goalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default DailyActivity;
