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

const MonthlyContributionStat = () => {

    const [contributionStat, setContributionStat] = useState({
        newMembersContributions: 0,
        renewedMembersContribution: 0,
        registrationFees: 0
    })

    const tableData = [{
        stat: "New Members Contributions",
        value: contributionStat.newMembersContributions
    }, {
        stat: "Renewed Members Contributions",
        value: contributionStat.renewedMembersContribution
    }, {
        stat: "Registration Fees",
        value: contributionStat.registrationFees
    }]

    useEffect(() => {
        ipcRenderer.on(channels.REPORT_MONTHLY_ENROLLMENT_STAT, (event, result) => {
            setContributionStat(result);
        });
        //return () => { ipcRenderer.removeAllListeners(channels.REPORT_MONTHLY_ENROLLMENT_STAT); }
    })

    const classes = useStyles();
    return (
        <TableContainer className={classes.table} component={Paper}>
            <Table aria-label="Monthly Statistics" size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Contribution Stats</TableCell>
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

export default MonthlyContributionStat;