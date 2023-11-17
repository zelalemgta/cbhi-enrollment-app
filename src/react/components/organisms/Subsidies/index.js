import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';
import { makeStyles } from '@material-ui/core/styles';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: "0px"
  },
  divider: {
    margin: "0px auto"
  },
  targetedSubsidyValue: {
    fontSize: "1.5vw"
  }
}))


const TargetedSubsidiesStatsRenderer = (props) => {
  const classes = useStyles();
  return (
    <Grid className={classes.root} container spacing={1}>
      <Grid item xs={3}>
        <Typography variant="caption">Region</Typography>
        <Typography className={classes.targetedSubsidyValue} variant="h4">{props.region}</Typography>
      </Grid>
      <Grid item xs={1}>
        <Divider className={classes.divider} orientation="vertical" />
      </Grid>
      <Grid item xs={3}>
        <Typography variant="caption">Zone</Typography>
        <Typography className={classes.targetedSubsidyValue} variant="h4">{props.zone}</Typography>
      </Grid>
      <Grid item xs={1}>
        <Divider className={classes.divider} orientation="vertical" />
      </Grid>
      <Grid item xs={3}>
        <Typography variant="caption">Woreda</Typography>
        <Typography className={classes.targetedSubsidyValue} variant="h4">{props.woreda}</Typography>
      </Grid>
    </Grid>
  );
}

const Subsidies = (props) => {
  const [subsidies, setSubsidies] = useState({
    generalSubsidy: 0,
    regionTargetedSubsidy: 0,
    zoneTargetedSubsidy: 0,
    woredaTargetedSubsidy: 0,
    other: 0
  });

  useEffect(() => {
    if (props.enrollmentPeriod)
      ipcRenderer.send(channels.REPORT_SUBSIDIES, props.enrollmentPeriod);
    ipcRenderer.on(channels.REPORT_SUBSIDIES, (event, result) => {
      setSubsidies(result);
    });
    return () => { ipcRenderer.removeAllListeners(channels.REPORT_SUBSIDIES) }
  }, [props.enrollmentPeriod])
  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <ReportCard
          title="General Subsidy (ETB)"
          value={subsidies?.generalSubsidy?.toLocaleString()}
        />
      </Grid>

      <Grid item xs={6}>
        <ReportCard title="Targeted Subsidies (ETB)">
          <TargetedSubsidiesStatsRenderer
            region={subsidies?.regionTargetedSubsidy?.toLocaleString()}
            zone={subsidies?.zoneTargetedSubsidy?.toLocaleString()}
            woreda={subsidies?.woredaTargetedSubsidy?.toLocaleString()}
          />
        </ReportCard>
      </Grid>

      <Grid item xs={3}>
        <ReportCard
          title="Other (ETB)"
          value={subsidies?.other?.toLocaleString()}
        />
      </Grid>
    </Grid>
  );
}

export default Subsidies;