import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import SelectField from '../../molecules/SelectField';
import ReportDivider from '../../molecules/ReportDivider';
import { EthiopianMonths } from '../../../../shared/constants';
import { makeStyles } from '@material-ui/core/styles';
import EligibleHousehold from '../../organisms/EligibleHousehold';
import TotalHousehold from '../../organisms/TotalHousehold';
import TotalBeneficiary from '../../organisms/TotalBeneficiary';
import TotalEnrollmentStats from '../../organisms/TotalEnrollmentStats';
import MonthlyEnrollmentStats from '../../organisms/MonthlyEnrollmentStats';
import EnrollmentRate from '../../organisms/EnrollmentRate';
import RenewalRate from '../../organisms/RenewalRate';
import TotalEnrollmentByStatus from '../../organisms/TotalEnrollmentByStatus';
import HouseholdByGender from '../../organisms/TotalHouseholdsByGender';
import RemoveIcon from '@material-ui/icons/Remove';
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
    inputDivider: {
        margin: '30px 7px 0 7px'
    },
    footer: {
        width: `calc(100% - 200px)`,
        position: 'fixed',
        padding: '1em',
        bottom: '35px'
    }
}))
const EnrollmentReports = () => {

    const [enrollmentPeriods, setEnrollmentPeriods] = useState([]);

    const [selectedDate, setSelectedDate] = useState({
        monthFrom: '',
        monthTo: '',
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
                    <SelectField id="monthFrom" name="monthFrom" labelId="monthFromLabel" label="Select From Month" options={ethiopianMonthOptions} selectedValue={selectedDate.monthFrom} onChange={handleChange} />
                    <RemoveIcon className={classes.inputDivider} />
                    <SelectField id="monthTo" name="monthTo" labelId="monthToLabel" label="Select To Month" options={ethiopianMonthOptions} selectedValue={selectedDate.monthTo} onChange={handleChange} />
                </Grid>
                <Grid item xs={4}>
                    <EligibleHousehold enrollmentPeriod={selectedDate.year} />
                </Grid>
                <Grid item xs={4}>
                    <TotalHousehold enrollmentPeriod={selectedDate.year} />
                </Grid>
                <Grid item xs={4}>
                    <TotalBeneficiary enrollmentPeriod={selectedDate.year} />
                </Grid>
                <Grid item xs={12}>
                    <ReportDivider title="Enrollment Stats" />
                </Grid>
                <Grid item xs={6}>
                    <MonthlyEnrollmentStats enrollmentPeriod={selectedDate.year} monthFrom={selectedDate.monthFrom} monthTo={selectedDate.monthTo} />
                </Grid>
                <Grid item xs={6}>
                    <TotalEnrollmentStats enrollmentPeriod={selectedDate.year} />
                </Grid>

                <Grid className={classes.footer} component="div" spacing={2} container alignItems="center">
                    <Grid item xs={12}>
                        <ReportDivider title="" />
                    </Grid>
                    <Grid item xs={4}>
                        <TotalEnrollmentByStatus enrollmentPeriod={selectedDate.year} />
                    </Grid>
                    <Grid item xs={4}>
                        <HouseholdByGender enrollmentPeriod={selectedDate.year} />
                    </Grid>
                    <Grid item xs={2}>
                        <EnrollmentRate enrollmentPeriod={selectedDate.year} />
                    </Grid>
                    <Grid item xs={2}>
                        <RenewalRate enrollmentPeriod={selectedDate.year} />
                    </Grid>

                </Grid>
            </Grid >
        </Box>
    );
}

export default EnrollmentReports;