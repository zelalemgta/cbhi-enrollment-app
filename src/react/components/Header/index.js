import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import PeopleIcon from '@material-ui/icons/PeopleOutlineRounded';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { channels } from '../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        width: `calc(100% - 200px)`,
        marginLeft: 200,
        backgroundColor: theme.palette.primary.main,
        borderLeft: '3px solid #1a2226'
    },
    menuButton: {
        marginRight: theme.spacing(2),
        //display: "none"
    },
    title: {
        flexGrow: 1,
        marginLeft: 10
    }
}));

const Header = () => {

    const openDevTools = () => {
        ipcRenderer.send(channels.DEV_TOOLS);
    }

    const classes = useStyles();
    return (
        <AppBar className={classes.root} position="relative">
            <Toolbar variant="dense">
                <IconButton onClick={openDevTools} edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <PeopleIcon />
                <Typography variant="h6" className={classes.title}>
                    CBHI Enrollment Application
                </Typography>
                <Button></Button>
            </Toolbar>
        </AppBar>
    );
}

export default Header;