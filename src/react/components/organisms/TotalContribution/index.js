import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const TotalContribution = (props) => {
    const [totalContribution, setTotalContribution] = useState(0);

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_TOTAL_CONTRIBUTION, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_TOTAL_CONTRIBUTION, (event, result) => {
            setTotalContribution(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_TOTAL_CONTRIBUTION) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Total Contribution Amount" value={totalContribution} />
    )
}

export default TotalContribution;