import { 
    SET_FIRSTNAME, 
    SET_LASTNAME, SET_EMAIL, 
    SET_STATUS, 
    SET_USERS, 
    SET_USER_ID, 
    SET_GROUPS, 
    SET_GROUP_USAGE, 
    UPDATE_USERS, 
    UPDATE_GROUPS, 
    SET_CURRENT_USER, 
    SET_KNOWN_GROUPS, 
    SET_SAVED_USERS,
    DELETE_USERS,
    DELETE_SAVED_USERS,
    IS_UPDATE_PROFIL
} from "../actions/action-types";

const initialState = {
    update: "",
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    status: undefined,
    users: [],
    userID: 0,
    groupUsage: [],
    currentUser: {},
    knownGroups: [],
    savedUsers: [],
    isUpdateProfil: false
}

export default function UserInfoReducer(state = initialState, action) {
    switch(action.type) {
        case SET_FIRSTNAME:
            return {
                ...state,
                FirstName: action.payload
            }
        case SET_LASTNAME:
            return {
                ...state,
                LastName: action.payload
            }
        case SET_EMAIL:
            return {
                ...state,
                Email: action.payload
            }
        case SET_STATUS:
            return {
                ...state,
                UserStatus: action.payload
            }
        case SET_USERS:
            return {
                ...state,
                users: [...state.users, action.payload]
            }
        case UPDATE_USERS:
            const index2 = state.users.findIndex(item => item.FirstName.concat(", ", item.LastName) === action.payload.FirstName.concat(", ", action.payload.LastName));
            return {
                ...state,
                users: [
                    ...state.users.slice(0, index2), // everything before current post
                    action.payload,
                    ...state.users.slice(index2 + 1), // everything after current post
                ]
            }
        case SET_CURRENT_USER:
            return {
                ...state,
                currentUser: action.payload
            }
        case SET_USER_ID:
            return {
                ...state,
                userID: action.payload + 1
            }
        case SET_GROUPS:
            const index = state.userID;

            return { 
                ...state, 
                users: state.users.map(
                    (content, i) => i === index-1 ? {...content, AffectedGroups: action.payload} : content
                )
            }
        case UPDATE_GROUPS:
            const index3 = state.users.findIndex(item => item.FirstName.concat(", ", item.LastName) === state.currentUser.FirstName.concat(", ", state.currentUser.LastName));
            return {
                ...state,
                users: [
                    ...state.users.slice(0, index3), // everything before current post
                    {
                        ...state.users[index3],
                        AffectedGroups: action.payload
                    },
                    ...state.users.slice(index3 + 1), // everything after current post
                ]
            }
        case SET_GROUP_USAGE:
            return {
                ...state,
                groupUsage: action.payload
            }
        case SET_KNOWN_GROUPS:
            return {
                ...state,
                knownGroups: action.payload
            }
        case SET_SAVED_USERS:
            return {
                ...state,
                savedUsers: action.payload
            }
        case DELETE_USERS:
            return {
                ...state,
                users: []
            }
        case DELETE_SAVED_USERS:
            return {
                ...state,
                savedUsers: []
            }
        case IS_UPDATE_PROFIL:
            return {
                ...state,
                isUpdateProfil: action.payload
            }
        default:
            return state;
    }
}