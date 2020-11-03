import React from 'react';
import Grid from '@material-ui/core/Grid';
import SystemBackup from '../SystemBackup';
import SystemRestore from '../SystemRestore';
import SystemReset from '../SystemReset';

const SystemSettings = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={4} md={4}>
                <SystemBackup />
            </Grid>
            <Grid item xs={4} md={4}>
                <SystemRestore />
            </Grid>
            <Grid item xs={4} md={4}>
                <SystemReset />
            </Grid>
        </Grid>
    )
}

export default SystemSettings;