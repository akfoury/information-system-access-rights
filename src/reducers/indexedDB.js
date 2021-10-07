import { SET_USERS_DB, SET_GROUP_SPACE_DB, UPDATE_USERS_DB, SET_JSON, CHANGE_USERS_DB } from "../actions/action-types";

const initialState = {
    usersDB: [],
    groupSpaceDB: [],
    json: []
}

export default function IndexedDBReducer(state = initialState, action) {
    switch(action.type) {
        case SET_USERS_DB: 
            return {
                ...state,
                usersDB: [...action.payload, ...state.usersDB]
            }
        case UPDATE_USERS_DB:
            let users;
            action.payload.map(user => {
                const index = state.usersDB.findIndex(item => item.FirstName.concat(", ", item.LastName) === user.FirstName.concat(", ", user.LastName));

                users = index !== -1 ? (
                    {
                        ...state,
                        usersDB: [
                            ...state.usersDB.slice(0, index), // everything before current post
                            user,
                            ...state.usersDB.slice(index + 1), // everything after current post
                        ]
                    }
                ) : (
                    {
                        ...state,
                        usersDB: [user, ...state.usersDB]
                    }
                )
            })
            return users;
        case SET_GROUP_SPACE_DB: 
            return {
                ...state,
                groupSpaceDB: action.payload
            }
        case SET_JSON:
            return {
                ...state,
                json: action.payload
            }
        case CHANGE_USERS_DB:
            return {
                ...state,
                usersDB: action.payload
            }
        default:
            return state;
    }
}