import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../screens/Dashboard';
import GoalForm from '../screens/goalform';
import DailyActivity from '../screens/dailyActivity';
import MentalHealth from '../screens/MentalHealth'; // Import the MentalHealth component

const MainStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MentalHealth">
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="GoalForm"
          component={GoalForm}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="DailyActivity"
          component={DailyActivity}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen // Add the MentalHealth screen to the stack
          name="MentalHealth"
          component={MentalHealth}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default MainStack;
