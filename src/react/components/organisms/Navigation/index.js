import React, { useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { channels } from '../../../../shared/constants';
import Drawer from '@material-ui/core/Drawer';
import NavHeader from '../../molecules/NavHeader';
import NavList from '../../molecules/NavList';
import { SchemeNameContext } from '../../../contexts'

const { ipcRenderer } = window;

const useStyle = makeStyles((theme) => ({
    root: {
        width: 160,
        backgroundColor: "rgb(51, 87, 125)",
        background: "radial-gradient(circle, rgba(51, 87, 125, 1) 0%, rgba(5, 17, 20, 1) 100%)",
        color: theme.palette.text.altColor
    }
}));

const Navigation = () => {
    const { schemeName, setSchemeName } = useContext(SchemeNameContext)

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_PROFILE);
    }, [])

    ipcRenderer.on(channels.LOAD_PROFILE, (event, result) => {
        ipcRenderer.removeAllListeners(channels.LOAD_PROFILE);
        if (result)
            setSchemeName(result.woredaName);
    });

    const classes = useStyle();
    return (
        <Drawer classes={{ paper: classes.root }} variant="persistent" open={true}>
            <NavHeader name={schemeName} />
            <NavList />
        </Drawer>
    );
}

export default Navigation;