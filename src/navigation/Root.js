import React, { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebase } from "../../firebaseConfig";
import { Purple } from "../assets/utils/palette";

const Root = () => {
  const userDetail = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [showStack, setShowStack] = useState(null);
  const [loading, setLoading] = useState(true);  // State to control the ActivityIndicator

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userDetail');
      if (jsonValue) {
        const parsedValue = JSON.parse(jsonValue);
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

  useEffect(() => {
    setTimeout(() => {
      setShowStack(userDetail);
      setLoading(false);  // Turn off the loading indicator after 2 seconds
    }, 2500);
  }, [userDetail]);

  if (loading) {
    return (
      <View style={styles.centeredView}>
        <ActivityIndicator size="large" color={Purple} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {showStack == null ? <AuthStack /> : <MainStack />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default Root;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
