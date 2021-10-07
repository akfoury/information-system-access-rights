import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import $ from "jquery";
import { connect } from "react-redux";
import './profilForm.css';
import { setIsUpdateProfil, setGroupUsage } from '../../actions';
import TabsList from "../tabs";
import './tabs.scss';

const useStyles = makeStyles((theme) => ({
    appBar: {
      position: 'relative',
      height: "10%",
      top: 0,
      margin: 0
    },
    title: {
      marginLeft: theme.spacing(0),
      flex: 0.6,
    },
    profil: {
        flex: 0.2,
        textAlign: "right",
        backgroundColor: "white"
    },
    close: {
        flex: 0.2
    }
  }));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ProfilForm = ({ db, profil, setProfil, openProfil, handleOpenProfil, handleCloseProfil, profilMode, setProfilMode, knownSpaces, setKnownSpaces, usageOnModal, spacesProfil, profilName, handleProfilName, setProfilName, setGroupUsage }) => {
    const classes = useStyles();

    useEffect(() => {
        if(openProfil === true) {
            setProfilMode(true);
        }
    }, [openProfil]);

    const reset = () => {
        setProfilName('');
        $('#profil-name').val('');

        $('#my-form').children().each((index, value) => {
            $(value).empty();
        });
    }

    const createProfil = () => {
        const profil_content = {name: '', spaces: []};
        profil_content.name = profilName;

        profil_content.spaces = spacesProfil;
        
        if(profil_content.spaces.length != 0) {
            const index = profil.findIndex(item => item.name === profil_content.name);

            if(index != -1) {
                setProfil([...profil.slice(0, index), {name: profil[index].name, spaces: profil_content.spaces}, ...profil.slice(index + 1)]);
            } else {
                setProfil([...profil, profil_content]);
            }
        }
        reset();
    }

    useEffect(() => {
        localStorage.setItem('profil', JSON.stringify(profil));
    }, [profil]);

    return (
        <div>
            <Button variant="outlined" color="primary" onClick={handleOpenProfil}>
                Create Profile
            </Button>
            <Dialog open={openProfil} onClose={handleCloseProfil} aria-labelledby="form-dialog-title" fullScreen TransitionComponent={Transition}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                >
                    <Grid item>
                        <Typography variant="h6" className={classes.title}>
                            Create Profile Type
                        </Typography>
                    </Grid>
                    <Grid item>
                        <IconButton 
                            edge="end" 
                            color="inherit" 
                            onClick={() => {
                                handleCloseProfil();
                                setKnownSpaces([]);
                                setGroupUsage([]);
                                reset();
                            }} 
                            aria-label="close" 
                            size="medium" 
                            className={classes.close}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
                </Toolbar>
            </AppBar>
            <div className="profil-name">
                <TextField
                    id="profil-name"
                    placeholder="Profile Name"
                    className={classes.profil}
                    onChange={e => handleProfilName(e)}
                    value={profilName}
                />
            </div>
            <div className="panel">
                <div className="panel-usages">
                    {usageOnModal ? <TabsList db={db} knownSpaces={knownSpaces} setKnownSpaces={setKnownSpaces} profilMode={profilMode} usageOnModal={usageOnModal} createProfil={createProfil} setIsUpdateProfil={setIsUpdateProfil} /> : undefined}
                </div>
            </div>
        </Dialog>
        </div>
    );
}

const mapStoreToProps = store => {
    return {
        isUpdateProfil: store.userInfo.isUpdateProfil,
        json: store.indexedDB.json,
        spacesProfil: store.step.spacesProfil
    }
}

const mapDispatchToProps = {
    setIsUpdateProfil,
    setGroupUsage
}

export default connect(mapStoreToProps, mapDispatchToProps)(ProfilForm);
