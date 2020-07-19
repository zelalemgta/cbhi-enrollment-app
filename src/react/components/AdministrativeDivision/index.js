import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles';
import Kebele from './components/Kebele';
import Gote from './components/Gote';

const useStyles = makeStyles((theme) => ({
    root: {
        fontSize: 14
    }
}));

const AdministrativeDivision = () => {
    const classes = useStyles();

    const [selectedKebele, setSelectedKebele] = useState(0);

    const loadGotes = (kebeleId) => {
        setSelectedKebele(kebeleId);
    }

    return (
        <Grid container spacing={2} className={classes.root}>
            <Kebele loadGotes={loadGotes} />
            <Gote parent={selectedKebele} />
        </Grid>
    )
}

export default AdministrativeDivision;