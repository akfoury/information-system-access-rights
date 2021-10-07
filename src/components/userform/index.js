import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import Button from '@material-ui/core/Button';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import { setFirstName, setLastName, setEmail, setDisableStep1, setUserID, setKnownGroups } from "../../actions";
import "./userform.css";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(0.3),
  },
  form: {
    margin: theme.spacing(2),
  }
}));

function UserForm({ LastName, FirstName, setFirstName, Email, setLastName, setEmail, setDisableStep1, usersDB, setIsUserUpdate, userID, setUserID, setKnownGroups }) {
  const classes = useStyles();

  const isUserNew = () => {
    if(FirstName != undefined && LastName != undefined) {
      const userFullName = LastName.concat(', ', FirstName);
      const unKnownUser = usersDB.filter(item => item.FullName === userFullName);
  
      if(unKnownUser.length === 0) {
        setIsUserUpdate('new');
      } else {
        setKnownGroups(unKnownUser[0].AffectedGroups);
        setIsUserUpdate(unKnownUser[0].Update);
      }
    } else if (Email != undefined) {
      const unKnownUser = usersDB.filter(item => item.Email === Email);

      if(unKnownUser.length === 0) {
        setIsUserUpdate('new');
      } else {
        setKnownGroups(unKnownUser[0].AffectedGroups);
        setIsUserUpdate(unKnownUser[0].Update);
      }
    }
  }

  return (
    <MuiThemeProvider>
      <React.Fragment>
        <div className={classes.form}>
          <h2>Personal Details</h2>
          <TextField
            hintText="Enter your First Name"
            floatingLabelText="First Name"
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="new-password"
          />
          <br/>
          <TextField
            hintText="Enter your Last Name"
            floatingLabelText="Last Name"
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="new-password"
          />
          <br />
          <TextField
            hintText="Enter your Email"
            floatingLabelText="Email"
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="new-password"
    
          />
          <br />
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            endIcon={<NavigateNextIcon />}
            onClick={() => {
              isUserNew();
              setUserID(userID);
              setDisableStep1(true);
            }}
          >
            Next
          </Button>
        </div>
      </React.Fragment>
    </MuiThemeProvider>
  )
}

const mapStoreWithProps = store => {
  return {
    LastName: store.userInfo.LastName,
    FirstName: store.userInfo.FirstName,
    Email: store.userInfo.Email,
    users: store.userInfo.users,
    usersDB: store.indexedDB.usersDB,
    userID: store.userInfo.userID,
  }
}

const mapDispatchWithProps = {
  setFirstName,
  setLastName,
  setEmail,
  setDisableStep1,
  setUserID,
  setKnownGroups
}

export default connect(mapStoreWithProps, mapDispatchWithProps)(UserForm);
