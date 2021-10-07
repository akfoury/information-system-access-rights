import { 
    SET_DISABLE_STEP_1, 
    SET_DISABLE_STEP_2, 
    SET_USERS_DB, 
    SET_USERS,
    SET_STATUS, 
    SET_EMAIL, 
    SET_LASTNAME, 
    SET_FIRSTNAME, 
    SET_GROUP_SPACE_DB,
    SET_USER_ID,
    SET_GROUPS,
    SET_GROUP_USAGE,
    UPDATE_USERS,
    UPDATE_GROUPS,
    SET_CURRENT_USER,
    UPDATE_USERS_DB,
    SET_KNOWN_GROUPS,
    SET_SAVED_USERS,
    DELETE_USERS,
    DELETE_SAVED_USERS,
    IS_UPDATE_PROFIL,
    SET_JSON,
    CHANGE_USERS_DB,
    SET_SPACES_PROFIL,
} from "./action-types";

export const setDisableStep1 = bool => dispatch => {
    dispatch({ type: SET_DISABLE_STEP_1, payload: bool });
}

export const setDisableStep2 = bool => dispatch => {
    dispatch({ type: SET_DISABLE_STEP_2, payload: bool });
}

export const setUsersDB = usersDB => dispatch => {
    dispatch({ type: SET_USERS_DB, payload: usersDB });
}

export const setUsers = user => dispatch => {
    dispatch({ type: SET_USERS, payload: user });
}

export const setStatus = status => dispatch => {
    dispatch({ type: SET_STATUS, payload: status });
}

export const setEmail = email => dispatch => {
    dispatch({ type: SET_EMAIL, payload: email });
}

export const setLastName = lastname => dispatch => {
    dispatch({ type: SET_LASTNAME, payload: lastname });
}

export const setFirstName = firstname => dispatch => {
    dispatch({ type: SET_FIRSTNAME, payload: firstname });
}

export const setGroupSpaceDB = groupSpaceDB => dispatch => {
    dispatch({ type: SET_GROUP_SPACE_DB, payload: groupSpaceDB });
}

export const setUserID = userID => dispatch => {
    dispatch({ type: SET_USER_ID, payload: userID });
}

export const setGroups = groups => dispatch => {
    dispatch({ type: SET_GROUPS, payload: groups });
}

export const setGroupUsage = groupUsage => dispatch => {
    dispatch({ type: SET_GROUP_USAGE, payload: groupUsage });
}

export const updateUsers = users => dispatch => {
    dispatch({ type: UPDATE_USERS, payload: users });
}

export const updateGroups = groups => dispatch => {
    dispatch({ type: UPDATE_GROUPS, payload: groups });
}

export const setCurrentUser = currentUser => dispatch => {
    dispatch({ type: SET_CURRENT_USER, payload: currentUser});
}

export const updateUsersDB = users => dispatch => {
    dispatch({ type: UPDATE_USERS_DB, payload: users});
}

export const setKnownGroups = knownGroups => dispatch => {
    dispatch({ type: SET_KNOWN_GROUPS, payload: knownGroups })
}

export const setSavedUsers = savedUsers => dispatch => {
    dispatch({ type: SET_SAVED_USERS, payload: savedUsers});
}

export const deleteUsers = users => dispatch => {
    dispatch({ type: DELETE_USERS });
}

export const deleteSavedUsers = savedUsers => dispatch => {
    dispatch({ type: DELETE_SAVED_USERS });
}

export const setIsUpdateProfil = updateProfil => dispatch => {
    dispatch({ type: IS_UPDATE_PROFIL, payload: updateProfil});
}

export const setJSON = json => dispatch => {
    dispatch({ type: SET_JSON, payload: json});
}

export const changeUsersDB = usersDB => dispatch => {
    dispatch({ type: CHANGE_USERS_DB, payload: usersDB});
}

export const setSpacesProfil = spacesProfil => dispatch => {
    dispatch({ type: SET_SPACES_PROFIL, payload: spacesProfil});
}
