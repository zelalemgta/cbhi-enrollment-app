import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import { EthiopianMonths } from '../../shared/constants';
import { makeStyles } from '@material-ui/core/styles';
import {
    EligibleHouseholds, TotalEnrollments, MonthlyEnrollmentStat,
    MonthlyContributionStat, TotalContributions, TotalRegistrationFees
} from '../components/ReportItems';

const useStyles = makeStyles((theme) => ({
    root: {
        width: `calc(100% - 200px)`,
        padding: '1em',
        backgroundColor: '#ecf0f5',
        marginLeft: 200,
        '& .MuiPaper-root': {
            padding: '1em'
        }
    },
    SelectField: {
        padding: 0,
        margin: "8px",
        width: "20ch"
    },
    footer: {
        width: `calc(100% - 200px)`,
        position: 'fixed',
        padding: '1em',
        bottom: '35px'
    }
}))
const Reports = () => {

    const [selectedDate, setSelectedDate] = useState({
        month: '',
        year: ''
    });

    const EthiopianYears = [];
    let year = 2012
    while (year >= 2005) {
        EthiopianYears.push(year)
        year--;
    }

    const handleChange = (e) => {
        setSelectedDate({
            ...selectedDate,
            [e.target.name]: e.target.value
        });
    }
    const classes = useStyles();
    return (
        <Grid className={classes.root} component="div" spacing={2} container alignItems="center">
            <Grid item xs={12}>
                <FormControl className={classes.SelectField}>
                    <InputLabel id="yearLabel">Select Year</InputLabel>
                    <Select
                        labelId="yearLabel"
                        id="year"
                        name="year"
                        required
                        value={selectedDate.year}
                        onChange={handleChange}
                    >
                        {EthiopianYears.map((year, index) => (
                            <MenuItem key={index} value={year}>{year}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl className={classes.SelectField}>
                    <InputLabel id="monthLabel">Select Month</InputLabel>
                    <Select
                        labelId="monthLabel"
                        id="month"
                        name="month"
                        required
                        value={selectedDate.month}
                        onChange={handleChange}
                    >
                        {EthiopianMonths.map((month, index) => (
                            <MenuItem key={index} value={index + 1}>{month}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={4}>
                <EligibleHouseholds />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle2">Enrollments & Contributions (For Selected Month)</Typography>
                <Divider variant="fullWidth" />
            </Grid>
            <Grid item xs={6}>
                <MonthlyEnrollmentStat />
            </Grid>
            <Grid item xs={6}>
                <MonthlyContributionStat />
            </Grid>

            <Grid className={classes.footer} component="div" spacing={2} container alignItems="center">
                <Grid item xs={12}>
                    <Typography variant="subtitle2">Total Enrollments & Contributions</Typography>
                    <Divider variant="fullWidth" />
                </Grid>
                <Grid item xs={4}>
                    <TotalEnrollments />
                </Grid>
                <Grid item xs={4}>
                    <TotalContributions />
                </Grid>
                <Grid item xs={4}>
                    <TotalRegistrationFees />
                </Grid>
            </Grid>
        </Grid>
    );
}

export default Reports;