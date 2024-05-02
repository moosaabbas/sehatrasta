initialState = {
  user: null,
};

const userDetail = (state = initialState, action) => {
  switch (action.type) {
    case "setUser":
      console.log("setUser dispatch received");
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};

export default userDetail;
