import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import RemoveIcon from '@material-ui/icons/Remove';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import CloseIcon from '@material-ui/icons/Close';
import PeopleIcon from '@material-ui/icons/PeopleOutlineRounded';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        width: `calc(100% - 200px)`,
        marginLeft: 200,
        backgroundColor: theme.palette.primary.main,
        borderLeft: '3px solid #1a2226',
        WebkitAppRegion: 'drag',
        '& button': {
            WebkitAppRegion: 'no-drag',
        },
        position: "fixed"
    },
    menuButton: {
        marginRight: theme.spacing(2),
        display: "none"
    },
    hidden: {
        display: "none"
    },
    title: {
        flexGrow: 1,
        marginLeft: 10
    }
}));

const Header = () => {

    const [isFullscreen, setIsFullscreen] = useState(false);

    const openDevTools = () => {
        ipcRenderer.send(channels.DEV_TOOLS);
    }

    const minimizeWindow = () => {
        ipcRenderer.send(channels.MINIMIZE_WINDOW);
    }


    const maximizeWindow = () => {
        ipcRenderer.send(channels.MAXIMIZE_WINDOW);
    }


    const unmaximizeWindow = () => {
        ipcRenderer.send(channels.UNMAXIMIZE_WINDOW);
    }


    const closeApplication = () => {
        ipcRenderer.send(channels.CLOSE_APPLICATION);
    }

    useEffect(() => {
        ipcRenderer.on(channels.WINDOW_STATE, (event, result) => {
            setIsFullscreen(result);
        })
        return () => { ipcRenderer.removeAllListeners(channels.WINDOW_STATE) }
    }, [isFullscreen])

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
                <IconButton color="inherit" onClick={minimizeWindow}><RemoveIcon /></IconButton>
                <IconButton className={isFullscreen ? classes.hidden : null} color="inherit" onClick={maximizeWindow}>
                    <FullscreenIcon />
                </IconButton>
                <IconButton className={!isFullscreen ? classes.hidden : null} color="inherit" onClick={unmaximizeWindow}>
                    <FullscreenExitIcon />
                </IconButton>
                <IconButton color="inherit" onClick={closeApplication}><CloseIcon /></IconButton>
            </Toolbar>
        </AppBar>
    );
}

export default Header;