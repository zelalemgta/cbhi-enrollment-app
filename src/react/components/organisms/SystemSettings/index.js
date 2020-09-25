import React from 'react';
import Grid from '@material-ui/core/Grid';
import SystemBackup from '../SystemBackup';
import SystemRestore from '../SystemRestore';

const SystemSettings = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={6} md={6}>
                <SystemBackup />
            </Grid>
            <Grid item xs={6} md={6}>
                <SystemRestore />
            </Grid>
        </Grid>
    )
}

export default SystemSettings;