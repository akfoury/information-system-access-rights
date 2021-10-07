import React from 'react';
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import { connect } from "react-redux";
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import './tabs.scss';
import classNames from "classnames";
import "./tabs.scss";
import Usages from "../usages";
import { updateUsersDB, setGroupSpaceDB, setDisableStep1, setDisableStep2 , setLastName, setFirstName, setEmail, setSavedUsers } from "../../actions";
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	button: {
	  margin: theme.spacing(2.8),
	  cursor: "pointer"
	},
  }));

function TabsList({ smallScreenMode, db, groupUsage, updateUsersDB, setDisableStep1, setDisableStep2 , setLastName, setFirstName, setEmail, users, setSavedUsers, knownSpaces, setKnownSpaces, usageOnModal, createProfil, setIsUpdateProfil }) {
	const classes = useStyles();

	let columns = groupUsage.reduce(function(acc, val) {
		acc.push(Object.keys(val));
		return acc;
	}, []).flat();
	columns = [...new Set(columns)];
	columns = columns.map(item => Object.assign({'Header': item, 'accessor': item, 'Cell': ({ row }) => <span className="text-wrap">{row[item]}</span>}, {}));

	return (
		<div style={{ width: "100%" }}>
			<Tab.Container id="left-tabs-example" defaultActiveKey="first">
				<Row className="flex-column">
					<Col sm={12}>
						<Nav variant="pills" className={classNames({"flex-column": smallScreenMode === false}, {"flex-row": smallScreenMode === true})}>
							<Nav.Item>
								<Nav.Link eventKey="first">Usages selection</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="second">Default groups</Nav.Link>
							</Nav.Item>
							<Nav.Item>
								<Nav.Link eventKey="third">Groups link to usages</Nav.Link>
							</Nav.Item>
						</Nav>
						{usageOnModal ? (
							<Button 
								onClick={() => {
									createProfil();
									setIsUpdateProfil(false);
								}} 
								color="primary" 
								variant="outlined" 
								className={`${classes.button} createProfil`}
							>
								Create
							</Button>
						) : (
							<Button                   
								variant="contained"
								color="primary"
								className={`${classes.button} saveUser`}
								onClick={() => {
									updateUsersDB(users);
									setDisableStep1(false);
									setDisableStep2(true);
									setLastName('');
									setFirstName('');
									setEmail('');
									setSavedUsers(users);
								}}
							>
							Save User
						</Button>
						)}
					</Col>
					<Col sm={12}>
						<Tab.Content>
							<Tab.Pane eventKey="first">
								<Usages db={db} knownSpaces={knownSpaces} setKnownSpaces={setKnownSpaces} usageOnModal={usageOnModal} />
							</Tab.Pane>
							<Tab.Pane eventKey="second">
							    defaults
							</Tab.Pane>
							<Tab.Pane eventKey="third">
							<ReactTable
								data={groupUsage}
								columns={columns}
								defaultPageSize={4}
								pageSizeOptions={[4]}
								className="-striped -highlight"
							/>
							</Tab.Pane>
						</Tab.Content>
					</Col>
				</Row>
			</Tab.Container>
		</div>
	)
}

const mapStoreToProps = store => {
    return {
		groupUsage: store.userInfo.groupUsage,
		users: store.userInfo.users
    }
}

const mapDispatchToProps = {
	updateUsersDB,
	setGroupSpaceDB,
	setDisableStep1,
	setDisableStep2,
	setLastName,
	setFirstName,
	setEmail,
	setSavedUsers
}

export default connect(mapStoreToProps, mapDispatchToProps)(TabsList);