import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import _ from "lodash";
import $ from "jquery";
import { setGroups, updateGroups, setGroupUsage, setJSON, setSpacesProfil } from "../../actions";
import "./usages.css";
import 'react-table/react-table.css';
import ResizeSensor from "resize-sensor";
import { Scrollbars } from 'react-custom-scrollbars';
import { v4 as uuidv4 } from 'uuid';

const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(2.8),
      cursor: "pointer"
    },
}));

function Usages({ db, groupSpaceDB, setGroups, updateGroups, setGroupUsage, currentUser, users, knownGroups, knownSpaces, setKnownSpaces, setJSON, json, usageOnModal, setSpacesProfil }) {
    const classes = useStyles();
    let scrollDiv = "";

    const getSpacesFromGroups = async () => {
      const recursive = async (parent, item) => {
        let subSpace = await db["Arborescence espace"].get({Child: parent});

        if(subSpace) {
          let space = await db["Space-Usage"].get({Space: subSpace.Parent});
          if(!space) {
            recursive(parent.Parent, item);
          } else {
            return Object.assign(item, {Usage: space.Usage});
          }
         }
      }

      let spaces = [];
      const properties = ["Space", "Role"];
      let user = knownGroups;
      if(!Array.isArray(user)) {
        user = user.split('; |');
      }
      user = user.map(item => item.trim());

      await Promise.all(user.map(async item => {
        let space = await db["Group-Space"].where("GroupName").equals(item).toArray();
        space = space.map(item => properties.reduce((newObj,property) => {newObj[property] = item[property]; return newObj}, {}));
        spaces.push(...space);
      }));

      spaces = await Promise.all(spaces.map(async item => {
        let space = await db["Space-Usage"].get({Space: item.Space});

        if(space) {
          return Object.assign({Usage: space.Usage}, item);
        } else {
          return recursive(item.Space, item);
        }
      }));
      spaces = spaces.filter(item => item != undefined);
      spaces = spaces.filter(item => item.Role != 'External');
      spaces = Array.from(new Set(spaces));

      setKnownSpaces(spaces);

      return null;
    }

    const onSubmit = e => {
      e.stopPropagation();
      e.preventDefault();
      let groups = [];
      let elements = e.target.elements;
      let tabs = [];
      let spaces_result = [];
      let parent_role = [];

      elements = [].slice.apply(elements) // convert HTMLFormControlsCollection to Array
        .filter(item => item instanceof HTMLInputElement && item.type == 'text') // filter out all <button> elements
        .map(item => Object.assign({Space: item.name.substring(item.name.indexOf("-")+1, item.name.length), Role: item.value, Level: item.dataset.level, Usage: item.dataset.usage, Parent: item.dataset.parent}));

      _.groupByMulti = function (obj, values, context) {
        if (!values.length)
            return obj;
        var byFirst = _.groupBy(obj, values[0], context),
            rest = values.slice(1);
        for (var prop in byFirst) {
            byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
        }
        return byFirst;
      };

      let spaceByLevelAndUsage = _.groupByMulti(elements, ["Level", "Usage"]);

      let spacesSelected = elements.filter(item => item.Role === "Guest" || item.Role === "Participant");
      console.log(spacesSelected);

      // let spacesSelectedGuest = [...spacesSelected];
      // spacesSelectedGuest = spacesSelectedGuest.map(item => {
      //   item = {...item, Role:"Guest"};
      //   return item;
      // });
      // let spacesSelectedParticipant = [...spacesSelected];
      // spacesSelectedParticipant = spacesSelectedParticipant.map(item => {
      //   item = {...item, Role:"Participant"};
      //   return item;
      // });
      // console.log(spacesSelectedGuest);
      // console.log(spacesSelectedParticipant);
      
      for(let i=0; i<spacesSelected.length; i++) {
        let currentSpace = spacesSelected[i];
        for(let j=0; j<Object.keys(spaceByLevelAndUsage).length; j++) {
          if(j+1 === Number(currentSpace.Level)) {
            let brothersSpaces = spaceByLevelAndUsage[currentSpace.Level][currentSpace.Usage].filter(obj => obj.Space != currentSpace.Space && obj.Parent === currentSpace.Parent);
            let selectionParent = true;

            if(brothersSpaces.some(brother => brother.Role === "Nothing")) {
              selectionParent = false;
              spaces_result.push(currentSpace);

              for(let i=0; i<groupSpaceDB.length; i++) {
                if(currentSpace.Space === groupSpaceDB[i].Space && currentSpace.Role === groupSpaceDB[i].Role) {
                  if(groupSpaceDB[i]["GroupName"].split('-')[1] === currentSpace.Space) {
                    if(!groups.includes(groupSpaceDB[i]["GroupName"])) {
                      groups.push(groupSpaceDB[i]["GroupName"]);
                      tabs.push(Object.assign({[currentSpace.Usage]: groupSpaceDB[i]["GroupName"]}, {}));
                    }
                  }
                }
              }
            }

            if(selectionParent === true) {
              for(let k=0; k<Object.keys(spaceByLevelAndUsage).length; k++) {
                if(k+1 === Number(currentSpace.Level)) {
                  let parentSpace = spaceByLevelAndUsage?.[Number(currentSpace.Level) != 0 ? (Number(currentSpace.Level) - 1).toString() : "0"]?.[currentSpace.Usage].filter(obj => obj.Space == currentSpace.Parent);
                  parent_role = _.countBy(spaceByLevelAndUsage[currentSpace.Level][currentSpace.Usage].map(item => item.Role));
                  parent_role = Object.keys(parent_role).reduce((a, b) => parent_role[a] > parent_role[b] ? a : b);

                  parentSpace[0] = {...parentSpace[0], Role: parent_role};
                  spaces_result.push(parentSpace);

                  let spacesSameLevel = spaceByLevelAndUsage[currentSpace.Level][currentSpace.Usage].filter(obj => obj.Role != parent_role);

                  if(spacesSameLevel.length !== 0) {
                    spacesSameLevel.map(item => spaces_result.push(item));
                  }
                }
              }
            }
          }
        }
      }

      spaces_result = spaces_result.flat();
      spaces_result = spaces_result.filter((elem, index) => spaces_result.findIndex(obj => obj.Space === elem.Space) === index);
      let spaces_result_clone = [...spaces_result];

      spaces_result_clone.map(item => {
        spaces_result.map((obj, index) => {
          if(obj.Parent === item.Space && obj.Role === item.Role) {
            spaces_result = spaces_result.splice(index, 1);
          }
        });
      });
      console.log(spaces_result);

      if(usageOnModal) {
        setSpacesProfil(spaces_result);
      }

      console.log(parent_role);
      for(let i=0; i<groupSpaceDB.length; i++) {
        for(let j=0; j<spaces_result.length;j++) {
          if(spaces_result[j].Space === groupSpaceDB[i].Space && spaces_result[j].Role === groupSpaceDB[i].Role) {
            if(!groups.includes(groupSpaceDB[i]["GroupName"])) {
              groups.push(groupSpaceDB[i]["GroupName"]);
              tabs.push(Object.assign({[spaces_result[j].Usage]: groupSpaceDB[i]["GroupName"]}, {}));
            }
          }
        }
      }

      groups = groups.filter((elem, index) => groups.findIndex(obj => obj.split('-')[1] === elem.split('-')[1]) === index);
      groups = [...new Set(groups)];
      console.log(groups);

      for(let i=0;i<tabs.length;i++) {
        for (let key in tabs[i]) {
          if (tabs[i].hasOwnProperty(key)) {
            if(!groups.includes(tabs[i][key])) {
              delete tabs[i];
            }
          }
        } 
      }
      

      tabs = tabs.filter(item => item != undefined);
      console.log(tabs);

      setGroupUsage(tabs);
      if(!usageOnModal) {
        users.filter(item => item.FirstName.concat(', ', item.LastName) === currentUser.FirstName.concat(', ', currentUser.LastName)).length !== 0 ? updateGroups(groups) : setGroups(groups);
      }
    }

    const getJSONData = async () => {
      let usageSpace = await db["Space-Usage"].toArray();
      let arborescenceSpace = await db["Arborescence espace"].toArray();
      arborescenceSpace = arborescenceSpace.filter(item => !item.__EMPTY);
      arborescenceSpace = arborescenceSpace.map(item => Object.assign({"Parent": item.Parent.trim(), "Child": item.Child.trim()}, {}));

      let parentArray = arborescenceSpace.map(item => item.Parent);
      let childArray = arborescenceSpace.map(item => item.Child);
  
      let parent = [...parentArray, ...childArray];
      parent = usageSpace.map(item => item.Space).filter(
        function(e) {
          return this.includes(e);
        },
        parent
      );
      parent = [...new Set(parent)];
      parent = parent.map(parent => usageSpace.filter(item => item.Space === parent));
      parent = parent.flat();
      parent = [...parent, ...usageSpace.filter(item => !childArray.includes(item.Space) && !parentArray.includes(item.Space))];

      let allUsages = usageSpace.map(item => item.Usage);
      allUsages = [...new Set(allUsages)];

      let level = 0;

      let json_data = allUsages.map(item => Object.assign({ "title": item, "space": [], "level": level }, {}));

      level += 1
      let temp_parent = [];
      let sub_objs = [];
      parent.map(space => {
        allUsages.map(usage => {
          if(usage === space.Usage) {
            json_data.map(item => {
              if(item.title === usage) {
                item.space.push({ title: space.Space, space: [], level: level, usage: usage, parent: item.title });
                sub_objs.push(item.space);
                temp_parent.push(space.Space);
              } 
            })
          }
        })
      })
      parent = [];
      parent = temp_parent;
      arborescenceSpace.map(function(item) {
        parent.map((par, index) => {
          if(item.Parent.trim() === par) {
            parent.push(item);
          };
        })
      })

      setJSON(json_data);

      const recursive = (parent, level, sub_objs) => {
        let temp_parent = [];
        let sub_objs_temp = [];
        let keys = ['Parent', 'Child'];
        parent = parent.filter(
            (s => o => 
                (k => !s.has(k) && s.add(k))
                (keys.map(k => o[k]).join('|'))
            )
            (new Set)
        );
        level = level + 1;

        sub_objs = Array.from(new Set(sub_objs));

        sub_objs.map(sub_obj => {
          sub_obj.map(obj => {
            if(Object.prototype.toString.call(obj) === '[object Object]') {
              let space = obj.space;
              parent.map((par, index) => {
                if(par.Parent === obj.title) {
                  if(parentArray.includes(par.Child)) {
                    space.push({ title: par.Child, space: [], level: level, usage: obj.usage, parent: obj.title });
                  } else {
                    space.push({ title: par.Child, space: [], level: level, usage: obj.usage, parent: obj.title });
                  }
                }
              });
              space = Array.from(new Set(space));
              sub_objs_temp.push(space);
            }
          })
        });
        sub_objs_temp = Array.from(new Set(sub_objs_temp));
        parent.map(par => {
          arborescenceSpace.map(function(item) {
            if(item.Parent.trim() === par.Child) {
              temp_parent.push(item);
            }
          });
        });
        if (sub_objs_temp.length != 0) {
          recursive(temp_parent, level, sub_objs_temp);
        } else {
          setJSON(json_data);
          return null;
        }
      }
      recursive(parent, level, sub_objs);
    }

    const fill_levels_obj = (obj) => {
      const levels = [];
      const properties = [];
      const recursive = (obj) => {
        if(!Array.isArray(obj)) {
          return;
        }
        obj.map(item => {
          if(typeof item === 'object' && item !== null) {
            levels.push({[item.title]: [...item.space.map(item => item)]});
            properties.push(item.title);
            recursive(item.space);
          }
          return;
        });
      }
      recursive(obj);
      return levels;
    }

    const siblings = (elem) => {
      // create an empty array
      let siblings = [];
  
      // if no parent, return empty list
      if (!elem.parentNode) {
          return siblings;
      }
  
      // first child of the parent node
      let sibling = elem.parentNode.firstElementChild;
  
      // loop through next siblings until `null`
      do {
          // push sibling to array
          if (sibling != elem) {
              siblings.push(sibling);
          }
      } while (sibling = sibling.nextElementSibling);
      
      return siblings;
    };

    const createColumns = (levels, lastValue, e, usage) => {
      let filter = levels.filter(item => Object.keys(item)[0] === lastValue && item[Object.keys(item)[0]][0].usage === usage);
      let table = document.createElement('table');

      let scroll = document.createElement('div');

      $(scroll).addClass(`scroll-${e.currentTarget.dataset.id}`);
      $(scroll).addClass('scroll');
      $(scroll).attr('id', `scroll-${$(e.currentTarget).attr('data-uid') || 0}`);
      $(scroll).attr("style","height:200px");
      $(scroll).on('click', function(e) {
        scrollDiv = scroll;
        siblings(scroll).map(item => {
          $(item).css('border', 'none');
          $(item).css('background-color', 'transparent');
        });
        $(scroll).css('pointer','cursor');
        $(scroll).css('border', '1px solid #999999');
        $(scroll).css('background-color', 'rgba(210, 239, 247)');
      });

      filter[0][lastValue].forEach(item => {
        let tr = document.createElement('tr');
        let td = document.createElement('td');

        let buttonSpan = document.createElement('button');
        $(buttonSpan).prop('type', 'button');
        $(buttonSpan).addClass('buttonSpan');
        $(buttonSpan).attr('data-index', 1);
        $(buttonSpan).on('click', function(e) {
          let colors = ['red', 'transparent', 'orange'];
          let status = ['Participant', 'Nothing', 'Guest'];
  
          let index = Number($(e.currentTarget).attr('data-index')) + 1;

          const span = $(e.currentTarget);
          const input = span.parent('.colContainer').children('input');

          input.attr('value', status[index % status.length]);
          span.css('background-color', colors[index % colors.length]);
          span.attr('data-index', index);
        });

        let span = document.createElement('span');
        $(span).html(item.title);

        if(knownSpaces.map(item => item.Space).filter(space => space === item.title).length != 0) {
          let space = knownSpaces.filter(space => space.Space === item.title);
          let colors = ['red', 'transparent', 'orange'];
          let status = ['Participant', 'Nothing', 'Guest'];

          $(buttonSpan).css('background-color', colors[status.indexOf(space[0]?.Role) % colors.length]);
          $(buttonSpan).attr('data-index', status.indexOf(space[0]?.Role));
        } else {
          let colors = ['red', 'transparent', 'orange'];
          $(buttonSpan).css('background-color', colors[1 % colors.length]);
          $(buttonSpan).attr('data-index', 1);
        }

        let input = document.createElement('input');
        $(input).prop('type', 'text');
        $(input).css('display', 'none');
        $(input).prop('name', item.title != undefined ? `${usage}-${item.title}` : `${usage}-${item}`);
        $(input).prop('id', item.title);
        $(input).attr('data-level', item.level);
        $(input).attr('data-usage', item.usage);
        $(input).attr('data-parent', item.parent);
        let space = knownSpaces.filter(space => space.Space === item.title);
        if(space[0]?.Role != undefined) {
          $(input).attr('value', space[0]?.Role);
        } else {
          $(input).attr('value', 'Nothing');
        }
        let colContainer = document.createElement('div');
        $(colContainer).addClass('colContainer');

        $(buttonSpan).append(span);
        $(colContainer).append(buttonSpan);

        if(item.title && item.space.length != 0) {
          let AddRighti = document.createElement('i');
          $(AddRighti).addClass('material-icons');
          $(AddRighti).html('chevron_right');
  
          let AddLefti = document.createElement('i');
          $(AddLefti).addClass('material-icons');
          $(AddLefti).html('chevron_left');
  
          let Addbutton = document.createElement('button');
          $(Addbutton).attr('data-id', e.currentTarget.dataset.id);
          $(Addbutton).attr('data-uid', uuidv4());
          $(Addbutton).val(item.title);
          $(Addbutton).addClass('colbutton');
          $(Addbutton).append(AddRighti);
          $(Addbutton).on('click', function(e) {
            e.preventDefault();
            if($(e.currentTarget).hasClass('firstclick')) {
              if($(e.currentTarget).hasClass('open')) {
                hideColumns(e);
                enableAllSpaceSiblings(e);
                $(e.currentTarget).removeClass('open');
                $(e.currentTarget).children().remove();
                $(e.currentTarget).append(AddRighti);
                $(e.currentTarget).removeClass('clicked');
              } else {
                showColumns(e);
                disableAllSpaceSiblings(e);
                $(e.currentTarget).addClass('open');
                $(e.currentTarget).children().remove();
                $(e.currentTarget).append(AddLefti);
                $(e.currentTarget).addClass('clicked');
              }
            } else {
              $(e.currentTarget).addClass('clicked');
              setColumns(e, usage);
              disableAllSpaceSiblings(e);
              $(e.currentTarget).addClass('open');
              $(e.currentTarget).addClass('firstclick');
              $(e.currentTarget).children().remove();
              $(e.currentTarget).append(AddLefti);
            }
          });
          $(colContainer).append(Addbutton);
        }
        $(colContainer).append(input);
        $(td).append(colContainer);
        $(tr).append(td);
        $(table).append(tr);
      });
      $(scroll).append(table);
      $(`#usageContainer-${e.currentTarget.dataset.id}`).append(scroll);
    }

    const hideColumns = (e) => {
      const lastValue = e.target.tagName === 'I' ? e.currentTarget : e.target;
      $(`#scroll-${$(lastValue).attr('data-uid')}`).hide();
      $(`#scroll-${$(lastValue).attr('data-uid')}`).nextAll().each((index, value) => {
        $(value).hide();
      });
    }

    const showColumns = (e) => {
      const lastValue = e.target.tagName === 'I' ? e.currentTarget : e.target;
      $(`#scroll-${$(lastValue).attr('data-uid')}`).show();
    }

    const hideAll = (e) => {
      $(`#usageContainer-${e.currentTarget.dataset.id}`).css('display', 'none');
    }

    const showAll = (e) => {
      $(`#usageContainer-${e.currentTarget.dataset.id}`).css('display', 'flex');
    }

    const disableAllSpaceSiblings = (e) => {
      const lastValue = e.target.tagName === 'I' ? e.currentTarget : e.target;

      $(lastValue).parents('tr').nextAll().each((index, value) => $(value).find('.colbutton').prop('disabled', true));
      $(lastValue).parents('tr').prevAll().each((index, value) => $(value).find('.colbutton').prop('disabled', true));
    }

    const enableAllSpaceSiblings = (e) => {
      const lastValue = e.target.tagName === 'I' ? e.currentTarget : e.target;

      $(lastValue).parents('tr').nextAll().each((index, value) => $(value).find('.colbutton').prop('disabled', false));
      $(lastValue).parents('tr').prevAll().each((index, value) => $(value).find('.colbutton').prop('disabled', false));
    }

    const disableAllSiblings = (e) => {
      const lastValue = e.target.tagName === 'I' ? e.currentTarget : e.target;

      $(lastValue).parents().nextAll('div.usageContainer').each((index, value) => $(value).find('button').prop('disabled', true));
      $(lastValue).parents().prevAll('div.usageContainer').each((index, value) => $(value).find('button').prop('disabled', true));
    }

    const enableAllSiblings = (e) => {
      const lastValue = e.target.tagName === 'I' ? e.currentTarget : e.target;

      $(lastValue).parents().nextAll('div.usageContainer').each((index, value) => $(value).find('button').prop('disabled', false));
      $(lastValue).parents().prevAll('div.usageContainer').each((index, value) => $(value).find('button').prop('disabled', false));
    }

    const setColumns = (e, usage) => {
      const lastValue = e.target.tagName === 'I' ? e.currentTarget.value : e.target.value;
      let levels = fill_levels_obj(json);

      createColumns(levels, lastValue, e, usage);
      $(`#usageContainer-${e.currentTarget.dataset.id}`).children().each((index, value) => {
        new ResizeSensor(value.children[0], function() {
          let scrollDivHeight = value.clientHeight;
          let TableDivHeight = value.children[0].clientHeight;
  
          if(TableDivHeight < scrollDivHeight) {
            value.style.overflowY = "hidden";
          } else {
            value.style.overflowX = "hidden";
            value.style.overflowY = "scroll";
            value.style.height = "200px";
          }
        });

      new ResizeSensor(document.body, function() { 
          var a = window.innerWidth;
      
          if (a <= 1100) {
            value.style.height = "180px";
          }

          if(a >= 1100) {
            value.style.overflowX = "hidden";
            value.style.height = "200px";
          }
        });
      });
      let myform = document.getElementById('my-form');

      new ResizeSensor(myform, function() {
        let scrollContainer = document.getElementsByClassName('scrollContainer')[0];
        let stylesMyform = window.getComputedStyle(myform, null);
        let styleScrollContainer = window.getComputedStyle(scrollContainer, null);
        let myFormWidth = parseInt(stylesMyform.getPropertyValue('width'));
        let scrollContainerDivWidth = parseInt(styleScrollContainer.getPropertyValue('width'));

        if(myFormWidth < scrollContainerDivWidth) {
          scrollContainer.style.overflowX = "hidden";
        } else {
          scrollContainer.style.overflowX = "scroll";
          scrollContainer.style.overflowY = "hidden";
        }
      })
    }

    useEffect(() => {
      getJSONData();
    }, []);

    useEffect(() => {
      if(currentUser.Update === "updated" || currentUser.Update === "n/a") {
        getSpacesFromGroups();
      }
    }, [currentUser]);

    const Space = ({ setColumns, showAll, hideAll, space, index }) => {
      const [open, setOpen] = useState(false);
      const [firstClick, setFirstClick] = useState(true);

      return (
          <div className="usageContainer">
            {space.level === 0 ? (
              <>
              <span>{space.title}</span>
              <button 
                className="usage-item"
                data-id={index}
                value={space.title}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if(open) {
                    hideAll(e);
                    enableAllSiblings(e);
                    setOpen(false);
                  } else {
                    if(firstClick) {
                      setColumns(e, space.title);
                      disableAllSiblings(e);
                      setOpen(true);
                      setFirstClick(false);
                    } else {
                      showAll(e);
                      disableAllSiblings(e);
                      setOpen(true);
                    }
                  }
                }}
              >
                {open ? <i className="material-icons">chevron_left</i> : <i className="material-icons">chevron_right</i>}
              </button>
              </>
            ) : null}
          </div>
      )
    };

    const ScrollSpaces = ({ json, onSubmit }) => {
      return (
        <form id="my-form" onSubmit={onSubmit}>
        {json.map((space, index) => (
          <div id={`usageContainer-${index}`} style={{display: 'flex'}}>
          </div>
        ))}
      </form>
    )
    }

    return (
        <div className="usages">
            <div className="buttonContainer">
                <Button                   
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={(e) => {
                    $(scrollDiv).find('.buttonSpan').each(function() {
                      $(this).css('background-color', 'orange');
                    });
                  }}
                >
                    Guest
                </Button>
                <Button                   
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={(e) => {
                    $(scrollDiv).find('.buttonSpan').each(function() {
                      $(this).css('background-color', 'red');
                    });
                  }}
                >
                    Participant
                </Button>
                <Button                   
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={(e) => {
                    $(scrollDiv).find('.buttonSpan').each(function() {
                      $(this).css('background-color', 'transparent');
                    });
                  }}
                >
                    Reset
                </Button>
                <Button                   
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  type="submit"
                  form="my-form"
                >
                    Add
                </Button>
            </div>
            <div className="contentContainer">
               <Scrollbars style={{ width: 300, height: 200 }} renderTrackHorizontal={props => <div {...props} style={{display: 'none'}} className="track-horizontal"/>} renderTrackVertical={props => <div {...props} className="track-vertical" />}>
              <div className="usagesContainer">
                {json.map((space, index) => (
                  <Space setColumns={setColumns} showAll={showAll} hideAll={hideAll} space={space} index={index} />
                ))}
              </div>
              </Scrollbars>
                <div className="scrollContainer">
                  <ScrollSpaces json={json} onSubmit={onSubmit} />
                </div>
            </div>
        </div>
    )
}

const mapStoreToProps = store => {
    return {
      groupSpaceDB: store.indexedDB.groupSpaceDB,
      currentUser: store.userInfo.currentUser,
      users: store.userInfo.users,
      userID: store.userInfo.userID,
      knownGroups: store.userInfo.knownGroups,
      json: store.indexedDB.json
    }
}

const mapDispatchToProps = {
  setGroups,
  updateGroups,
  setGroupUsage,
  setJSON,
  setSpacesProfil
}

export default connect(mapStoreToProps, mapDispatchToProps)(Usages);
