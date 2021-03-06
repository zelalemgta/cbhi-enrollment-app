import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { channels } from '../../../../shared/constants';
import { makeStyles } from '@material-ui/core/styles';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: "0px"
    },
    divider: {
        margin: "0px auto"
    }

}))

const StatsRenderer = (props) => {
    const classes = useStyles();
    return (
        <Grid className={classes.root} container spacing={1}>
            <Grid item xs={5}>
                <Typography variant="caption">Paying</Typography>
                <Typography variant="h4">{props.paying}</Typography>
            </Grid>
            <Grid item xs={2}>
                <Divider className={classes.divider} orientation="vertical" />
            </Grid>

            <Grid item xs={5}>
                <Typography variant="caption">Indigents</Typography>
                <Typography variant="h4">{props.indigent}</Typography>
            </Grid>
        </Grid>
    )
}

const TotalBeneficiary = (props) => {

    const [enrollmentByStatus, setEnrollmentByStatus] = useState({
        indigent: 0,
        paying: 0
    });

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_TOTAL_BENEFICIARY_ENROLLED, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_TOTAL_BENEFICIARY_ENROLLED, (event, result) => {
            setEnrollmentByStatus(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_TOTAL_BENEFICIARY_ENROLLED) }
    }, [props.enrollmentPeriod])

    return (
        <ReportCard title="Beneficiaries Enrolled By Status">
            <StatsRenderer indigent={enrollmentByStatus.indigent.toLocaleString()} paying={enrollmentByStatus.paying.toLocaleString()} />
        </ReportCard>
    )
}

export default TotalBeneficiary;