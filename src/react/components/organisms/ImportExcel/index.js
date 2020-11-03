import React from 'react';
import Grid from '@material-ui/core/Grid';
import DownloadEnrollmentTemplate from '../DownloadEnrollmentTemplate';
import ImportEnrollmentData from '../ImportEnrollmentData';

const ImportExcel = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={6} md={6}>
                <DownloadEnrollmentTemplate />
            </Grid>
            <Grid item xs={6} md={6}>
                <ImportEnrollmentData />
            </Grid>
        </Grid>
    )
}

export default ImportExcel;