import React from 'react';
import { useHistory } from "react-router-dom";
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PeopleIcon from '@material-ui/icons/People';
import AssessmentIcon from '@material-ui/icons/Assessment';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import SettingsIcon from '@material-ui/icons/Settings';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    listItem: { 
        color: "#fff",
        minHeight: 48,
        '& div': {
            color: '#fff',
            minWidth: 40
        }
    },
    listItemText: {
        fontSize: "0.95rem"
    },
    expansionPanel: {
        background: "none",
        padding: '0px 16px',
        margin: '0px',
        '& div': {
            color: "#fff",
            padding: 0,
            margin: 0,
        },
        '&$expanded': {
            margin: '0px 0px'
        },
        '& .MuiExpansionPanelDetails-root': {
            display: "inline"
        }
    },
    expansionSummary: {
        maxHeight: '48px'
    },
    expanded: {
        '& .MuiCollapse-container': {
            marginLeft: "16px"
        }
    },
}));

const NavListItems = (props) => {

    let history = useHistory();

    const classes = useStyles();

    return (
        <>
            <ListItem className={classes.listItem} button onClick={() => history.push("/")}>
                <ListItemIcon>
                    <PeopleIcon />
                </ListItemIcon>
                <Typography className={classes.listItemText} variant="body2">Members</Typography>                
            </ListItem>
            <ExpansionPanel classes={{ root: classes.expansionPanel, expanded: classes.expanded }}>
                <ExpansionPanelSummary classes={{ root: classes.expansionSummary }} expandIcon={<ExpandMoreIcon />}>
                    <ListItem className={classes.listItem} button>
                        <ListItemIcon>
                            <AssessmentIcon />
                        </ListItemIcon>
                        <Typography className={classes.listItemText} variant="body2">Reports</Typography>                        
                    </ListItem>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <ListItem className={classes.listItem} button onClick={() => history.push("/reports/enrollment")}>
                        <ListItemIcon>
                            <PeopleOutlineIcon />
                        </ListItemIcon>
                        <Typography className={classes.listItemText} variant="body2">Enrollment</Typography>                        
                    </ListItem>
                    <ListItem className={classes.listItem} button onClick={() => history.push("/reports/contribution")}>
                        <ListItemIcon>
                            <MonetizationOnIcon />
                        </ListItemIcon>
                        <Typography className={classes.listItemText} variant="body2">Contribution</Typography>                        
                    </ListItem>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ListItem className={classes.listItem} button onClick={() => history.push("/settings")}>
                <ListItemIcon>
                    <SettingsIcon />
                </ListItemIcon>
                <Typography className={classes.listItemText} variant="body2">Settings</Typography>                
            </ListItem>
        </>
    )
}

export default NavListItems;