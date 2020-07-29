import React from 'react';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import NavListItems from '../NavListItems';
import { makeStyles } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
    subheader: {
        backgroundColor: '#1a2226',
        color: '#a7a7a7',
        textTransform: "uppercase",
        fontSize: "12px"
    }
}));

const NavList = () => {

    const classes = useStyles();
    return (
        <List
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
                <ListSubheader className={classes.subheader} component="div" id="nested-list-subheader">
                    Main Navigation
                     </ListSubheader>
            }
        >
            <NavListItems />
        </List>
    )
}

export default NavList;