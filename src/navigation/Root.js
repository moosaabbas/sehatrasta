import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";

const Root = () => {
  const userDetail = useSelector((state) => state.user);
  const dispatch = useDispatch()

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userDetail')
      console.log('value from root', jsonValue);
      dispatch({ type: "setUser", payload: jsonValue })
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      console.log('error from fetching async data', e);
    }
  }
  useEffect(()=> {
    getData()
  },[])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {userDetail == null ? <AuthStack /> : <MainStack />}
    </GestureHandlerRootView>
  );
};

export default Root;

const styles = StyleSheet.create({});
