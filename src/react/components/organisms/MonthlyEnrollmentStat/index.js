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
        value: enrollmentStat.newPayingMembers
    }, {
        stat: "New Indigents",
        value: enrollmentStat.newIndigents
    }, {
        stat: "Renewed Paying Members",
        value: enrollmentStat.renewedPayingMembers
    }, {
        stat: "Renewed Indigents",
        value: enrollmentStat.renewedIndigents
    }]

    useEffect(() => {
        if (props.month && props.enrollmentPeriod)
            ipcRenderer.send(channels.REPORT_MONTHLY_ENROLLMENT_STAT,
                {
                    enrollmentPeriodId: props.enrollmentPeriod,
                    month: props.month
                })
        ipcRenderer.on(channels.REPORT_MONTHLY_ENROLLMENT_STAT, (event, result) => {
            setEnrollmentStat(result);
        });
        return () => { ipcRenderer.removeAllListeners(channels.REPORT_MONTHLY_ENROLLMENT_STAT); }
    }, [props.month, props.enrollmentPeriod])

    const classes = useStyles();
    return (
        <TableContainer className={classes.table} component={Paper}>
            <Table aria-label="Monthly Statistics" size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Enrollment Stats</TableCell>
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