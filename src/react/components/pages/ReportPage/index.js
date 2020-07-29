import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import SelectField from '../../molecules/SelectField';
import ReportDivider from '../../molecules/ReportDivider';
import { EthiopianMonths } from '../../../../shared/constants';
import { makeStyles } from '@material-ui/core/styles';
import EligibleHousehold from '../../organisms/EligibleHousehold';
import TotalEnrollment from '../../organisms/TotalEnrollment';
import TotalContribution from '../../organisms/TotalContribution';
import TotalRegistrationFee from '../../organisms/TotalRegistrationFee';
import MonthlyEnrollmentStat from '../../organisms/MonthlyEnrollmentStat';
import MonthlyContributionStat from '../../organisms/MonthlyContributionStat';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        width: `calc(100% - 200px)`,
        padding: '1em',
        paddingTop: "50px",
        backgroundColor: '#ecf0f5',
        marginLeft: 200,
        '& .MuiPaper-root': {
            padding: '1em'
        }
    },
    footer: {
        width: `calc(100% - 200px)`,
        position: 'fixed',
        padding: '1em',
        bottom: '35px'
    }
}))
const Reports = () => {

    const [enrollmentPeriods, setEnrollmentPeriods] = useState([]);

    const [selectedDate, setSelectedDate] = useState({
        month: '',
        year: ''
    });

    const ethiopianMonthOptions = EthiopianMonths.map((month, index) => ({ text: month, value: index + 1 }));

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_ENROLLMENT_PERIOD);
        ipcRenderer.on(channels.LOAD_ENROLLMENT_PERIOD, (event, result) => {
            const periods = result.map(period => ({ text: period.enrollmentYear, value: period.id }));
            setEnrollmentPeriods(periods);
        });
        return () => { ipcRenderer.removeAllListeners(channels.LOAD_ENROLLMENT_PERIOD) }
    }, [])

    const handleChange = (e) => {
        setSelectedDate({
            ...selectedDate,
            [e.target.name]: e.target.value
        });
    }
    const classes = useStyles();
    return (
        <Box overflow="hidden">
            <Grid className={classes.root} spacing={2} component="div" container alignItems="center">
                <Grid item xs={12}>
                    <SelectField id="year" name="year" labelId="yearLabel" label="Select Year" options={enrollmentPeriods} selectedValue={selectedDate.year} onChange={handleChange} />
                    <SelectField id="month" name="month" labelId="monthLabel" label="Select Month" options={ethiopianMonthOptions} selectedValue={selectedDate.month} onChange={handleChange} />
                </Grid>
                <Grid item xs={4}>
                    <EligibleHousehold enrollmentPeriod={selectedDate.year} />
                </Grid>
                <Grid item xs={12}>
                    <ReportDivider title="Enrollments & Contributions (For Selected Month)" />
                </Grid>
                <Grid item xs={6}>
                    <MonthlyEnrollmentStat enrollmentPeriod={selectedDate.year} month={selectedDate.month} />
                </Grid>
                <Grid item xs={6}>
                    <MonthlyContributionStat enrollmentPeriod={selectedDate.year} month={selectedDate.month} />
                </Grid>

                <Grid className={classes.footer} component="div" spacing={2} container alignItems="center">
                    <Grid item xs={12}>
                        <ReportDivider title="Total Enrollments & Contributions" />
                    </Grid>
                    <Grid item xs={4}>
                        <TotalEnrollment enrollmentPeriod={selectedDate.year} />
                    </Grid>
                    <Grid item xs={4}>
                        <TotalContribution enrollmentPeriod={selectedDate.year} />
                    </Grid>
                    <Grid item xs={4}>
                        <TotalRegistrationFee enrollmentPeriod={selectedDate.year} />
                    </Grid>
                </Grid>
            </Grid >
        </Box>
    );
}

export default Reports;