import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const Subsidies = (props) => {
    const [subsidies, setSubsidies] = useState({
        generalSubsidy: 0,
        targetedSubsidy: 0,
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
            <Grid item xs={4}>
                <ReportCard title="General Subsidy (ETB)" value={subsidies ? subsidies.generalSubsidy.toLocaleString() : 0} />
            </Grid>
            <Grid item xs={4}>
                <ReportCard title="Targeted Subsidy (ETB)" value={subsidies ? subsidies.targetedSubsidy.toLocaleString() : 0} />
            </Grid>
            <Grid item xs={4}>
                <ReportCard title="Other (ETB)" value={subsidies ? subsidies.other.toLocaleString() : 0} />
            </Grid>
        </Grid>
    )
}

export default Subsidies;