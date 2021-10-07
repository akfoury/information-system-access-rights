import { combineReducers } from "redux";
import StepReducer from "./step";
import UserInfoReducer from "./userInfo";
import IndexedDBReducer from "./indexedDB";

const rootReducer = combineReducers({
    step: StepReducer,
    userInfo: UserInfoReducer,
    indexedDB: IndexedDBReducer
});

export default rootReducer;