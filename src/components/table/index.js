import React, { useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import './table.css';
import { connect } from "react-redux";
import Draggable from 'react-draggable';
import { setCurrentUser, setDisableStep1, setDisableStep2, setFirstName, setLastName, setEmail, setKnownGroups, setUsers } from "../../actions";
import $ from "jquery";


function Table({ usersDB, setCurrentUser, setDisableStep1, setDisableStep2, setIsUserUpdate, setFirstName, setLastName, setEmail, setKnownGroups }) {
  const item_order = ["updated", "new", "n/a"];

  const getPropsWithout = (names, object) => Object.keys(object)
  .filter((key) => !names.includes(key))
  .reduce((newObject, currentKey) => ({
    ...newObject,
    [currentKey]: object[currentKey]
  }), {});

  const data = usersDB.map(o => getPropsWithout(['FullName', 'id'], o));
  data.sort((a, b) => item_order.indexOf(a.Update) - item_order.indexOf(b.Update));

  const reset = () => {
    $('#my-form').children().each((index, value) => {
      $(value).empty();
    })
  }

  const filterCaseAccentInsensitive= (filter, row) => {
    const id = filter.pivotId || filter.id;
    const content = row[id];
    if (typeof content !== 'undefined') {
        // filter by text in the table or if it's a object, filter by key
        if (typeof content === 'object' && content !== null && content.key) {
            return String(content.key).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filter.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
        } else {
            return String(content).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(filter.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
        }
    }

    return true;
};

  useEffect(() => {
    $('.rt-th > input').attr('autocomplete', 'nope');
  }, []);

  return (
    <Draggable
      axis="y"
      bounds={{top: 50, bottom: 200}}
      defaultPosition={{x: 0, y: 50}}
    >
      <div id="drag-container">
        <div id="draggable">
          <ReactTable
            data={data}
            columns={[
              {
                Header: 'Update',
                accessor: "Update",
                Cell: ({ row }) =><span className="text-wrap">{row.Update}</span>
              },
              {
                Header: 'Last Name',
                accessor: 'LastName',
                Cell: ({ row }) => <span className="text-wrap">{row.LastName}</span>
              },
              {
                Header: 'First Name',
                accessor: 'FirstName',
                Cell: ({ row }) => <span className="text-wrap">{row.FirstName}</span>
              },
              {
                Header: 'Email',
                accessor: 'Email',
                Cell: ({ row }) => <span className="text-wrap">{row.Email}</span>
              },
              {
                Header: 'Status',
                accessor: 'UserStatus',
                Cell: ({ row }) => <span className="text-wrap">{row.UserStatus}</span>
              },
              {
                Header: 'Groups',
                accessor: 'AffectedGroups',
                Cell: ({ row }) => <span className="text-wrap">{row.AffectedGroups}</span>
                }
            ]}
            defaultPageSize={10}
            className="-striped -highlight"
            resizable={true}
            getTrProps={(state, rowInfo, instance) => {
              return {
                onClick: (e, handleOriginal) => {
                  $(e.currentTarget).parents('.rt-tr-group').nextAll().each((index, item) => $(item).css('background-color', 'transparent'));
                  $(e.currentTarget).parents('.rt-tr-group').nextAll().find('span').css('color', 'black');
                  $(e.currentTarget).parents('.rt-tr-group').nextAll().each((index, item) => $(item).removeClass('clicked'));
            
                  $(e.currentTarget).parents('.rt-tr-group').prevAll().each((index, item) =>  $(item).css('background-color', 'transparent'));
                  $(e.currentTarget).parents('.rt-tr-group').prevAll().find('span').css('color', 'black');
                  $(e.currentTarget).parents('.rt-tr-group').prevAll().each((index, item) => $(item).removeClass('clicked'));
            
                  if($(e.currentTarget).parents('.rt-tr-group').hasClass('clicked')) {
                    $(e.currentTarget).parents('.rt-tr-group').css('background-color', 'transparent');
                    $(e.currentTarget).parents('.rt-tr-group').each((index, item) => $(item).find('span').css('color', 'black'));
                  } else {
                    $(e.currentTarget).parents('.rt-tr-group').css('background-color', 'rgba(60, 84, 180, 0.35)');
                    $(e.currentTarget).parents('.rt-tr-group').each((index, item) => $(item).find('span').css('color', 'white'));
                  }

                  setIsUserUpdate(rowInfo.original.Update);
                  setCurrentUser(rowInfo.original);
                  setFirstName(rowInfo.original.FirstName);
                  setLastName(rowInfo.original.LastName);
                  setEmail(rowInfo.original.Email);
                  setKnownGroups(rowInfo.original.AffectedGroups.split('; |'));
                  reset();
                  setDisableStep1(true);
                  setDisableStep2(false);
                }
              };
            }}
            filterable
            defaultFilterMethod={filterCaseAccentInsensitive}
          />
        </div>
      </div>
    </Draggable>
  )
}

const mapStoreToProps = store => {
  return {
    usersDB: store.indexedDB.usersDB,
  }
}

const mapDispatchToProps = {
  setCurrentUser,
  setDisableStep1,
  setDisableStep2,
  setFirstName,
  setLastName,
  setEmail,
  setKnownGroups,
  setUsers
}

export default connect(mapStoreToProps, mapDispatchToProps)(Table);