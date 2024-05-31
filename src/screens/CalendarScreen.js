import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { CalendarList } from "react-native-calendars";
import { firebase } from "../../firebaseConfig"; // Update the path if necessary
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSelector } from "react-redux";

const CalendarScreen = () => {
  const userDetail = useSelector((state) => state.user);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicineName, setMedicineName] = useState("");
  const [time, setTime] = useState(new Date());
  const [frequency, setFrequency] = useState("daily");
  const [interval, setInterval] = useState(6);
  const [specificInterval, setSpecificInterval] = useState(3);
  const [endDate, setEndDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState({});
  const [medicines, setMedicines] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(true);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    if (userDetail && userDetail.uid) {
      fetchMedicines();
    }
  }, [userDetail]);

  const fetchMedicines = async () => {
    if (userDetail && userDetail.uid) {
      try {
        const medicinesDoc = await firebase
          .firestore()
          .collection("users")
          .doc(userDetail.uid)
          .get();
        if (medicinesDoc.exists) {
          const fetchedMedicines = medicinesDoc.data();
          setMedicines(fetchedMedicines);
          markDates(fetchedMedicines);
        }
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    }
  };

  const markDates = (data) => {
    const dates = {};
    Object.keys(data).forEach((date) => {
      dates[date] = { marked: true, dotColor: "red" };
    });
    setMarkedDates(dates);
  };

  const handleAddMedicine = async () => {
    if (!medicineName || !time || !selectedDate || !endDate) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const startDate = new Date(selectedDate);
    const endDateObject = new Date(endDate);
    if (endDateObject < startDate) {
      Alert.alert("Error", "End date must be after start date.");
      return;
    }

    if (userDetail && userDetail.uid) {
      try {
        const medicineNames = medicineName.split(",").map(name => name.trim());
        const newMedicineDataArray = medicineNames.map(name => ({
          medicineName: name,
          time: time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          frequency,
          date: selectedDate,
          interval: frequency === "daily" ? interval : specificInterval,
          endDate: endDate.toISOString().split("T")[0],
        }));

        const docRef = firebase.firestore().collection("users").doc(userDetail.uid);
        const doc = await docRef.get();
        let existingMedicines = doc.exists && doc.data().medicines ? doc.data().medicines : [];

        if (!Array.isArray(existingMedicines)) {
          existingMedicines = []; // Ensure it's an array if undefined or incorrectly formatted
        }

        const updatedMedicines = existingMedicines.concat(newMedicineDataArray);
        await docRef.set({ medicines: updatedMedicines }, { merge: true });

        Alert.alert("Success", "Medicine added successfully");
        fetchMedicines();
        resetForm();
      } catch (error) {
        console.error("Error adding medicine:", error);
        Alert.alert("Error", error.message);
      }
    }
  };

  const resetForm = () => {
    setMedicineName("");
    setTime(new Date());
    setFrequency("daily");
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setInterval(6);
    setSpecificInterval(3);
    setEndDate(new Date());
    setModalVisible(false);
  };

  const openModal = (date) => {
    setSelectedDate(date.dateString);
    setModalVisible(true);
  };

  const onTimeChange = (event, selectedDate) => {
    const currentTime = selectedDate || time;
    setShowTimePicker(Platform.OS === "ios");
    setTime(currentTime);
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === "ios");
    setEndDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <CalendarList
        onDayPress={openModal}
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, selectedColor: "#6200EE" },
        }}
      />
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Medicine</Text>
            <TextInput
              style={styles.input}
              placeholder="Medicine Name (comma separated)"
              value={medicineName}
              onChangeText={setMedicineName}
            />
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChange}
              />
            </View>
            <Picker
              selectedValue={frequency}
              onValueChange={(itemValue) => setFrequency(itemValue)}
              style={{height: 160, marginBottom: 20}}
            >
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Weekly" value="weekly" />
              <Picker.Item label="Monthly" value="monthly" />
              <Picker.Item label="Specific Days" value="specificDays" />
            </Picker>
            {frequency === "daily" && (
              <Picker
                selectedValue={interval}
                onValueChange={(itemValue) => setInterval(itemValue)}
                style={{height: 160, marginBottom: 30}}
              >
                <Picker.Item label="Every 6 hours" value={6} />
                <Picker.Item label="Every 8 hours" value={8} />
                <Picker.Item label="Every 12 hours" value={12} />
              </Picker>
            )}
            {frequency === "specificDays" && (
              <TextInput
                style={styles.input}
                placeholder="Interval (e.g., 3 for every 3 days)"
                keyboardType="numeric"
                value={specificInterval.toString()}
                onChangeText={(text) => setSpecificInterval(Number(text))}
              />
            )}
            <Text style={styles.modalTitle}>Select End Date:</Text>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                style={styles.dateTimePicker}
                onChange={onEndDateChange}
              />
            </View>
            <Button title="Add Medicine" onPress={handleAddMedicine} />
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>
      <View>
        {selectedDate && medicines[selectedDate] && (
          <View style={styles.medicineContainer}>
            <Text style={styles.dateText}>Medicines for {selectedDate}:</Text>
            {medicines[selectedDate].map((medicine, index) => (
              <View key={index} style={styles.medicineDetail}>
                <Text>
                  {medicine.medicineName} at {medicine.time} -{" "}
                  {medicine.frequency}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  modalContainer: {
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  pickerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  dateTimePicker: {
    width: '100%',
    alignSelf: 'center'
  },
  medicineContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
  },
  dateText: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  medicineDetail: {
    paddingVertical: 5,
  },
});

export default CalendarScreen;
