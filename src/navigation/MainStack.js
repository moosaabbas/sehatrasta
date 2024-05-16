import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Dashboard from '../screens/Dashboard';
import Pregnancy from '../screens/Pregnancy';


const MainStack = () => {
    const Stack = createNativeStackNavigator();
  
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen
            name="Dashboard"
            component={Dashboard}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Pregnancy"
            component={Pregnancy}
            options={{
              headerShown: false,
            }}
          />
          
        </Stack.Navigator>
      </NavigationContainer>
    );
  };
  
  export default MainStack;
  