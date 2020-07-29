import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const TotalEnrollment = (props) => {

    const [totalEnrollment, setTotalEnrollment] = useState(0);

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_TOTAL_ACTIVE_MEMBERS, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_TOTAL_ACTIVE_MEMBERS, (event, result) => {
            setTotalEnrollment(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_TOTAL_ACTIVE_MEMBERS) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Total Members" value={totalEnrollment} />
    )
}

export default TotalEnrollment;