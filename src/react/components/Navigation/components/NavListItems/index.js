import React from 'react';
import { useHistory } from "react-router-dom";
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AssessmentIcon from '@material-ui/icons/Assessment';
import PeopleIcon from '@material-ui/icons/People';
import TableChartIcon from '@material-ui/icons/TableChart';
import SettingsIcon from '@material-ui/icons/Settings';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    listItem: {
        color: "#fff",
        '& div': {
            color: '#fff',
            minWidth: 40
        }
    }
}));

const NavListItems = (props) => {

    let history = useHistory();

    const classes = useStyles();

    return (
        <React.Fragment>
            <ListItem className={classes.listItem} button onClick={() => history.push("/")}>
                <ListItemIcon>
                    <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Members" />
            </ListItem>
            <ListItem className={classes.listItem} button onClick={() => history.push("/")}>
                <ListItemIcon>
                    <TableChartIcon />
                </ListItemIcon>
                <ListItemText primary="Reports" />
            </ListItem>
            <ListItem className={classes.listItem} button onClick={() => history.push("/settings")}>
                <ListItemIcon>
                    <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
            </ListItem>
        </React.Fragment>
    )
}

export default NavListItems;