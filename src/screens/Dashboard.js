import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";

const Dashboard = () => {
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userDetail');
      console.log('value stored in json and ret');
      dispatch({ type: "setUser", payload: jsonValue });
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log('error from fetching async data', e);
    }
  };

  const deleteData = async () => {
    console.log('click');
    try {
      await AsyncStorage.removeItem('userDetail');
      console.log("Data successfully deleted");
      await getData();
    } catch (e) {
      console.error("Failed to delete the data", e);
    }
  };

  return (
    <SafeAreaView>
      <Text>Dashboard</Text>
      <Button title="logout" onPress={deleteData} />
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({});
