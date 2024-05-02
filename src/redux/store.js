import { createStore } from "redux";
import userDetail from "../redux/reducers.js";

export const store = createStore(userDetail);
