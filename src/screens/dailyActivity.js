import React, { useState, useEffect } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, ImageBackground, ScrollView,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const DailyActivity = () => {
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
        'X-Api-Key': '3FUcQPj9gx2UZZd4hBQrdQ==p8hNU32iRPfILSWR'
      }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      setActivityOptions(data);
    } else {
      console.log('No activities found');
    }
  };

  const logActivity = async () => {
    if (!selectedActivity || duration === '') {
      console.log("Please select an activity and enter the duration");
      return;
    }
    if (!user) {
      console.log("User is not authenticated!");
      return;
    }
    const userDocRef = doc(firestore, 'users', user.uid);
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

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={"chevron-back"}
            size={30}
            style={{ color: "white" }}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Daily Activity</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Type activity (e.g., boxing)"
            value={activityInput}
            onChangeText={setActivityInput}
          />
          {activityOptions.length > 0 && (
            <Picker
              selectedValue={selectedActivity?.name}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedActivity(activityOptions[itemIndex])
              }
              style={styles.picker}
            >
              {activityOptions.map((option, index) => (
                <Picker.Item key={index} label={`${option.name}, ${option.calories_per_hour} cal/hr`} value={option.name} />
              ))}
            </Picker>
          )}
          <TextInput
            style={styles.input}
            placeholder="Duration (in minutes)"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
          <TouchableOpacity style={styles.button} onPress={logActivity}>
            <Text style={styles.buttonText}>Log Activity</Text>
          </TouchableOpacity>
          {caloriesBurned !== null && <Text style={styles.caloriesText}>Calories Burned: {caloriesBurned.toFixed(2)}</Text>}
          {goalMessage && <Text style={styles.goalText}>{goalMessage}</Text>}
        </View>
      </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent dark background for better visibility
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)', // Light background with opacity for the button
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingTop: 70, // Increased top padding
    paddingBottom: 30,
    alignItems: 'center',
    width: '100%',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent background
    borderRadius: 15,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF', // iOS blue for buttons
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  caloriesText: {
    fontSize: 18,
    color: '#333',
    marginVertical: 10,
  },
  goalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50', // Green color for goal messages
    marginTop: 10,
  },
});

export default DailyActivity;
