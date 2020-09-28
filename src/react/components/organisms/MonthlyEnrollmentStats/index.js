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

const MonthlyEnrollmentStat = (props) => {

    const [enrollmentStat, setEnrollmentStat] = useState({
        newPayingMembers: 0,
        newIndigents: 0,
        renewedPayingMembers: 0,
        renewedIndigents: 0
    })

    const tableData = [{
        stat: "New Paying Members",
        value: enrollmentStat.newPayingMembers.toLocaleString()
    }, {
        stat: "New Indigents",
        value: enrollmentStat.newIndigents.toLocaleString()
    }, {
        stat: "Renewed Paying Members",
        value: enrollmentStat.renewedPayingMembers.toLocaleString()
    }, {
        stat: "Renewed Indigents",
        value: enrollmentStat.renewedIndigents.toLocaleString()
    }]

    useEffect(() => {
        if (props.dateFrom && props.dateTo && props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_MONTHLY_ENROLLMENT_STATS,
                {
                    enrollmentPeriodId: props.enrollmentPeriod,
                    dateFrom: props.dateFrom,
                    dateTo: props.dateTo
                })
        ipcRenderer.on(channels.REPORT_MONTHLY_ENROLLMENT_STATS, (event, result) => {
            setEnrollmentStat(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_MONTHLY_ENROLLMENT_STATS); }
    }, [props])

    const classes = useStyles();
    return (
        <TableContainer className={classes.table} component={Paper}>
            <Table aria-label="Selected Date Range Statistics" size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Selected Dates Enrollment Stats</TableCell>
                        <TableCell align="right">#</TableCell>
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

export default MonthlyEnrollmentStat;