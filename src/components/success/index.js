import React from 'react';
import "./success.css";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(2),
    },
    form: {
      margin: theme.spacing(2),
    }
}));

function Success({ setIsUpdated }) {
    const classes = useStyles();
    return (
        <>
        <div className="success">
            <div className="message">File successfully updated</div>
            <div className="icon">
                <CheckCircleIcon fontSize="large" />
            </div>
        </div>
        <div className="back">
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={() => setIsUpdated(false)}
            >
                Back
            </Button>
        </div>
        </>
    )
}

export default Success;
