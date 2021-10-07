import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function SuccessUpdateFiles({ isUpdateFile, setIsUpdateFile }) {
  const [open, setOpen] = React.useState(isUpdateFile);

  const handleClose = () => {
    setOpen(false);
    setIsUpdateFile(false);
  };

  return (
    <div className="success">
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
        <div className="container">
          <div className="content"><DialogTitle id="alert-dialog-slide-title">File(s) Successfully updated</DialogTitle></div>
          <DialogActions>
          <Button 
            onClick={handleClose}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
        </div>
      </Dialog>
    </div>
  );
}

export default SuccessUpdateFiles;