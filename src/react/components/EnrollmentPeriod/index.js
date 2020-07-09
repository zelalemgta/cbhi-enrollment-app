import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid'
import MaterialTable from 'material-table';
import { makeStyles } from '@material-ui/core/styles';
import TableIcons from '../TableIcons';

const useStyles = makeStyles((theme) => ({
    root: {
        fontSize: 14,
    }
}));
const EnrollmentPeriod = () => {
    const classes = useStyles();

    const [columns, setColumns] = useState([
        { title: 'Enrollment Year', field: 'year' },
        { title: 'Registration Start Date', field: 'rst' },
        { title: 'Registration End Date', field: 'ret' },
        { title: 'Coverage Start Date', field: 'cst' },
        { title: 'Coverage End Date', field: 'cet' },
        { title: 'Active', field: 'active' },
    ]);

    const [data, setData] = useState([
        { year: 2008, rst: Date.parse("6/29/2019"), ret: Date.parse("6/29/2019"), cst: Date.parse("6/29/2019"), cet: Date.parse("6/29/2019"), active: false },
        { year: 2009, rst: Date.parse("6/29/2019"), ret: Date.parse("6/29/2019"), cst: Date.parse("6/29/2019"), cet: Date.parse("6/29/2019"), active: false },
        { year: 2010, rst: Date.parse("6/29/2019"), ret: Date.parse("6/29/2019"), cst: Date.parse("6/29/2019"), cet: Date.parse("6/29/2019"), active: false },
        { year: 2011, rst: Date.parse("6/29/2019"), ret: Date.parse("6/29/2019"), cst: Date.parse("6/29/2019"), cet: Date.parse("6/29/2019"), active: true },
        { year: 2012, rst: Date.parse("6/29/2019"), ret: Date.parse("6/29/2019"), cst: Date.parse("6/29/2019"), cet: Date.parse("6/29/2019"), active: false },
    ]);

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
                                setTimeout(() => {
                                    setData([...data, newData]);
                                    resolve();
                                }, 1000)
                            }),
                        onRowUpdate: (newData, oldData) =>
                            new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    const dataUpdate = [...data];
                                    const index = oldData.tableData.id;
                                    dataUpdate[index] = newData;
                                    setData([...dataUpdate]);

                                    resolve();
                                }, 1000)
                            })
                    }}
                />
            </Grid>
        </Grid>
    )
}

export default EnrollmentPeriod;