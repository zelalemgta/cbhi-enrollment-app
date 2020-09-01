import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const RenewalRate = (props) => {

    const [renewalRate, setRenewalRate] = useState(0);

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_RENEWAL_RATE, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_RENEWAL_RATE, (event, result) => {
            setRenewalRate(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_RENEWAL_RATE) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Renewal Rate" value={`${renewalRate} %`} />
    )
}

export default RenewalRate;