import AsyncStorage from "@react-native-async-storage/async-storage";
initialState = {
  user: null,
};

const storeData = async (value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('userDetail', jsonValue)
    console.log("value saved");
  } catch (e) {
    console.log(e);
    // saving error
  }
}

const userDetail = (state = initialState, action) => {
  switch (action.type) {
    case "setUser":
      return {
        ...state,
        user: action.payload,
      };

      case "logout":
      console.log("logout init");
      AsyncStorage.removeItem('userDetail');
      return {
        user: null,
      };
    default:
      return state;
  }
};

export default userDetail;
