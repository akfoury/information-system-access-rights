import React, { useEffect } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { List, ListItem } from 'material-ui/List';
import DialogModal from "../modal";
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import { connect } from "react-redux";
import { setDisableStep2, updateUsers, setUsers, setCurrentUser } from "../../actions";
import ProfilList from "../profilList";

function Resume({ FirstName, LastName, Email, users, setCurrentUser, setUsers, updateUsers, isUserUpdate, setDisableStep2, profil, openProfil, handleOpenProfil, setProfil, knownSpaces, setKnownSpaces, isProfilDelete, setIsProfilDelete, deleteProfil, setDeleteProfil }) {

  const addToUsersList = () => {
    const user = {Update: isUserUpdate, LastName: LastName, FirstName: FirstName, Email: Email, UserStatus: '', AffectedGroups: ''};
    users.filter(item => item.FirstName.concat(', ', item.LastName) === user.FirstName.concat(', ', user.LastName)).length !== 0 ? updateUsers(user) : setUsers(user);
    setCurrentUser(user);
  }


  useEffect(() => {
    isUserUpdate === 'new' ? (addToUsersList(), setDisableStep2(false)) : null;
  }, []);

  return (
    <>
    		<Tab.Container id="left-tabs-example" defaultActiveKey="first">
				<Row className="flex-column">
					<Col sm={12}>
						<Nav variant="pills">
							<Nav.Item>
								<Nav.Link eventKey="first">User Info</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="second">Profile Selection</Nav.Link>
							</Nav.Item>
						</Nav>
					</Col>
					<Col sm={12}>
						<Tab.Content>
							<Tab.Pane eventKey="first">
              <MuiThemeProvider>
                <>
                  <List>
                    <ListItem 
                      primaryText="First Name"
                      secondaryText={FirstName}
                    />
                    <ListItem
                      primaryText="Last Name"
                      secondaryText={LastName}
                    />
                    <ListItem
                      primaryText="Email"
                      secondaryText={Email}
                    />
                  </List>
                  <br />
                </>
              </MuiThemeProvider>
              {isUserUpdate === 'updated'|| isUserUpdate  === 'n/a' ? <DialogModal isUserUpdate={isUserUpdate} /> : null}
							</Tab.Pane>
							<Tab.Pane eventKey="second">
							    <ProfilList profil={profil} openProfil={openProfil} handleOpenProfil={handleOpenProfil} setProfil={setProfil} knownSpaces={knownSpaces} setKnownSpaces={setKnownSpaces} isProfilDelete={isProfilDelete} setIsProfilDelete={setIsProfilDelete} deleteProfil={deleteProfil} setDeleteProfil={setDeleteProfil} />
							</Tab.Pane>
						</Tab.Content>
					</Col>
				</Row>
			</Tab.Container>
    </>
  )
}

const mapStoreToProps = store => {
  return {
    FirstName: store.userInfo.FirstName,
    LastName: store.userInfo.LastName,
    Email: store.userInfo.Email,
    users: store.userInfo.users
  }
}

const mapDispatchToProps = {
  setCurrentUser,
  updateUsers,
  setUsers,
  setDisableStep2,
}

export default connect(mapStoreToProps, mapDispatchToProps)(Resume);