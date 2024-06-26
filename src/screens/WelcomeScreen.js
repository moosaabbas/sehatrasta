import React, { useRef } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';

const WelcomeScreen = () => {
  const video = useRef(null);
  const navigation = useNavigation();
  StatusBar.setBarStyle('light-content');
  const CreateVideo = require('../assets/videos/welcome.mp4');

  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      <Video
        ref={video}
        source={CreateVideo}
        style={styles.fullScreen}
        resizeMode="cover"
        shouldPlay
        isLooping
      />
      <View style={styles.bottomContainer}>
        <Text style={styles.headingText}>sehat rasta app</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.signUpButton]}
          onPress={() => navigation.navigate('SignupScreen')}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  headingText: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'purple',
    width: '100%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 10,
  },
  signUpButton: {
    backgroundColor: 'black',
    borderColor: 'grey',
    borderWidth: 1.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
