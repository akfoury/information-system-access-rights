import { SET_DISABLE_STEP_1,  SET_DISABLE_STEP_2, SET_SPACES_PROFIL } from "../actions/action-types";

const initialState = {
    disableStep1: false,
    disableStep2: true,
    spacesProfil: []
}

export default function StepReducer(state = initialState, action) {
    switch(action.type) {
        case SET_DISABLE_STEP_1: 
            return {
                ...state,
                disableStep1: action.payload
            }
        case SET_DISABLE_STEP_2: 
            return {
                ...state,
                disableStep2: action.payload
            }
        case SET_SPACES_PROFIL:
            return {
                ...state,
                spacesProfil: action.payload
            }
        default:
            return state;
    }
}