import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import MaterialTable from 'material-table';
import { makeStyles } from '@material-ui/core/styles';
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
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
    },
    tableHeader: {
        backgroundColor: "#ecf0f5",
        '& th': {
            textAlign: "center",
            fontSize: "13px",
            padding: "6px 2px",
            borderRight: "1px solid #e3e3e3"
        }
    }
}));

const SubsidyColumns = () => {
    const classes = useStyles()
    return (
        <TableHead className={classes.tableHeader}>
            <TableRow>
                <TableCell rowSpan={2} align="center">Actions</TableCell>
                <TableCell rowSpan={2}>Enrollment Year</TableCell>
                <TableCell rowSpan={2} align="center">General Subsidy (ETB)</TableCell>
                <TableCell colSpan={3} align="center">Targeted Subsidies (ETB)</TableCell>
                <TableCell rowSpan={2} align="center">Other (ETB)</TableCell>

            </TableRow>
            <TableRow>
                <TableCell align="center">Region</TableCell>
                <TableCell align="center">Zone</TableCell>
                <TableCell align="center">Woreda</TableCell>
            </TableRow>
        </TableHead>
    )
}

const Subsidy = () => {

    const classes = useStyles();

    const [data, setData] = useState([]);
    const [enrollmentPeriods, setEnrollmentPeriods] = useState({});

    const columns = [
        {
            title: 'Enrollment Year',
            field: 'EnrollmentPeriodId',
            lookup: enrollmentPeriods,
        },
        { title: 'General Subsidy', field: 'generalSubsidy', type: 'numeric', align: 'center', render: rowData => rowData.generalSubsidy.toLocaleString() },
        { title: 'Targeted Subsidy', field: 'regionTargetedSubsidy', type: 'numeric', align: 'center', render: rowData => rowData.regionTargetedSubsidy.toLocaleString() },
        { title: 'Targeted Subsidy', field: 'zoneTargetedSubsidy', type: 'numeric', align: 'center', render: rowData => rowData.zoneTargetedSubsidy.toLocaleString() },
        { title: 'Targeted Subsidy', field: 'woredaTargetedSubsidy', type: 'numeric', align: 'center', render: rowData => rowData.woredaTargetedSubsidy.toLocaleString() },
        { title: 'Other', field: 'other', type: 'numeric', align: 'center', render: rowData => rowData.other.toLocaleString() },
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
                        toolbarButtonAlignment: "left",
                        rowStyle: {
                            fontSize: "13px",
                            textAlign: "center"
                        },
                    }}
                    columns={columns}
                    data={data}
                    components={{
                        Header: props => (
                            <SubsidyColumns />
                        )
                    }}
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