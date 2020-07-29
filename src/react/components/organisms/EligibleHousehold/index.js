import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';
const { ipcRenderer } = window;

const EligibleHousehold = (props) => {

    const [eligibleHouseholds, setEligibleHouseholds] = useState(0);

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_ELIGIBLE_HOUSEHOLDS, props.enrollmentPeriod)
        ipcRenderer.on(channels.REPORT_ELIGIBLE_HOUSEHOLDS, (event, result) => {
            setEligibleHouseholds(result);
        })
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_ELIGIBLE_HOUSEHOLDS); }
    }, [props.enrollmentPeriod])

    return (
        <ReportCard title="Eligible Households" value={eligibleHouseholds} />
    )
}

export default EligibleHousehold;