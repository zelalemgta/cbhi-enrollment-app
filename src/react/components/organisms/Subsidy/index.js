import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import MaterialTable from 'material-table';
import { makeStyles } from '@material-ui/core/styles';
import TableIcons from '../../molecules/TableIcons';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        fontSize: "14px",
        '& input': {
            fontSize: "13px"
        },
        '& label': {
            fontSize: "13px"
        }
    }
}));

const Subsidy = () => {

    const classes = useStyles();

    const [data, setData] = useState([]);
    const [enrollmentPeriods, setEnrollmentPeriods] = useState({});
   
    const columns = [
        {
            title: 'Enrollment Year',
            field: 'EnrollmentPeriodId',
            lookup: enrollmentPeriods,
            cellStyle: { width: '25%' }
        },
        { title: 'General Subsidy', field: 'generalSubsidy', type: 'numeric' },
        { title: 'Targeted Subsidy', field: 'targetedSubsidy', type: 'numeric' },
        { title: 'Other', field: 'other', type: 'numeric' },
    ];

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_ENROLLMENT_PERIOD);
        ipcRenderer.send(channels.LOAD_SUBSIDIES);
    }, []);

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_ENROLLMENT_PERIOD, (event, result) => {
            let lookupObj = {};
            result.map(ep => lookupObj[ep.id] = ep.enrollmentYear);
            setEnrollmentPeriods(lookupObj);
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_ENROLLMENT_PERIOD);
        }
    }, [enrollmentPeriods]);

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_SUBSIDIES, (event, result) => {
            setData(result);
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_SUBSIDIES);
        }
    }, [data]);

    return (
        <Grid container spacing={2} className={classes.root}>
            <Grid item xs={12} md={12}>
                <MaterialTable
                    title="Subsidies"
                    icons={TableIcons}
                    options={{
                        padding: "dense",
                        pageSize: 5,
                        pageSizeOptions: [],
                        toolbarButtonAlignment: "left"
                    }}
                    columns={columns}
                    data={data}
                    editable={{
                        onRowAdd: newData =>
                            new Promise((resolve, reject) => {
                                if (Object.keys(newData).length < 4)
                                    reject();
                                else {
                                    ipcRenderer.send(channels.CREATE_SUBSIDY, newData);
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
                                    ipcRenderer.send(channels.UPDATE_SUBSIDY, newData);
                                    resolve();
                                }
                            }),
                        onRowDelete: oldData =>
                            new Promise((resolve, reject) => {
                                ipcRenderer.send(channels.REMOVE_SUBSIDY, oldData.id);
                                resolve();
                            }),
                    }}
                />
            </Grid>
        </Grid>
    )
}

export default Subsidy;