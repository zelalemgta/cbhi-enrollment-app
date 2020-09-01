import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const EnrollmentRate = (props) => {

    const [enrollmentRate, setEnrollmentRate] = useState(0);

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_ENROLLMENT_RATE, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_ENROLLMENT_RATE, (event, result) => {
            setEnrollmentRate(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_ENROLLMENT_RATE) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Enrollment Rate" value={`${enrollmentRate} %`} />
    )
}

export default EnrollmentRate;