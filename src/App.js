import React, { useState, useEffect } from 'react';
import XLSX from 'xlsx';
import Dexie from 'dexie';
import { UserForm, Upload, Resume, Header, Table, TabsList } from "./components";
import { connect } from "react-redux";
import { setGroupSpaceDB, setUsersDB, setIsUpdateProfil } from "./actions";
import $ from "jquery";
import './App.css';

const isAdvancedUpload = () => {
  let div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}

const setCustomUpload = () => {
  let form = document.querySelector('.box');
  if (isAdvancedUpload) {
    form.classList.add('has-advanced-upload');
  }
}

window.onload = () => {
  if (localStorage.getItem('isAllFilesUpload') === false) {
    setCustomUpload();
  }
};

function App({ disableStep1, disableStep2, setUsersDB, setGroupSpaceDB, setIsUpdateProfil }) {
  // File States
  const [isGroupSpaceUpload, setIsGroupSpaceUpload] = useState(localStorage.getItem('isGroupSpaceUpload') === 'true');
  const [isSpaceUsageUpload, setIsSpaceUsageUpload] = useState(localStorage.getItem('isSpaceUsageUpload') === 'true');
  const [isUserExtractUpload, setIsUserExtractUpload] = useState(localStorage.getItem('isUserExtractUpload') === 'true');
  const [isArborescenceEspaceUpload, setIsArborescenceEspaceUpload] = useState(localStorage.getItem('isArborescenceEspaceUpload') === 'true');
  const [isAllFilesUpload, setIsAllFilesUpload] = useState(localStorage.getItem('isAllFilesUpload') === 'true');
  const [isUserUpdate, setIsUserUpdate] = useState("new");
  const [fileInfo, setFileInfo] = useState(JSON.parse(localStorage.getItem('fileInfo')) || []);
  const [profil, setProfil] = useState(JSON.parse(localStorage.getItem('profil')) || []);
  const [openProfil, setOpenProfil] = useState(false);
  const [knownSpaces, setKnownSpaces] = useState([]);
  const [profilMode, setProfilMode] = useState(false);
  const [usageOnModal, setUsageOnModal] = useState(false);
  const [profilName, setProfilName] = useState('');
  const [isProfilDelete, setIsProfilDelete] = useState(false);
  const [deleteProfil, setDeleteProfil] = useState({});

  const handleProfilName = (e) => {
    setProfilName(e.target.value);
  }

  const handleOpenProfil = (e) => {
    if($(e.currentTarget).hasClass('MuiSvgIcon-root')) {
      profil.map((val, ind) => ind === $(e.currentTarget).parents('.MuiListItem-container').index() ? (setKnownSpaces(val.spaces), setProfilName(val.name)) : null);
      setIsUpdateProfil(true);
    } else {
      setKnownSpaces([]);
    }
    setUsageOnModal(true);
    setOpenProfil(true);
  };

  useEffect(() => {
    if(openProfil === false) {
      setProfilMode(false);
    }
  }, [openProfil])

  const handleCloseProfil = (e) => {
    setOpenProfil(false);
    setIsUpdateProfil(false);
    setUsageOnModal(false);
  };

  let db = new Dexie("userAccess");
  db.version(1).stores({
    "Group-Space": "++id,GroupName,Space,Role",
    "Space-Usage": "++id,Space,Usage",
    "User": "++id,External,State,fullName,Login,LastName,FirstName,Email,Title,Fit4role,AffectedGroups,UserType,UserStatus,ID,HASH",
    "Arborescence espace": "++id,Parent,Child"
  });
  db.open();

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

  const addIntoIndexedDB = (objs, store) => {
    objs.forEach(obj => db[store].add(obj));
    return true;
  }

  const getUsers = async () => {
    let usersDB = await db["User"].toArray();

    usersDB = usersDB.filter(item => item["External"] != 'Yes');
    usersDB = usersDB.map(o => getPropsWithout(['External', 'Fit4role', 'HASH', 'ID', 'Login', 'State', 'UserType', 'Title'], o));
    usersDB = usersDB.map(o => ({...o, Update: "n/a"}));

    setUsersDB(usersDB);
  }

  const getGroupSpace = async () => {
    let groupSpace = await db["Group-Space"].toArray();
    setGroupSpaceDB(groupSpace);
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

        addIntoIndexedDB(data, store);
        setIsGroupSpaceUpload(!isGroupSpaceUpload);  
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

    console.log(store);
    fileReader.onload = (e) => {
      data = e.target.result;
      let workbook = XLSX.read(data, { type: "binary" });
      workbook.SheetNames.forEach(sheet => {
        result = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
        if (store === 'User') {
          let upload;
          result = result.map(({ 'External to O2T ?': External, 'Full Name': FullName, 'Last Name': LastName, 'First Name': FirstName, 'State ': State, 'Fit4_role': Fit4role, 'Affected group(s)': AffectedGroups, 'Type utilisateur': UserType, 'Statut utilisateur': UserStatus, '#ID#': ID, '#HASH#': HASH, ...rest }) => ({ External: External, FullName: FullName, LastName: LastName, FirstName: FirstName, State: State, Fit4role: Fit4role, AffectedGroups: AffectedGroups, UserType: UserType, UserStatus: UserStatus, ID: ID, HASH: HASH, ...rest }));
          result = result.map(o => getPropsWithout(['External to O2T ?_1', 'State _1', '__rowNum__'], o));
          upload = addIntoIndexedDB(result, store);
          setIsUserExtractUpload(upload);  
          }
        else if (store === 'Space-Usage') {
          let upload;
          result = result.map(o => getPropsWithout(['External to O2T ?_1', 'State _1', '__rowNum__'], o));
          upload = addIntoIndexedDB(result, store);
          setIsSpaceUsageUpload(upload);
        }
        else {
          let upload;
          result = result.map(o => getPropsWithout(['External to O2T ?_1', 'State _1', '__rowNum__'], o));
          // result = result.map(item => Object.assign(item, {Child: item.Child.trim(), Parent: item.Parent.trim()}));

          upload = addIntoIndexedDB(result, store);
          setIsArborescenceEspaceUpload(upload);
        }
      })
    }
    fileReader.readAsBinaryString(xlsx, "UTF-8");
  }

  const fileHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
    let files = e.target.files;
    const filenames = [];
    if(localStorage.getItem('fileNames') === null) {
      Array.from(files).map(item => filenames.push(item.name));
      localStorage.setItem('fileNames', JSON.stringify(filenames));
    }

    Array.from(files).map(item => setFileInfo(fileInfo => [...fileInfo, { fileName: item.name, lastModifiedDate: new Date(item.lastModified).toLocaleDateString('fr-FR') + " " + new Date(item.lastModified).toLocaleTimeString('fr-FR') || item.lastModifiedDate.toLocaleDateString('fr-FR') + "  " + item.lastModifiedDate.toLocaleTimeString('fr-FR') }]));

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

  const isAllFilesUploadVerification = () => {
    if (isGroupSpaceUpload && isSpaceUsageUpload && isUserExtractUpload && isArborescenceEspaceUpload) {
      setIsAllFilesUpload(true);
    }
    else {
      setIsAllFilesUpload(false);
    }
  }

  useEffect(() => {
    localStorage.setItem('isGroupSpaceUpload', isGroupSpaceUpload);
    isAllFilesUploadVerification();
    getGroupSpace();
  }, [isGroupSpaceUpload]);

  useEffect(() => {
    localStorage.setItem('isSpaceUsageUpload', isSpaceUsageUpload);
    isAllFilesUploadVerification();
  }, [isSpaceUsageUpload]);

  useEffect(() => {
    localStorage.setItem('isUserExtractUpload', isUserExtractUpload);
    getUsers();
    isAllFilesUploadVerification();
  }, [isUserExtractUpload]);

  useEffect(() => {
    localStorage.setItem('isArborescenceEspaceUpload', isArborescenceEspaceUpload);
    isAllFilesUploadVerification();
  }, [isArborescenceEspaceUpload])

  useEffect(() => {
    localStorage.setItem('isAllFilesUpload', isAllFilesUpload);
  }, [isAllFilesUpload]);

  useEffect(() => {
    localStorage.setItem('fileInfo', JSON.stringify(fileInfo));
  }, [fileInfo]);

  return (
    isAllFilesUpload ? (
      <div className="App">
          <Header 
            isAllFilesUpload={isAllFilesUpload}
            fileInfo={fileInfo}
            db={db}
            profil={profil}
            setProfil={setProfil}
            openProfil={openProfil}
            handleOpenProfil={handleOpenProfil}
            handleCloseProfil={handleCloseProfil}
            setFileInfo={setFileInfo}
            profilMode={profilMode}
            setProfilMode={setProfilMode}
            knownSpaces={knownSpaces}
            setKnownSpaces={setKnownSpaces}
            usageOnModal={usageOnModal}
            profilName={profilName}
            handleProfilName={handleProfilName}
            setProfilName={setProfilName}
          />
          <div className="interface">
            <div className="leftpane">
              {disableStep1 ? <Resume isUserUpdate={isUserUpdate} profil={profil} handleOpenProfil={handleOpenProfil} openProfil={openProfil} setProfil={setProfil} knownSpaces={knownSpaces} setKnownSpaces={setKnownSpaces} isProfilDelete={isProfilDelete} setIsProfilDelete={setIsProfilDelete} deleteProfil={deleteProfil} setDeleteProfil={setDeleteProfil} /> : <UserForm setIsUserUpdate={setIsUserUpdate} />}
            </div>
              {disableStep2 ? null : 
              <div className="rightpane">
                {usageOnModal ? undefined : <TabsList db={db} knownSpaces={knownSpaces} setKnownSpaces={setKnownSpaces} profilMode={profilMode} setProfilMode={setProfilMode} />}
              </div>}
          </div>
          <div className="bottom">
            <Table setIsUserUpdate={setIsUserUpdate} />
          </div>
      </div>
    ) : (
      <>
        <Header 
          isAllFilesUpload={isAllFilesUpload}
          setFileInfo={setFileInfo}
          fileInfo={fileInfo}
        />
        <Upload 
          fileHandler={fileHandler}
        />
      </>
      )
  );
}

const mapStoreToProps = store => {
  return {
    disableStep1: store.step.disableStep1,
    disableStep2: store.step.disableStep2,
    spacesProfil: store.step.spacesProfil
  }
}

const mapDispatchToProps = {
  setGroupSpaceDB,
  setUsersDB,
  setIsUpdateProfil
}

export default connect(mapStoreToProps, mapDispatchToProps)(App);
