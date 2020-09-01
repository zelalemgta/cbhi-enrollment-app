import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';
const { ipcRenderer } = window;

const TotalContributionCollected = (props) => {

    const [totalContributionCollected, setTotalContributionCollected] = useState(0);

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_TOTAL_CONTRIBUTIONS_COLLECTED, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_TOTAL_CONTRIBUTIONS_COLLECTED, (event, result) => {
            setTotalContributionCollected(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_TOTAL_CONTRIBUTIONS_COLLECTED) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Total Amount" value={totalContributionCollected.toLocaleString()} />
    )
}

export default TotalContributionCollected;