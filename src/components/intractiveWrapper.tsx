import React from "react";
import "./interactive.scss";
import deepcopy from "deepcopy";
import Box from "@mui/material/Box";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";

interface ChecklistData {
  interactiveTitle: string;
  intructions: string;
  checklistDataItems: Array<ChecklistItemData>;
}

interface ChecklistItemData {
  lable: string;
  subLable?: string;
  isChecked: Boolean;
}

interface PropType {
  src?: string;
}
interface StateType {
  langData: object;
  checklistData: ChecklistData;
}

class IntractiveWrapper extends React.Component<PropType, StateType> {
  ref: any = null;
  usingDataSrc: string = "";
  supportedLangs: Array<string> = ["en", "fr-ca"];
  defaultLang: string = "en";
  langSelection: string = this.defaultLang;
  stepperSteps: Array<{ label: string; description: string }> = [];
  correctResponce: boolean = false;
  score: number = 0;

  state = {
    langData: {},
    checklistData: {
      interactiveTitle: "data has failed to load",
      intructions: "data has failed to load",
      checklistDataItems: [
        {
          lable: "data has failed to load",
          subLable: "do somthing about that",
          isChecked: false,
        },
      ],
    },
  };

  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount = () => {
    //this.getLangData();
    console.log("MpsPlayer ready");

    if ((window as any).cl_srcOverride) {
      this.usingDataSrc = (window as any).cl_srcOverride as string;
    }
    // if ((window as any).parent && (window as any).parent.cl_srcOverride) {
    // this.usingDataSrc = (window as any).parent.cl_srcOverride as string;
    // }
    else if (this.props.src) {
      this.usingDataSrc = this.props.src;
    } else {
      this.usingDataSrc = "./sample.json";
    }

    this.getListData().then(() => {
      //this.shuffleAnswerData().then();
    });
  };

  getLangData = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).cl_langOverride) {
        if (
          this.supportedLangs.indexOf((window as any).cl_langOverride) === -1
        ) {
          this.langSelection = (window as any).cl_srcOverride as string;
        } else {
          console.warn(
            `provided lang overide ${
              (window as any).cl_srcOverride
            } is not availible`
          );
        }
      }

      fetch(`./lang/${this.langSelection}.json`)
        .then((response) => response.json())
        .then((publicLangData: object) => {
          this.setState(
            {
              langData: publicLangData,
            },
            () => {
              resolve(this.state.langData);
            }
          );
        });
    });
  };

  getListData = () => {
    return new Promise((resolve, reject) => {
      fetch(this.usingDataSrc)
        .then((response) => response.json())
        .then((publicListData: ChecklistData) => {
          this.setState(
            {
              checklistData: publicListData,
            },
            () => {
              resolve(this.state.checklistData);
            }
          );
        });
    });
  };

  langKey = (key: string) => {
    return this.state.langData[key] as string;
  };

  handleChecklistSelection = (listItemNumber: number) => {
    const listCopy: ChecklistData = deepcopy(this.state.checklistData);
    listCopy.checklistDataItems[listItemNumber].isChecked =
      !listCopy.checklistDataItems[listItemNumber].isChecked;
    this.setState({ checklistData: listCopy });
  };

  render() {
    const buildHeader = () => {
      if (this.state.checklistData.interactiveTitle) {
        return (
          <h2 className="cl_header">
            {this.state.checklistData.interactiveTitle}
          </h2>
        );
      } else {
        return "";
      }
    };

    const buildInsturction = () => {
      if (this.state.checklistData.interactiveTitle) {
        return (
          <Box
            className="instructionText"
            dangerouslySetInnerHTML={{
              __html: this.state.checklistData.intructions,
            }}
          ></Box>
        );
      } else {
        return (
          <Box className="instructionText">
            <p>
              <strong> Instructions: </strong> This checklist is for your
              referance only. Data will not be saved or recorded.
            </p>
          </Box>
        );
      }
    };

    const buildListItem = (clItem: ChecklistItemData, listItmIndex: number) => {
      return (
        <div>
          <ListItem key={listItmIndex} disablePadding>
            <ListItemButton
              role={undefined}
              onClick={() => {
                this.handleChecklistSelection(listItmIndex);
              }}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={
                    this.state.checklistData.checklistDataItems[listItmIndex]
                      .isChecked
                  }
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    "aria-labelledby": `checkListItemLable-${listItmIndex}`,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                id={`checkListItemLable-${listItmIndex}`}
                primary={
                  this.state.checklistData.checklistDataItems[listItmIndex]
                    .lable
                }
                secondary={
                  this.state.checklistData.checklistDataItems[listItmIndex]
                    .subLable
                }
              />
            </ListItemButton>
          </ListItem>
          <Divider variant="inset" component="li" />
        </div>
      );
    };

    const buildListItems = () => {
      const listItems = this.state.checklistData.checklistDataItems.map(
        (crd: ChecklistItemData, idx: number) => {
          return buildListItem(crd, idx);
        }
      );
      return listItems;
    };

    return (
      <Box className="clInteractive">
        {buildHeader()}
        {buildInsturction()}

        <List className="cl_listDisplay">{buildListItems()}</List>
      </Box>
    );
  }
}

export default IntractiveWrapper;
