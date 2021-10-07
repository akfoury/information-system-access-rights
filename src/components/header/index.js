import React, { useState, useRef, useEffect } from 'react';
import FiberManualRecordRoundedIcon from '@material-ui/icons/FiberManualRecordRounded';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import GetAppIcon from '@material-ui/icons/GetApp';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { ExportToCsv } from 'export-to-csv';
import './header.css';
import { connect } from "react-redux";
import { setDisableStep1, setDisableStep2, deleteUsers, deleteSavedUsers, changeUsersDB, setLastName, setFirstName, setEmail, setCurrentUser } from "../../actions";
import XLSX from 'xlsx';
import UpdateIcon from '@material-ui/icons/Update';
import SuccessUpdateFiles from "../successupdatefiles";
import FileInfo from "../fileInfo";
import ProfilForm from "../profilForm";

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      minWidth: 32,
      paddingLeft: 8,
      paddingRight: 8,
      cursor: "pointer",
      "& .MuiButton-startIcon": {
        margin: 0
      }
    }
  },
  buttonText: {
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  }
}));

function Header({ isAllFilesUpload, db, disableStep1, setDisableStep1, setDisableStep2, deleteUsers, deleteSavedUsers, savedUsers, fileInfo, profil, setProfil, openProfil, handleOpenProfil, handleCloseProfil, isUpdateProfil, setFileInfo, changeUsersDB, profilMode, setProfilMode, knownSpaces, setKnownSpaces, usageOnModal, profilName, handleProfilName, setProfilName, setLastName, setFirstName, setEmail, setCurrentUser }) {
  const [isUpdateFile, setIsUpdateFile] = useState(false);

  const classes = useStyles();

  const columns = ["update", "lastname", "firstname", "email", "status", "groups"];
  const initialState = [{update: '', lastname: '', firstname: '', email: '', status: '', groups: ''}];

  const exportToCSV = () => {
    const options = {
      fieldSeparator: ';',
      quoteStrings: '"',
      showLabels: true,
      title: 'Result',
      headers: columns
    }

    const csvExporter = new ExportToCsv(options);
    savedUsers.length != 0 ? csvExporter.generateCsv(savedUsers) : csvExporter.generateCsv(initialState);
  }

  let inputRef = useRef(null);

  const addIntoIndexedDB = (objs, store) => {
    objs.forEach(obj => db[store].add(obj));
    return true;
  }

  const clearIntoIndexedDB = (store) => {
    db[store].clear();
  }

  const guessDelimiters = (text, possibleDelimiters) => {
      return possibleDelimiters.filter(weedOut);
  
      function weedOut(delimiter) {
        let cache = -1;
        return text.split('\n').every(checkLength);
  
        function checkLength(line) {
          if (!line) {
            return true;
          }
  
          let length = line.split(delimiter).length;
          if (cache < 0) {
            cache = length;
          }
          return cache === length && length > 1;
        }
      }
  }
  
  const CSVToArray = (csvData, delimiter) => {
      delimiter = (delimiter || guessDelimiters(csvData, [',', ';', '|']));
      let pattern = new RegExp((
          "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
          "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
          "([^\"\\" + delimiter + "\\r\\n]*))"), "gi");
      let data = [[]];
      let matches = null;
      while (matches = pattern.exec(csvData)) {
          let matchedDelimiter = matches[1];
          if (matchedDelimiter.length && (matchedDelimiter != delimiter)) {
          data.push([]);
          }
          if (matches[2]) {
          matchedDelimiter = matches[2].replace(
              new RegExp("\"\"", "g"), "\"");
          } else {
          matchedDelimiter = matches[3];
          }
          data[data.length - 1].push(matchedDelimiter);
      }
      return (data);
  }

  const CSVToJSON = (csvData) => {
      let data = CSVToArray(csvData);
      let objData = [];
      for (let i = 1; i < data.length; i++) {
          objData[i - 1] = {};
          for (let k = 0; k < data[0].length && k < data[i].length; k++) {
          let key = data[0][k];
          objData[i - 1][key] = data[i][k]
          }
      }
      let jsonData = JSON.stringify(objData);
      jsonData = jsonData.replace(/},/g, "},\r\n");
      return jsonData;
  }

  const csvHandler = (csv) => {
      let fileReader = new FileReader();
      let data = [];

      fileReader.onload = (e) => {
        let store = csv.name.split(/\.(?!.*\.)+/)[0];
        let string = ['Arborescence espace', 'Group-Space', 'Space-Usage'];
  
        for(let i=0; i<string.length;i++) {
          if(store.includes(string[i])) {
            store = store.substring(store.indexOf(string[i]), string[i].length);
          }
        }

        if (store === 'Group-Space') {
            data = e.target.result;
            data = CSVToJSON(data);
            data = JSON.parse(data);

            clearIntoIndexedDB(store);
            addIntoIndexedDB(data, store);
        }
      }
      fileReader.readAsText(csv, "UTF-8");
  }

  const getPropsWithout = (names, object) => Object.keys(object)
      .filter((key) => !names.includes(key))
      .reduce((newObject, currentKey) => ({
          ...newObject,
          [currentKey]: object[currentKey]
  }), {});

  const xlsxHandler = (xlsx) => {
      let fileReader = new FileReader();
      let data = [];
      let result;
      let store;

      if(xlsx.name.slice(0, 4) === 'User') {
        store = xlsx.name.slice(0, 4);
      } else {
        store = xlsx.name.split(/\.(?!.*\.)+/)[0];
        let string = ['Arborescence espace', 'Group-Space', 'Space-Usage'];
  
        for(let i=0; i<string.length;i++) {
          if(store.includes(string[i])) {
            store = store.substring(store.indexOf(string[i]), string[i].length);
            console.log(store);
          }
        }
      }

      fileReader.onload = (e) => {
          data = e.target.result;
          let workbook = XLSX.read(data, { type: "binary" });
          workbook.SheetNames.forEach(sheet => {
          result = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
          if (store === 'User') {
              result = result.map(({ 'External to O2T ?': External, 'Full Name': FullName, 'Last Name': LastName, 'First Name': FirstName, 'State ': State, 'Fit4_role': Fit4role, 'Affected group(s)': AffectedGroups, 'Type utilisateur': UserType, 'Statut utilisateur': UserStatus, '#ID#': ID, '#HASH#': HASH, ...rest }) => ({ External: External, FullName: FullName, LastName: LastName, FirstName: FirstName, State: State, Fit4role: Fit4role, AffectedGroups: AffectedGroups, UserType: UserType, UserStatus: UserStatus, ID: ID, HASH: HASH, ...rest }));
              result = result.map(o => getPropsWithout(['External to O2T ?_1', 'State _1', '__rowNum__'], o));
              clearIntoIndexedDB(store);
              addIntoIndexedDB(result, store);
              changeUsersDB(result);
              }
          else if (store === 'Space-Usage') {
              result = result.map(o => getPropsWithout(['External to O2T ?_1', 'State _1', '__rowNum__'], o));
              clearIntoIndexedDB(store);
              addIntoIndexedDB(result, store);
          }
          else {
              result = result.map(o => getPropsWithout(['External to O2T ?_1', 'State _1', '__rowNum__'], o));
              clearIntoIndexedDB(store);
              addIntoIndexedDB(result, store);
          }
          })
      }
      fileReader.readAsBinaryString(xlsx, "UTF-8");
  }
  
  const fileHandler = (e) => {
      e.stopPropagation();
      e.preventDefault();
      let files = e.target.files;
      if(localStorage.getItem('fileNames') === null) {
          const filenames = [];
          Array.from(files).map(item => filenames.push(item.name));
          localStorage.setItem('fileNames', JSON.stringify(filenames));
      }

      Array.from(files).map(item => setFileInfo(fileInfo => fileInfo.map(file => file.fileName === item.name ? Object.assign(file, { fileName: item.name, lastModifiedDate: new Date(item.lastModified).toLocaleDateString('fr-FR') + " " + new Date(item.lastModified).toLocaleTimeString('fr-FR') || item.lastModifiedDate.toLocaleDateString('fr-FR') + "  " + item.lastModifiedDate.toLocaleTimeString('fr-FR') }) :  file)));

      for (let i = 0; i < files.length; i++) {
          let sigle = files[i].name.split(/\.(?!.*\.)+/).slice(-1);
          if (sigle[0] === 'csv') {
          csvHandler(files[i]);
          }
          else if (sigle[0] === 'xlsx' || 'xls') {
          xlsxHandler(files[i]);
          }
      }
  }

  useEffect(() => {
    localStorage.setItem('fileInfo', JSON.stringify(fileInfo));
  }, [fileInfo]);

  return (
    <MuiThemeProvider>
      <>
        <div className="header">
          {isAllFilesUpload ? (
            <>
              <div className="wrapper1">
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  endIcon={<AddCircleOutlineIcon />}
                  onClick={() => {
                    setDisableStep1(false);
                    setDisableStep2(true);
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setCurrentUser({});
                  }}
                >
                  <span classeName={classes.buttonText}>Add User</span>
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  endIcon={<GetAppIcon />}
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if(disableStep1 === true) {
                      exportToCSV();
                    } else {
                      exportToCSV();
                      setDisableStep1(false);
                      setDisableStep2(true);
                      deleteUsers();
                      deleteSavedUsers();
                    }
                  }}
                >
                  <span className={classes.buttonText}>Download File</span>
                </Button>
              </div>
              <div className="wrapper2">
              <div>
              <ProfilForm db={db} profil={profil} setProfil={setProfil} openProfil={openProfil} handleOpenProfil={handleOpenProfil} handleCloseProfil={handleCloseProfil} isUpdateProfil={isUpdateProfil} profilMode={profilMode} setProfilMode={setProfilMode} knownSpaces={knownSpaces} setKnownSpaces={setKnownSpaces} usageOnModal={usageOnModal} profilName={profilName} handleProfilName={handleProfilName} setProfilName={setProfilName}/>
              </div>
              <div>
                <input type="file" ref={(ref) => inputRef = ref} style={{ display: 'none' }} id="myinput" onChange={(e) => {
                    fileHandler(e);
                    // réinitialiser la valeur de l'input
                    document.getElementById('myinput').value = '';
                    setIsUpdateFile(true);
                }} multiple/>
              </div>
              <div>
                <FileInfo fileInfo={fileInfo} />
              </div>
              <div>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={(e) => inputRef.click()} 
                    style={{ borderRadius: 50 }} 
                    endIcon={<UpdateIcon />}
                  >
                      <span className={classes.buttonText}>Edit Files</span>
                  </Button>
              </div>
                <div>
                  <FiberManualRecordRoundedIcon style={{ fill: isAllFilesUpload ? "green" : "red" }} />
                  {isAllFilesUpload ? <span style={{ color: 'green', fontWeight: 800 }}>Files loaded</span> : <span style={{ color: 'red', fontWeight: 800 }}>Error in loading files</span>}
                </div>
              </div>
              {isUpdateFile === true ? <SuccessUpdateFiles isUpdateFile={isUpdateFile} setIsUpdateFile={setIsUpdateFile}/> : null}
            </>
        ) : (
            <div className="loaded" style={{ justifyContent: "flex-end", flex: 0.95 }}>
              <FiberManualRecordRoundedIcon style={{ fill: isAllFilesUpload ? "green" : "red", paddingBottom: "15px" }} />
              {isAllFilesUpload ? <span style={{ color: 'green', fontWeight: 800 }}>Files loaded</span> : <span style={{ color: 'red', fontWeight: 800, paddingBottom: "15px" }}>Error in loading files</span>}
            </div>
          )}
      </div>
    </>
    </MuiThemeProvider>
  )
}

const mapStoreToProps = store => {
  return {
    users: store.userInfo.users,
    savedUsers: store.userInfo.savedUsers,
    disableStep1: store.step.disableStep1
  }
}

const mapDispatchToProps = {
  setDisableStep1,
  setDisableStep2,
  deleteUsers,
  deleteSavedUsers,
  changeUsersDB,
  setLastName,
  setFirstName,
  setEmail,
  setCurrentUser
}

export default connect(mapStoreToProps, mapDispatchToProps)(Header);