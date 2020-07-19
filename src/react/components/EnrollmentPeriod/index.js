import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid'
import MaterialTable from 'material-table';
import { makeStyles } from '@material-ui/core/styles';
import TableIcons from '../TableIcons';
import { channels } from '../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        fontSize: 14,
    }
}));
const EnrollmentPeriod = () => {

    const classes = useStyles();

    const columns = [
        { title: 'Enrollment Year', field: 'enrollmentYear', defaultSort: 'desc' },
        { title: 'Registration Start Date', field: 'enrollmentStartDate' },
        { title: 'Registration End Date', field: 'enrollmentEndDate' },
        { title: 'Coverage Start Date', field: 'coverageStartDate' },
        { title: 'Coverage End Date', field: 'coverageEndDate' },
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
                                ipcRenderer.send(channels.CREATE_ENROLLMENT_PERIOD, newData);
                                resolve();
                            }),
                        onRowUpdate: (newData, oldData) =>
                            new Promise((resolve, reject) => {
                                ipcRenderer.send(channels.UPDATE_ENROLLMENT_PERIOD, newData);
                                resolve();
                            })
                    }}
                />
            </Grid>
        </Grid>
    )
}

export default EnrollmentPeriod;