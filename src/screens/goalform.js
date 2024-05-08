import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';

const GoalForm = () => {
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [bmr, setBmr] = useState(0);
  const [deficitDays, setDeficitDays] = useState([]);

  const firestore = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const userDocRef = doc(firestore, 'users', user.uid);

  useEffect(() => {
    const fetchUserData = async () => {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentWeight(data.currentWeight ? data.currentWeight.toString() : '');
        setTargetWeight(data.targetWeight ? data.targetWeight.toString() : '');
        setDailyCalorieGoal(data.dailyCalorieGoal ? data.dailyCalorieGoal.toString() : '');
        setGender(data.gender ? data.gender : '');
        setHeight(data.height ? data.height.toString() : '');
        setAge(data.age ? data.age.toString() : '');
        setActivityLevel(data.activityLevel ? data.activityLevel : 'sedentary');
      } else {
        console.log("No such document!");
      }
    };

    fetchUserData();
  }, []);

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

    let bmrCalculation = gender === 'Male'
      ? 10 * weight + 6.25 * heightInCm - 5 * userAge + 5
      : 10 * weight + 6.25 * heightInCm - 5 * userAge - 161;

    switch (activityLevel) {
      case 'sedentary':
        bmrCalculation *= 1.2;
        break;
      case 'lightly active':
        bmrCalculation *= 1.375;
        break;
      case 'moderately active':
        bmrCalculation *= 1.55;
        break;
      case 'very active':
        bmrCalculation *= 1.725;
        break;
      case 'extra active':
        bmrCalculation *= 1.9;
        break;
    }

    setBmr(Math.round(bmrCalculation));
    calculateDaysToGoal(bmrCalculation);
  };

  const calculateDaysToGoal = (caloriesNeeded) => {
    const weightToLose = parseFloat(currentWeight) - parseFloat(targetWeight);
    const deficits = [300, 500, 700, 1000]; // Define different caloric deficits
    const results = deficits.map(deficit => {
      const dailyDeficit = caloriesNeeded - parseInt(dailyCalorieGoal) + deficit;
      const caloriesToLoseWeight = weightToLose * 7700;
      const days = Math.ceil(caloriesToLoseWeight / dailyDeficit);
      return { deficit, days };
    });
    setDeficitDays(results);
  };

  const handleUpdateGoals = async () => {
    if (!currentWeight || !targetWeight || !dailyCalorieGoal || !gender || !height || !age) {
      alert("Please fill all fields");
      return;
    }

    try {
      await updateDoc(userDocRef, {
        currentWeight: parseFloat(currentWeight),
        targetWeight: parseFloat(targetWeight),
        dailyCalorieGoal: parseInt(dailyCalorieGoal),
        gender,
        height: parseInt(height),
        age: parseInt(age),
        activityLevel,
        caloriesBurnedAtRest: bmr
      });
      alert('Goals updated successfully!');
    } catch (error) {
      console.error("Error updating goals: ", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Current Weight (kg)"
        keyboardType="numeric"
        onChangeText={setCurrentWeight}
        value={currentWeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Target Weight (kg)"
        keyboardType="numeric"
        onChangeText={setTargetWeight}
        value={targetWeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Daily Calorie Burn Goal"
        keyboardType="numeric"
        onChangeText={setDailyCalorieGoal}
        value={dailyCalorieGoal}
      />
      <TextInput
        style={styles.input}
        placeholder="Gender"
        onChangeText={setGender}
        value={gender}
      />
      <TextInput
        style={styles.input}
        placeholder="Height (cm)"
        keyboardType="numeric"
        onChangeText={setHeight}
        value={height}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        onChangeText={setAge}
        value={age}
      />
      <Picker
        selectedValue={activityLevel}
        style={styles.picker}
        onValueChange={(itemValue) => setActivityLevel(itemValue)}>
        <Picker.Item label="Sedentary: little or no exercise" value="sedentary" />
        <Picker.Item label="Lightly active: light exercise/sports 1-3 days/week" value="lightly active" />
        <Picker.Item label="Moderately active: moderate exercise/sports 3-5 days/week" value="moderately active" />
        <Picker.Item label="Very active: hard exercise/sports 6-7 days a week" value="very active" />
        <Picker.Item label="Extra active: very hard exercise/physical job & exercise 2x/day" value="extra active" />
      </Picker>
      <Button title="Update Goals" onPress={handleUpdateGoals} />
      <Text style={styles.bmrText}>Your BMR is: {bmr} calories/day</Text>
      {deficitDays.map(({ deficit, days }) => (
        <Text key={deficit} style={styles.bmrText}>
          Days to reach goal with a {deficit} calorie deficit: {days}
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  bmrText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default GoalForm;






