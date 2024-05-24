// Root.js
import { SafeAreaView, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebase } from "../../firebaseConfig"; // Ensure this is correctly imported

const Root = () => {
  const userDetail = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userDetail');
      const parsedValue = JSON.parse(jsonValue);
      if (parsedValue) {
        dispatch({ type: "setUser", payload: parsedValue });
      }
    } catch (e) {
      console.log('Error fetching async data', e);
    }
  };

  useEffect(() => {
    getData();
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        dispatch({ type: "setUser", payload: user });
      } else {
        dispatch({ type: "setUser", payload: null });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {userDetail == null ? <AuthStack /> : <MainStack />}
    </GestureHandlerRootView>
  );
};

export default Root;

const styles = StyleSheet.create({});
