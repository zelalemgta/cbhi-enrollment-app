import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';
const { ipcRenderer } = window;

const TotalRegistrationFee = (props) => {

    const [totalRegistrationFee, setTotalRegistrationFee] = useState(0);

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_TOTAL_REGISTRATION_FEE, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_TOTAL_REGISTRATION_FEE, (event, result) => {
            setTotalRegistrationFee(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_TOTAL_REGISTRATION_FEE) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Total Registration Fee Amount" value={totalRegistrationFee} />
    )
}

export default TotalRegistrationFee;