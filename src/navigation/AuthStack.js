import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

const AuthStack = () => {
    const Stack = createNativeStackNavigator();
  
    return (
      <Stack.Navigator initialRouteName="WelcomeScreen">
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SignupScreen"
          component={SignupScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    );
  };
  
  export default AuthStack;
