import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../screens/Dashboard';
import Pregnancy from '../screens/Pregnancy';
import ChatAssistant from '../screens/ChatAssistant';
import MentalHealth from '../screens/MentalHealth';
import DailyActivity from '../screens/dailyActivity'; 
import GoalForm from '../screens/goalform';
import MedChecker from '../screens/MedChecker';
import HealthRecord from '../screens/HealthRecord';
import ImportedImage from '../screens/ImportedImage';

const MainStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Pregnancy"
        component={Pregnancy}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatAssistant"
        component={ChatAssistant}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MentalHealth"
        component={MentalHealth}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DailyActivity"
        component={DailyActivity}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GoalForm"
        component={GoalForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MedChecker"
        component={MedChecker}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HealthRecord"
        component={HealthRecord}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ImportedImage"
        component={ImportedImage}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;
