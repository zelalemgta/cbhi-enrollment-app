import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        position: 'fixed',
        width: `calc(100% - 160px)`,
        marginLeft: "160px",
        bottom: 0,
        backgroundColor: '#222d32',
        color: theme.palette.text.altColor,
        WebkitAppRegion: 'drag'
    }
}));


const Footer = () => {
    const [appVersion, setAppVersion] = useState("0.0.0");

    useEffect(() => {
        ipcRenderer.send(channels.APP_INFO);
        ipcRenderer.on(channels.APP_INFO, (event, result) => {
            setAppVersion(result);
        })
        return () => { ipcRenderer.removeAllListeners(channels.APP_INFO) };
    }, [])
    const classes = useStyles();
    return (
        <Box className={classes.root} display="flex" p={1}>
            <Box flexGrow={1} pl={2}>
                <Typography component="span" variant="caption">
                    Copyright © 2024 Ethiopian Health Insurance Service. All rights reserved.
                </Typography>
            </Box>
            <Box pr={3}>
                <Typography component="span" variant="caption">Version <b>{appVersion}</b></Typography>
            </Box>

        </Box>
    );
}

export default Footer;