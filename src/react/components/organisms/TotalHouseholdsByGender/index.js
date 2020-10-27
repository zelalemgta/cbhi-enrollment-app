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
                <Typography variant="caption">Male</Typography>
                <Typography variant="h4">{props.maleHouseholds}</Typography>
            </Grid>
            <Grid item xs={2}>
                <Divider className={classes.divider} orientation="vertical" />
            </Grid>

            <Grid item xs={5}>
                <Typography variant="caption">Female</Typography>
                <Typography variant="h4">{props.femaleHouseholds}</Typography>
            </Grid>
        </Grid>
    )
}

const TotalHouseholdsByGender = (props) => {

    const [householdsByGender, setHouseholdsByGender] = useState({
        maleHouseholds: 0,
        femaleHouseholds: 0
    });

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_HOUSEHOLDS_BY_GENDER, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_HOUSEHOLDS_BY_GENDER, (event, result) => {
            setHouseholdsByGender(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_HOUSEHOLDS_BY_GENDER) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Total Households By Gender">
            <StatsRenderer maleHouseholds={householdsByGender.maleHouseholds.toLocaleString()} femaleHouseholds={householdsByGender.femaleHouseholds.toLocaleString()} />
        </ReportCard>
    )
}

export default TotalHouseholdsByGender;