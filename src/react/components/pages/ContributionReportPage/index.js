import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import SelectField from '../../molecules/SelectField';
import ReportDivider from '../../molecules/ReportDivider';
import RemoveIcon from '@material-ui/icons/Remove';
import { makeStyles } from '@material-ui/core/styles';
import Subsidies from '../../organisms/Subsidies';
import TotalContribution from '../../organisms/TotalContribution';
import TotalSubsidy from '../../organisms/TotalSubsidy';
import TotalContributionCollected from '../../organisms/TotalContributionCollected';
import TotalContributionStats from '../../organisms/TotalContributionStats';
import MonthlyContributionStats from '../../organisms/MonthlyContributionStats';
import DatePicker from '../../atoms/DatePicker';
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

const ContributionReports = () => {

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
                maxDate: convertDate(period.coverageEndDate)
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
            <Grid className={classes.root} spacing={2} component="div" container alignItems="center">
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
                <Grid item xs={12}>
                    <Subsidies enrollmentPeriod={selectedDate.year} />
                </Grid>
                <Grid item xs={12}>
                    <ReportDivider title="" />
                </Grid>
                <Grid item xs={6}>
                    <MonthlyContributionStats enrollmentPeriod={selectedDate.year} dateFrom={selectedDate.dateFrom} dateTo={selectedDate.dateTo} />
                </Grid>
                <Grid item xs={6}>
                    <TotalContributionStats enrollmentPeriod={selectedDate.year} />
                </Grid>

                <Grid className={classes.footer} component="div" spacing={2} container alignItems="center">
                    <Grid item xs={12}>
                        <ReportDivider title="Total Contributions & Subsidies" />
                    </Grid>
                    <Grid item xs={4}>
                        <TotalContribution enrollmentPeriod={selectedDate.year} />
                    </Grid>
                    <Grid item xs={4}>
                        <TotalSubsidy enrollmentPeriod={selectedDate.year} />
                    </Grid>
                    <Grid item xs={4}>
                        <TotalContributionCollected enrollmentPeriod={selectedDate.year} />
                    </Grid>
                </Grid>
            </Grid >
        </Box >
    );
}

export default ContributionReports;