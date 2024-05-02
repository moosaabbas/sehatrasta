import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthStack from "./AuthStack";

const Root = () => {
  const userDetail = useSelector((state) => state.user);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthStack/>
      {/* {userDetail == null ? <AuthStack /> : <LoaderStack />} */}
    </GestureHandlerRootView>
  );
};

export default Root;

const styles = StyleSheet.create({});
