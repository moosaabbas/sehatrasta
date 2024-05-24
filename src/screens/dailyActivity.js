import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Button, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView
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
    <ImageBackground 
      source={require('../assets/images/Tommy-Stewart-Fieldweb.jpg')}
      style={styles.backgroundImage}
    >
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#3F6ECA',
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  backButton: {
    marginRight: 10,
    padding: 8,
    borderRadius: 100,
    backgroundColor: '#6894e8',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollViewContent: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    width: '100%', // Ensure the content takes the full width
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    maxWidth: 400, // Limit the maximum width to avoid overly wide elements on large screens
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    width: '100%',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3F6ECA',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  caloriesText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
  },
  goalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 10,
  },
});

export default DailyActivity;
