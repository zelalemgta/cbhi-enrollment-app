import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const TotalHousehold = (props) => {

    const [totalHouseholds, setTotalHouseholds] = useState(0);

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_TOTAL_HOUSEHOLD_ENROLLED, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_TOTAL_HOUSEHOLD_ENROLLED, (event, result) => {
            setTotalHouseholds(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_TOTAL_HOUSEHOLD_ENROLLED) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Total Households Enrolled" value={totalHouseholds.toLocaleString()} />
    )
}

export default TotalHousehold;