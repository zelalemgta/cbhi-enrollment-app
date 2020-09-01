import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    table: {
        maxWidth: '90%'
    }
}))

const MonthlyContributionStats = (props) => {

    const [contributionStat, setContributionStat] = useState({
        newMembersContributions: 0,
        renewedMembersContributions: 0,
        registrationFees: 0,
        additionalBeneficiariesFees: 0,
        otherFees: 0
    })

    const tableData = [{
        stat: "New Members Contributions",
        value: contributionStat.newMembersContributions.toLocaleString()
    }, {
        stat: "Renewed Members Contributions",
        value: contributionStat.renewedMembersContributions.toLocaleString()
    }, {
        stat: "Registration Fees",
        value: contributionStat.registrationFees.toLocaleString()
    }, {
        stat: "Additional Beneficiary Fees",
        value: contributionStat.additionalBeneficiariesFees.toLocaleString()
    }, {
        stat: "Other Fees",
        value: contributionStat.otherFees.toLocaleString()
    }]

    useEffect(() => {
        if (props.monthFrom && props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_MONTHLY_CONTRIBUTION_STATS,
                {
                    enrollmentPeriodId: props.enrollmentPeriod,
                    monthFrom: props.monthFrom,
                    monthTo: props.monthTo ? props.monthTo : null
                })
        ipcRenderer.on(channels.REPORT_MONTHLY_CONTRIBUTION_STATS, (event, result) => {
            setContributionStat(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_MONTHLY_CONTRIBUTION_STATS); }
    }, [props])

    const classes = useStyles();
    return (
        <TableContainer className={classes.table} component={Paper}>
            <Table aria-label="Monthly Statistics" size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Selected Month/s Contribution Stats</TableCell>
                        <TableCell align="right">(ETB)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableData.map((data, index) => (
                        <TableRow key={index}>
                            <TableCell component="th" scope="row">
                                {data.stat}
                            </TableCell>
                            <TableCell align="right">{data.value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default MonthlyContributionStats;