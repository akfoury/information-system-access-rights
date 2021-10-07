import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slide from '@material-ui/core/Slide';
import { connect } from "react-redux";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function ProfilDeleteModal({ isProfilDelete, setProfil, deleteProfil, profil, setIsProfilDelete }) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setIsProfilDelete(false);
  };

  const handleDeleteProfil = () => {
    const index = profil.findIndex(item => item == deleteProfil);
    profil.map(item => console.log(item));
      setProfil([
        ...profil.slice(0, index), // everything before current post
        ...profil.slice(index + 1), // everything after current post
    ]);
  }

  useEffect(() => {
      setOpen(isProfilDelete);
  }, [isProfilDelete]);

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
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
          do you want to delete this Profil ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
              handleDeleteProfil();
              handleClose();
            }} 
            color="primary"
          >
            Yes
          </Button>
          <Button 
            onClick={() => {
              handleClose();
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

  }
}

const mapDispatchToProps = {

}

export default connect(mapStoreToProps, mapDispatchToProps)(ProfilDeleteModal);