import React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    figures: {
        marginTop: '15px'
    },
    table: {
        maxWidth: '90%'
    }
}))

export const EligibleHouseholds = () => {
    const classes = useStyles();
    return (
        <Paper elevation={3}>
            <Typography variant="subtitle2">
                Eligible Households
                    </Typography>
            <Divider variant="fullWidth" />
            <Typography className={classes.figures} variant="h4">
                17,000
            </Typography>
        </Paper>
    )
}

export const MonthlyEnrollmentStat = () => {
    const tableData = [{
        stat: "New Paying Members",
        value: 1890
    }, {
        stat: "New Indigents",
        value: 1450
    }, {
        stat: "Renewed Paying Members",
        value: 8970
    }, {
        stat: "Renewed Indigents",
        value: 4670
    }]
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

export const MonthlyContributionStat = () => {
    const tableData = [{
        stat: "New Members Contributions",
        value: 65430
    }, {
        stat: "Renewed Members Contributions",
        value: 876435
    }, {
        stat: "Registration Fees",
        value: 75647
    }]
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

export const TotalEnrollments = () => {
    const classes = useStyles();
    return (
        <Paper elevation={3}>
            <Typography variant="subtitle2">
                Total Members
                    </Typography>
            <Divider variant="fullWidth" />
            <Typography className={classes.figures} variant="h4">
                12,700
            </Typography>
        </Paper>
    )
}

export const TotalContributions = () => {
    const classes = useStyles();
    return (
        <Paper elevation={3}>
            <Typography variant="subtitle2">
                Total Contribution Amount
                    </Typography>
            <Divider variant="fullWidth" />
            <Typography className={classes.figures} variant="h4">
                1,289,780
            </Typography>
        </Paper>
    )
}

export const TotalRegistrationFees = () => {
    const classes = useStyles();
    return (
        <Paper elevation={3}>
            <Typography variant="subtitle2">
                Total Registration Fee Amount
                    </Typography>
            <Divider variant="fullWidth" />
            <Typography className={classes.figures} variant="h4">
                78,560
            </Typography>
        </Paper>
    )
}