import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const TotalSubsidy = (props) => {
    const [totalSubsidy, setTotalSubsidy] = useState(0);

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_TOTAL_SUBSIDY, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_TOTAL_SUBSIDY, (event, result) => {
            if (result)
                setTotalSubsidy(result.generalSubsidy + result.targetedSubsidy + result.other);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_TOTAL_SUBSIDY) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Total Subsidy Amount (ETB)" value={totalSubsidy.toLocaleString()} />
    )
}

export default TotalSubsidy;