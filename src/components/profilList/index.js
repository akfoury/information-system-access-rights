import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import SettingsIcon from '@material-ui/icons/Settings';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import PublishIcon from '@material-ui/icons/Publish';
import GetAppIcon from '@material-ui/icons/GetApp';
import CloseIcon from '@material-ui/icons/Close';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from "react-redux";
import { setKnownGroups } from "../../actions";
import $ from "jquery";
import ProfilDeleteModal from "../ProfilDeleteModal";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    maxWidth: 752,
  },
  listItem: {
    backgroundColor: 'none',
    "&:hover": {
        backgroundColor: 'rgba(0,0,0,0.05);',
        cursor: 'pointer'
    }
  },
  button: {
    margin: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      minWidth: 32,
      paddingLeft: 8,
      paddingRight: 8,
      marginBottom: 40,
      cursor: "pointer",
      "& .MuiButton-startIcon": {
        margin: 0
      }
    }
  },
  buttonText: {
    [theme.breakpoints.down("sm")]: {
      display: "none"
    },
    display: "flex",
    marginRight: 5
  }
}));

function ProfilList({ profil, handleOpenProfil, setProfil, setKnownSpaces, setKnownGroups, knownGroups, isProfilDelete, setIsProfilDelete, deleteProfil, setDeleteProfil }) {
    const classes = useStyles();

    let inputRef = useRef(null);

    const downloadTxtFile = () => {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(profil, null, 1)], {type: 'application/json'});
      element.href = URL.createObjectURL(file);
      element.download = "myFile.txt";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    }

    const handleProfilClick = (e) => {
      $(e.currentTarget).parent().nextAll().each((index, item) => $(item).find('.MuiListItem-root').css('background-color', 'transparent'));
      $(e.currentTarget).parent().nextAll().find('.MuiTypography-root').css('color', 'black');
      $(e.currentTarget).parent().nextAll().each((index, item) => $(item).children().next().find('.MuiSvgIcon-root').css('fill', '#3c54b4'));
      $(e.currentTarget).parent().nextAll().each((index, item) => $(item).children().removeClass('clicked'));

      $(e.currentTarget).parent().prevAll().each((index, item) =>  $(item).find('.MuiListItem-root').css('background-color', 'transparent'));
      $(e.currentTarget).parent().prevAll().find('.MuiTypography-root').css('color', 'black');
      $(e.currentTarget).parent().prevAll().each((index, item) => $(item).children().next().find('.MuiSvgIcon-root').css('fill', '#3c54b4'));
      $(e.currentTarget).parent().prevAll().each((index, item) => $(item).children().removeClass('clicked'));

      if($(e.currentTarget).hasClass('clicked')) {
        $(e.currentTarget).css('background-color', 'transparent');
        $(e.currentTarget).find('.MuiTypography-root').css('color', 'black');
        $(e.currentTarget).next().find('.MuiSvgIcon-root').css('fill', '#3c54b4');
        $(e.currentTarget).removeClass('clicked');
        setKnownSpaces([]);
        setKnownGroups(knownGroups);
      } else {
        setKnownSpaces(profil[$(e.currentTarget).parent('.MuiListItem-container').index()].spaces);
        $(e.currentTarget).css('background-color', 'rgba(60, 84, 180, 0.35)');
        $(e.currentTarget).find('.MuiTypography-root').css('color', 'white');
        $(e.currentTarget).next().find('.MuiSvgIcon-root').css('fill', 'white');
        $(e.currentTarget).addClass('clicked');
      }
    }
    return (
      <>
        <input type="file" ref={(ref) => inputRef = ref} style={{ display: 'none' }} id="myinput" onChange={(e) => {
          const fileReader = new FileReader();

          fileReader.onload = (e) => {
            setProfil(JSON.parse(e.target.result));
          }
          fileReader.readAsBinaryString(e.target.files[0], "UTF-8");

          e.target.value = null;
          return false;
        }}
        />
        <Scrollbars style={{ width: 302, height: 300 }} renderTrackHorizontal={props => <div {...props} style={{display: 'none'}} className="track-horizontal"/>}>
          <Grid item xs={16} md={12}>
              <List>
                {profil.map((item, index) => (
                  <ListItem className={classes.listItem} onClick={e => handleProfilClick(e)}>
                      <ListItemText
                          disableTypography
                          primary={<Typography type="body2" style={{ fontWeight: 700 }}>{item.name}</Typography>}
                      />
                      <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="delete">
                          <CloseIcon 
                            style={{fill: "#3f51b5"}} 
                            onClick={(e) => {
                              setIsProfilDelete(true);
                              console.log(profil);
                              console.log($(e.currentTarget));
                              console.log($(e.currentTarget).parents('.MuiListItem-container'));
                              console.log($(e.currentTarget).parents('.MuiListItem-container').index());
                              console.log(profil[$(e.currentTarget).parents('.MuiListItem-container').index()]);
                              setDeleteProfil(profil[$(e.currentTarget).parents('.MuiListItem-container').index()]);
                            }} 
                          />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete">
                          <SettingsIcon 
                            style={{fill: "#3f51b5"}} 
                            onClick={(e) => {
                              handleOpenProfil(e);
                            }} 
                          />
                      </IconButton>
                      </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
          </Grid>
        </Scrollbars>
        <Button className={classes.button} variant="outlined" color="primary" size="small" style={{ width: 120, padding: 0}} onClick={(e) => inputRef.click()} >
          <span className={classes.buttonText}>Upload</span><PublishIcon fontSize="small" />
        </Button>
        <Button className={classes.button} variant="outlined" color="primary" size="small" style={{ width: 120, padding: 0 }} onClick={downloadTxtFile}>
          <span className={classes.buttonText}>Download</span><GetAppIcon fontSize="small" />
        </Button>
        <ProfilDeleteModal isProfilDelete={isProfilDelete} setProfil={setProfil} deleteProfil={deleteProfil} profil={profil} setIsProfilDelete={setIsProfilDelete} />
        </>
    )
}

const mapStoreToProps = store => {
  return {
    knownGroups: store.userInfo.kwownGroups
  }
}

const mapDispatchToProps = {
  setKnownGroups
}

export default connect(mapStoreToProps, mapDispatchToProps)(ProfilList);