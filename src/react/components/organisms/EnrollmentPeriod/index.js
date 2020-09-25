import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import MaterialTable from 'material-table';
import DatePicker from '../../atoms/DatePicker';
import { makeStyles } from '@material-ui/core/styles';
import TableIcons from '../../molecules/TableIcons';

import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        fontSize: "14px",
        '& input': {
            fontSize: "13px",
        },
        '& label': {
            fontSize: "13px"
        }
    }
}));
const EnrollmentPeriod = () => {

    const classes = useStyles();

    const columns = [
        { title: 'Enrollment Year', field: 'enrollmentYear', defaultSort: 'desc' },
        { title: 'Eligible Households', field: 'eligibleHouseholds', type: 'numeric' },
        {
            title: 'Reg. Start Date',
            field: 'enrollmentStartDate',
            editComponent: props => (
                <DatePicker
                    value={props.value}
                    onChange={e => props.onChange(e.target.value)}
                    width={75}
                />
            )
        },
        {
            title: 'Reg. End Date',
            field: 'enrollmentEndDate',
            editComponent: props => (
                <DatePicker
                    value={props.value}
                    onChange={e => props.onChange(e.target.value)}
                />
            )
        },
        {
            title: 'Coverage Start Date',
            field: 'coverageStartDate',
            editComponent: props => (
                <DatePicker
                    value={props.value}
                    onChange={e => props.onChange(e.target.value)}
                />
            )
        },
        {
            title: 'Coverage End Date',
            field: 'coverageEndDate',
            editComponent: props => (
                <DatePicker
                    value={props.value}
                    onChange={e => props.onChange(e.target.value)}
                />
            )
        },
        { title: 'Active', field: 'active', editable: 'never' },
    ];

    const [data, setData] = useState([]);

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_ENROLLMENT_PERIOD);
    }, [])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_ENROLLMENT_PERIOD, (event, result) => {
            setData(result);
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_ENROLLMENT_PERIOD);
        }
    }, [data]);

    return (
        <Grid container spacing={2} className={classes.root}>
            <Grid item xs={12} md={12}>
                <MaterialTable
                    title="Enrollment Periods"
                    icons={TableIcons}
                    options={{
                        padding: "dense",
                        pageSize: 5,
                        pageSizeOptions: [],
                        toolbarButtonAlignment: "left",
                        rowStyle: rowData => ({
                            backgroundColor: rowData.active ? "#a5d6a7" : "inherit"
                        })
                    }}
                    columns={columns}
                    data={data}
                    editable={{
                        onRowAdd: newData =>
                            new Promise((resolve, reject) => {
                                if (Object.keys(newData).length < 6)
                                    reject();
                                else {
                                    ipcRenderer.send(channels.CREATE_ENROLLMENT_PERIOD, newData);
                                    resolve();
                                }
                            }),
                        onRowUpdate: (newData, oldData) =>
                            new Promise((resolve, reject) => {
                                let emptyValueCount = 0;
                                Object.values(newData).map(val => (val === '' || val === null) && emptyValueCount++);
                                if (emptyValueCount > 0)
                                    reject();
                                else {
                                    ipcRenderer.send(channels.UPDATE_ENROLLMENT_PERIOD, newData);
                                    resolve();
                                }
                            })
                    }}
                />
            </Grid>
        </Grid>
    )
}

export default EnrollmentPeriod;