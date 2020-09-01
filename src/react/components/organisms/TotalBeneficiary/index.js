import React, { useState, useEffect } from 'react';
import ReportCard from '../../molecules/ReportCard';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const TotalBeneficiary = (props) => {

    const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);

    useEffect(() => {
        if (props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_TOTAL_BENEFICIARY_ENROLLED, props.enrollmentPeriod);
        ipcRenderer.on(channels.REPORT_TOTAL_BENEFICIARY_ENROLLED, (event, result) => {
            setTotalBeneficiaries(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_TOTAL_BENEFICIARY_ENROLLED) }
    }, [props.enrollmentPeriod])
    return (
        <ReportCard title="Total Beneficiaries Enrolled" value={totalBeneficiaries.toLocaleString()} />
    )
}

export default TotalBeneficiary;