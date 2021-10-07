import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { updateUsers, setCurrentUser, setUsers, setDisableStep1, setDisableStep2, setUserID, setFirstName, setLastName, setEmail } from "../../actions"
import { connect } from "react-redux";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function DialogModal({ isUserUpdate, FirstName, LastName, Email, updateUsers, setCurrentUser, setUsers, users, setDisableStep1, setDisableStep2, setUserID, knownGroups, usersDB }) {
  const [open, setOpen] = React.useState(isUserUpdate === 'updated' || 'n/a' ? true : false);

  const text = {
      __html: `${FirstName} ${LastName}`
  }

  const handleClose = () => {
    setOpen(false);
  };

  const addToUsersList = () => {
    let user = "";
    if(Email != undefined) {
      let userDB = usersDB.filter(item => item.Email === Email);
      if(userDB) {
        user = {Update: isUserUpdate, LastName: userDB[0].LastName, FirstName: userDB[0].FirstName, Email: Email, UserStatus: '', AffectedGroups: knownGroups};
      }
    } else if (FirstName != undefined && LastName != undefined) {
      let userDB = usersDB.filter(item => item.FirstName === FirstName && item.LastName === LastName);
      if(userDB) {
        user = {Update: isUserUpdate, LastName: LastName, FirstName: FirstName, Email: userDB[0].Email, UserStatus: '', AffectedGroups: knownGroups};
      }
    } else {
      user = {Update: isUserUpdate, LastName: LastName, FirstName: FirstName, Email: Email, UserStatus: '', AffectedGroups: knownGroups};
    }

    users.filter(item => item.FirstName.concat(', ', item.LastName) === user.FirstName.concat(', ', user.LastName)).length !== 0 ? updateUsers(user) : setUsers(user);
    setCurrentUser(user);
  }

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle id="alert-dialog-slide-title"><b dangerouslySetInnerHTML={text} /> is a known user.</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
          do you want to update these rights ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
              handleClose();
              addToUsersList();
              setDisableStep2(false);
            }} 
            color="primary"
          >
            Yes
          </Button>
          <Button 
            onClick={() => {
              handleClose();
              setUserID(-1);
              setDisableStep1(false);
            }}
            color="primary"
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const mapStoreToProps = store => {
  return {
    FirstName: store.userInfo.FirstName,
    LastName: store.userInfo.LastName,
    Email: store.userInfo.Email,
    userID: store.userInfo.userID,
    users: store.userInfo.users,
    knownGroups: store.userInfo.knownGroups,
    usersDB: store.indexedDB.usersDB
  }
}

const mapDispatchToProps = {
  updateUsers,
  setCurrentUser,
  setUsers,
  setDisableStep1,
  setDisableStep2,
  setUserID,
  setFirstName,
  setLastName,
  setEmail
}

export default connect(mapStoreToProps, mapDispatchToProps)(DialogModal);