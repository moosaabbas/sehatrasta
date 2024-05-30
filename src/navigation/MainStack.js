import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Dashboard from "../screens/Dashboard";
import Pregnancy from "../screens/Pregnancy";
import ChatAssistant from "../screens/ChatAssistant";
import MentalHealth from "../screens/MentalHealth";
import DailyActivity from "../screens/dailyActivity";
import GoalForm from "../screens/goalform";
import MedChecker from "../screens/MedChecker";
import HealthRecord from "../screens/HealthRecord";
import ImportedImage from "../screens/ImportedImage";

import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Purple } from "../assets/utils/palette";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack navigators for each tab
const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="DailyActivity" component={DailyActivity} />
      <Stack.Screen name="GoalForm" component={GoalForm} />
      <Stack.Screen name="Pregnancy" component={Pregnancy} />
      <Stack.Screen name="HealthRecord" component={HealthRecord} />
      <Stack.Screen name="Profile" component={ImportedImage} />
      <Stack.Screen name="MedChecker" component={MedChecker} />
      <Stack.Screen name="ChatAssistant" component={ChatAssistant} />
      <Stack.Screen name="MentalHealth" component={MentalHealth} />
    </Stack.Navigator>
  );
};

// const PregnancyStack = () => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
      
//     </Stack.Navigator>
//   );
// };

// const ProfileStack = () => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
      
//     </Stack.Navigator>
//   );
// };

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Dashboard"
        component={AppStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialIcons name="home" size={24} color={focused ? Purple : "gray"} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? Purple : 'gray', fontSize: 12 }}>Dashboard</Text>
          )
        }}
      />
      <Tab.Screen
        name="Pregnancy"
        component={Pregnancy}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialIcons name="calendar-today" size={24} color={focused ? Purple : "gray"} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? Purple : 'gray', fontSize: 12 }}>Pregnancy</Text>
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DailyActivity}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialIcons name="person" size={24} color={focused ? Purple : "gray"} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ color: focused ? Purple : 'gray', fontSize: 12 }}>Profile</Text>
          )
        }}
      />
    </Tab.Navigator>
  );
}

const MainStack = () => {
  return (
    <View style={{ flex: 1 }}>
      <MainTabs />
    </View>
  );
};

export default MainStack;
