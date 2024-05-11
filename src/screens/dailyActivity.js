import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Button, Text, StyleSheet, ImageBackground
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const DailyActivity = () => {
  const [activityInput, setActivityInput] = useState('');
  const [duration, setDuration] = useState('');
  const [activityOptions, setActivityOptions] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [caloriesBurned, setCaloriesBurned] = useState(null);
  const [goalMessage, setGoalMessage] = useState('');
  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const userDocRef = doc(firestore, 'users', user.uid);

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
    source={require('../assets/Tommy-Stewart-Fieldweb.jpg')}
      style={styles.backgroundImage}
    >
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
        <Button title="Log Activity" onPress={logActivity} />
        {caloriesBurned !== null && <Text>Calories Burned: {caloriesBurned.toFixed(2)}</Text>}
        {goalMessage && <Text style={styles.goalText}>{goalMessage}</Text>}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 20,
    width: '90%'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white'
  },
  goalText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green'
  }
});

export default DailyActivity;







