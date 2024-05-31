import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, TextInput, ScrollView, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';
import { Light_Purple, Purple } from "../assets/utils/palette";
import { useSelector } from 'react-redux';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const userDetail = useSelector((state) => state.user);
  const [profileImage, setProfileImage] = useState(null);
  const [editingField, setEditingField] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diseases, setDiseases] = useState('');
  const [wellnessGoals, setWellnessGoals] = useState('');
  const [userSymptoms, setUserSymptoms] = useState([]);
  const [userDiseases, setUserDiseases] = useState([]);
  const [userWellnessGoals, setUserWellnessGoals] = useState([]);
  const [editingItem, setEditingItem] = useState({ type: '', index: -1 });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = firebase.auth().currentUser;
        if (userDetail) {
          const userDoc = await firebase.firestore().collection('users').doc(userDetail.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setUserData(userData);
            setProfileImage(userData.profileImage);
            setUserSymptoms(userData.symptoms || []);
            setUserDiseases(userData.diseases || []);
            setUserWellnessGoals(userData.wellnessGoals || []);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
      uploadImage(result.uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
      uploadImage(result.uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = firebase.storage().ref().child(`profile_pictures/${userDetail.uid}`);
    await ref.put(blob);
    const downloadURL = await ref.getDownloadURL();
    firebase.firestore().collection('users').doc(userDetail.uid).update({
      profileImage: downloadURL
    });
    setUserData(prevState => ({ ...prevState, profileImage: downloadURL }));
  };

  const handleUpdateField = (field, value) => {
    setUserData(prevState => ({ ...prevState, [field]: value }));
    setEditingField('');
    firebase.firestore().collection('users').doc(userDetail.uid).update({
      [field]: value
    });
  };

  const handleAddItem = (type) => {
    if (type === 'symptoms' && symptoms) {
      firebase.firestore().collection('users').doc(userDetail.uid).update({
        symptoms: firebase.firestore.FieldValue.arrayUnion(symptoms)
      }).then(() => {
        setUserSymptoms(prevState => [...prevState, symptoms]);
        setSymptoms(''); // Clear input field
      }).catch(error => {
        console.error("Error adding symptom:", error);
      });
    } else if (type === 'diseases' && diseases) {
      firebase.firestore().collection('users').doc(userDetail.uid).update({
        diseases: firebase.firestore.FieldValue.arrayUnion(diseases)
      }).then(() => {
        setUserDiseases(prevState => [...prevState, diseases]);
        setDiseases(''); // Clear input field
      }).catch(error => {
        console.error("Error adding disease:", error);
      });
    } else if (type === 'wellnessGoals' && wellnessGoals) {
      firebase.firestore().collection('users').doc(userDetail.uid).update({
        wellnessGoals: firebase.firestore.FieldValue.arrayUnion(wellnessGoals)
      }).then(() => {
        setUserWellnessGoals(prevState => [...prevState, wellnessGoals]);
        setWellnessGoals(''); // Clear input field
      }).catch(error => {
        console.error("Error adding wellness goal:", error);
      });
    }
  };

  const handleEditItem = (type, index) => {
    setEditingItem({ type, index });
    if (type === 'symptoms') {
      setSymptoms(userSymptoms[index]);
    } else if (type === 'diseases') {
      setDiseases(userDiseases[index]);
    } else if (type === 'wellnessGoals') {
      setWellnessGoals(userWellnessGoals[index]);
    }
  };

  const handleUpdateItem = (type) => {
    const updatedData = [...(type === 'symptoms' ? userSymptoms : type === 'diseases' ? userDiseases : userWellnessGoals)];
    const newValue = type === 'symptoms' ? symptoms : type === 'diseases' ? diseases : wellnessGoals;

    if (editingItem.index >= 0 && newValue) {
      updatedData[editingItem.index] = newValue;
      firebase.firestore().collection('users').doc(userDetail.uid).update({
        [type]: updatedData
      }).then(() => {
        if (type === 'symptoms') {
          setUserSymptoms(updatedData);
          setSymptoms('');
        } else if (type === 'diseases') {
          setUserDiseases(updatedData);
          setDiseases('');
        } else if (type === 'wellnessGoals') {
          setUserWellnessGoals(updatedData);
          setWellnessGoals('');
        }
        setEditingItem({ type: '', index: -1 });
      }).catch(error => {
        console.error(`Error updating ${type}:`, error);
      });
    }
  };

  const handleDeleteItem = (type, index) => {
    const updatedData = [...(type === 'symptoms' ? userSymptoms : type === 'diseases' ? userDiseases : userWellnessGoals)];
    const removedItem = updatedData.splice(index, 1);

    firebase.firestore().collection('users').doc(userDetail.uid).update({
      [type]: firebase.firestore.FieldValue.arrayRemove(...removedItem)
    }).then(() => {
      if (type === 'symptoms') {
        setUserSymptoms(updatedData);
      } else if (type === 'diseases') {
        setUserDiseases(updatedData);
      } else if (type === 'wellnessGoals') {
        setUserWellnessGoals(updatedData);
      }
    }).catch(error => {
      console.error(`Error deleting ${type}:`, error);
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage}>
            <Image source={{ uri: profileImage || 'https://example.com/dummy-profile-picture.png' }} style={styles.profileImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <MaterialIcons name="camera-alt" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData.fullName || 'Your Name'}</Text>
            <Text style={styles.userInfoText}>The profile reflects the information added by you.</Text>
          </View>
        </View>
        <View style={styles.fieldContainer}>
          <TouchableOpacity onPress={() => setEditingField('fullName')} style={styles.field}>
            <MaterialIcons name="person" size={24} color={Purple} />
            {editingField === 'fullName' ? (
              <TextInput
                style={styles.input}
                value={userData.fullName}
                onChangeText={(text) => handleUpdateField('fullName', text)}
                onSubmitEditing={() => handleUpdateField('fullName', userData.fullName)}
                autoFocus
              />
            ) : (
              <Text style={styles.fieldText}>{userData.fullName || 'Full Name'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditingField('email')} style={styles.field}>
            <MaterialIcons name="email" size={24} color={Purple} />
            <Text style={styles.fieldText}>{userData.email || 'Email'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditingField('dateOfBirth')} style={styles.field}>
            <MaterialIcons name="calendar-today" size={24} color={Purple} />
            {editingField === 'dateOfBirth' ? (
              <TextInput
                style={styles.input}
                value={userData.dateOfBirth}
                onChangeText={(text) => handleUpdateField('dateOfBirth', text)}
                onSubmitEditing={() => handleUpdateField('dateOfBirth', userData.dateOfBirth)}
                autoFocus
              />
            ) : (
              <Text style={styles.fieldText}>{userData.dateOfBirth || 'Date of Birth'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditingField('gender')} style={styles.field}>
            <MaterialIcons name="person" size={24} color={Purple} />
            {editingField === 'gender' ? (
              <TextInput
                style={styles.input}
                value={userData.gender}
                onChangeText={(text) => handleUpdateField('gender', text)}
                onSubmitEditing={() => handleUpdateField('gender', userData.gender)}
                autoFocus
              />
            ) : (
              <Text style={styles.fieldText}>{userData.gender || 'Gender'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditingField('maritalStatus')} style={styles.field}>
            <MaterialIcons name="wc" size={24} color={Purple} />
            {editingField === 'maritalStatus' ? (
              <TextInput
                style={styles.input}
                value={userData.maritalStatus}
                onChangeText={(text) => handleUpdateField('maritalStatus', text)}
                onSubmitEditing={() => handleUpdateField('maritalStatus', userData.maritalStatus)}
                autoFocus
              />
            ) : (
              <Text style={styles.fieldText}>{userData.maritalStatus || 'Marital Status'}</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Symptoms</Text>
          <View style={styles.addSection}>
            <TextInput
              style={styles.input}
              placeholder="Add symptom"
              value={symptoms}
              onChangeText={(text) => setSymptoms(text)}
            />
            <TouchableOpacity onPress={() => handleAddItem('symptoms')} style={styles.addButton}>
              <MaterialIcons name="add" size={24} color={Purple} />
            </TouchableOpacity>
          </View>
          {userSymptoms.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              {editingItem.type === 'symptoms' && editingItem.index === index ? (
                <TextInput
                  style={styles.input}
                  value={symptoms}
                  onChangeText={(text) => setSymptoms(text)}
                  onSubmitEditing={() => handleUpdateItem('symptoms')}
                  autoFocus
                />
              ) : (
                <Text style={styles.itemText} onPress={() => handleEditItem('symptoms', index)}>
                  {item}
                </Text>
              )}
              <TouchableOpacity onPress={() => handleDeleteItem('symptoms', index)}>
                <MaterialIcons name="delete" size={24} color={Purple} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Diseases</Text>
          <View style={styles.addSection}>
            <TextInput
              style={styles.input}
              placeholder="Add disease"
              value={diseases}
              onChangeText={(text) => setDiseases(text)}
            />
            <TouchableOpacity onPress={() => handleAddItem('diseases')} style={styles.addButton}>
              <MaterialIcons name="add" size={24} color={Purple} />
            </TouchableOpacity>
          </View>
          {userDiseases.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              {editingItem.type === 'diseases' && editingItem.index === index ? (
                <TextInput
                  style={styles.input}
                  value={diseases}
                  onChangeText={(text) => setDiseases(text)}
                  onSubmitEditing={() => handleUpdateItem('diseases')}
                  autoFocus
                />
              ) : (
                <Text style={styles.itemText} onPress={() => handleEditItem('diseases', index)}>
                  {item}
                </Text>
              )}
              <TouchableOpacity onPress={() => handleDeleteItem('diseases', index)}>
                <MaterialIcons name="delete" size={24} color={Purple} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Wellness Goals</Text>
          <View style={styles.addSection}>
            <TextInput
              style={styles.input}
              placeholder="Add wellness goal"
              value={wellnessGoals}
              onChangeText={(text) => setWellnessGoals(text)}
            />
            <TouchableOpacity onPress={() => handleAddItem('wellnessGoals')} style={styles.addButton}>
              <MaterialIcons name="add" size={24} color={Purple} />
            </TouchableOpacity>
          </View>
          {userWellnessGoals.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              {editingItem.type === 'wellnessGoals' && editingItem.index === index ? (
                <TextInput
                  style={styles.input}
                  value={wellnessGoals}
                  onChangeText={(text) => setWellnessGoals(text)}
                  onSubmitEditing={() => handleUpdateItem('wellnessGoals')}
                  autoFocus
                />
              ) : (
                <Text style={styles.itemText} onPress={() => handleEditItem('wellnessGoals', index)}>
                  {item}
                </Text>
              )}
              <TouchableOpacity onPress={() => handleDeleteItem('wellnessGoals', index)}>
                <MaterialIcons name="delete" size={24} color={Purple} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F6',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C3A3F0',
  },
  cameraButton: {
    marginLeft: -25,
    backgroundColor: '#7015EC',
    padding: 5,
    borderRadius: 50,
  },
  userInfo: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#36373A',
  },
  userInfoText: {
    color: '#A97FE3',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EFFC',
  },
  fieldText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#36373A',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#36373A',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#36373A',
  },
  addSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EFFC',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  itemText: {
    fontSize: 16,
    color: '#36373A',
    flex: 1,
  },
});

export default Profile;