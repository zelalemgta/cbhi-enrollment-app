import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { channels } from '../../../../shared/constants';
import Drawer from '@material-ui/core/Drawer';
import NavHeader from '../../molecules/NavHeader';
import NavList from '../../molecules/NavList';

const { ipcRenderer } = window;

const useStyle = makeStyles((theme) => ({
    root: {
        width: 200,
        backgroundColor: '#222d32',
        color: theme.palette.text.altColor
    }
}));

const Navigation = () => {

    const [woredaName, setWoredaName] = useState("[Woreda Name]");

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_PROFILE);
    }, [])

    ipcRenderer.on(channels.LOAD_PROFILE, (event, result) => {
        ipcRenderer.removeAllListeners(channels.LOAD_PROFILE);
        if (result)
            setWoredaName(result.woredaName);
    });

    const classes = useStyle();
    return (
        <Drawer classes={{ paper: classes.root }} variant="persistent" open={true}>
            <NavHeader name={woredaName} />
            <NavList />
        </Drawer>
    );
}

export default Navigation;