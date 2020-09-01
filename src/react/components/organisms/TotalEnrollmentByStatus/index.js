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
        <Grid className={classes.root} container spacing={2}>
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

const TotalEnrollmentByStatus = (props) => {

    const [enrollmentByStatus, setEnrollmentByStatus] = useState({
        indigent: 0,
        paying: 0
    });

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_TOTAL_ENROLLMENT_BY_STATUS, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_TOTAL_ENROLLMENT_BY_STATUS, (event, result) => {
            setEnrollmentByStatus(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_TOTAL_ENROLLMENT_BY_STATUS) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Total Enrollment By Membership Status">
            <StatsRenderer indigent={enrollmentByStatus.indigent.toLocaleString()} paying={enrollmentByStatus.paying.toLocaleString()} />
        </ReportCard>
    )
}

export default TotalEnrollmentByStatus;