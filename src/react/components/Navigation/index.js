import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import NavHeader from './components/NavHeader';
import NavList from './components/NavList';

const useStyle = makeStyles((theme) => ({
    root: {
        width: 200,
        backgroundColor: '#222d32',
        color: theme.palette.text.altColor
    }
}));

const Navigation = () => {

    const classes = useStyle();
    return (
        <Drawer classes={{ paper: classes.root }} variant="persistent" open={true}>
            <NavHeader name="Kilite Awelaelo" />
            <NavList />
        </Drawer>
    );
}

export default Navigation;