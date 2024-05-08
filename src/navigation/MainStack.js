import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../screens/Dashboard';
import GoalForm from '../screens/goalform';

const MainStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="GoalForm">
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainStack;