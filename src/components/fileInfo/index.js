import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import InfoIcon from '@material-ui/icons/Info';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
}));

function FileInfo({ fileInfo }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <Button aria-describedby={id} variant="contained" color="primary" onClick={handleClick} endIcon={<InfoIcon />} style={{ borderRadius: 50 }} >
        Files Info
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box display="flex" flexDirection="column">
          {fileInfo.map(item => (
            <Typography className={classes.typography} display="flex"><b dangerouslySetInnerHTML={{__html: `${item.fileName}`}} /> - {item.lastModifiedDate}</Typography>
          ))}
        </Box>
      </Popover>
    </div>
  );
}

export default FileInfo;
