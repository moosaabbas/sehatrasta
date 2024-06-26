import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Root from "./src/navigation/Root.js";
import { Provider } from "react-redux";
import { store } from "./src/redux/store.js";
import './firebaseConfig.js';

export default function App() {
  return (
    <Provider store={store}>
      <Root />
    </Provider>
  );
}
