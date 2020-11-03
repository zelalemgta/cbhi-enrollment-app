import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import SelectField from '../../molecules/SelectField';
import ReportDivider from '../../molecules/ReportDivider';
import { makeStyles } from '@material-ui/core/styles';
import EligibleHousehold from '../../organisms/EligibleHousehold';
import TotalHousehold from '../../organisms/TotalHousehold';
import TotalBeneficiary from '../../organisms/TotalBeneficiary';
import TotalEnrollmentStats from '../../organisms/TotalEnrollmentStats';
import MonthlyEnrollmentStats from '../../organisms/MonthlyEnrollmentStats';
import EnrollmentRate from '../../organisms/EnrollmentRate';
import RenewalRate from '../../organisms/RenewalRate';
import TotalEnrollmentByStatus from '../../organisms/TotalEnrollmentByStatus';
import TotalAdditionalBeneficiaries from '../../organisms/TotalAdditionalBeneficiaries';
import HouseholdByGender from '../../organisms/TotalHouseholdsByGender';
import DatePicker from '../../atoms/DatePicker';
import RemoveIcon from '@material-ui/icons/Remove';
import ExportPDF from '../../organisms/ExportPDF';
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
    exportBtn: {
        verticalAlign: "top",
        marginTop: "8px",
        float: "right"
    },
    footer: {
        width: `calc(100% - 200px)`,
        position: 'fixed',
        padding: '1em',
        bottom: '35px'
    }
}))

const convertDate = (date) => {
    const etDate = date.split('-').map(Number);
    return `${etDate[2]}/${etDate[1]}/${etDate[0]}`;
}

const EnrollmentReports = () => {

    const [enrollmentPeriods, setEnrollmentPeriods] = useState([]);
    const [selectedDate, setSelectedDate] = useState({
        year: '',
        dateFrom: '',
        dateTo: ''
    });

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_ENROLLMENT_PERIOD);
        ipcRenderer.on(channels.LOAD_ENROLLMENT_PERIOD, (event, result) => {
            const periods = result.map(period => ({
                text: period.enrollmentYear,
                value: period.id,
                minDate: convertDate(period.enrollmentStartDate),
                maxDate: convertDate(period.enrollmentEndDate)
            }));
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
        <Box>
            <Grid className={classes.root} spacing={1} component="div" container alignItems="center">
                <Grid item xs={12}>
                    <SelectField id="year" name="year" labelId="yearLabel" label="Select Year" options={enrollmentPeriods} selectedValue={selectedDate.year} onChange={handleChange} />
                    <Box mx={2} display="inline">
                        <DatePicker required id="dateFrom" name="dateFrom"
                            placeholder="YYYY-MM-DD"
                            label="Date From"
                            materialUi
                            onChange={handleChange}
                            value={selectedDate.dateFrom}
                            minDate={enrollmentPeriods.filter(p => p.value === selectedDate.year).length ? enrollmentPeriods.filter(p => p.value === selectedDate.year)[0].minDate : null}
                            maxDate={enrollmentPeriods.filter(p => p.value === selectedDate.year).length ? enrollmentPeriods.filter(p => p.value === selectedDate.year)[0].maxDate : null}
                        />
                        <RemoveIcon className={classes.inputDivider} />
                        <DatePicker required id="dateTo" name="dateTo"
                            placeholder="YYYY-MM-DD"
                            label="Date To"
                            materialUi
                            onChange={handleChange}
                            value={selectedDate.dateTo}
                            minDate={enrollmentPeriods.filter(p => p.value === selectedDate.year).length ? enrollmentPeriods.filter(p => p.value === selectedDate.year)[0].minDate : null}
                            maxDate={enrollmentPeriods.filter(p => p.value === selectedDate.year).length ? enrollmentPeriods.filter(p => p.value === selectedDate.year)[0].maxDate : null}
                        />
                        <ExportPDF className={classes.exportBtn} />
                    </Box>
                </Grid>
                <Grid item xs={2}>
                    <EligibleHousehold enrollmentPeriod={selectedDate.year} />
                </Grid>
                <Grid item xs={2}>
                    <TotalHousehold enrollmentPeriod={selectedDate.year} />
                </Grid>
                <Grid item xs={4}>
                    <TotalEnrollmentByStatus enrollmentPeriod={selectedDate.year} />
                </Grid>
                <Grid item xs={4}>
                    <TotalAdditionalBeneficiaries enrollmentPeriod={selectedDate.year} />
                </Grid>
                <Grid item xs={12}>
                    <ReportDivider title="Enrollment Stats" />
                </Grid>
                <Grid item xs={6}>
                    <MonthlyEnrollmentStats enrollmentPeriod={selectedDate.year} dateFrom={selectedDate.dateFrom} dateTo={selectedDate.dateTo} />
                </Grid>
                <Grid item xs={6}>
                    <TotalEnrollmentStats enrollmentPeriod={selectedDate.year} />
                </Grid>

                <Grid className={classes.footer} component="div" spacing={2} container alignItems="center">
                    <Grid item xs={12}>
                        <ReportDivider title="" />
                    </Grid>
                    <Grid item xs={4}>
                        <HouseholdByGender enrollmentPeriod={selectedDate.year} />
                    </Grid>
                    <Grid item xs={4}>
                        <TotalBeneficiary enrollmentPeriod={selectedDate.year} />
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