import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Dashboard from '../screens/Dashboard';
import HealthRecord from '../screens/HealthRecord'
import ImportedImage from '../screens/ImportedImage'; // Adjust path as needed

const MainStack = () => {
    const Stack = createNativeStackNavigator();
  
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="WelcomeScreen">
          <Stack.Screen
            name="HealthRecord"
            component={HealthRecord}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
          name="ImportedImage"
          component={ImportedImage}
          options={{ headerShown: false }} // or customize header here
        />
          
        </Stack.Navigator>
      </NavigationContainer>
    );
  };
  
  export default MainStack;
  
