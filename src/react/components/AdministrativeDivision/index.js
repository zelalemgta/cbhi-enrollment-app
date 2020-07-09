import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid'
import MaterialTable from 'material-table';
import { makeStyles } from '@material-ui/core/styles';
import TableIcons from '../TableIcons';

const useStyles = makeStyles((theme) => ({
    root: {
        fontSize: 14
    }
}));

const AdministrativeDivision = () => {
    const classes = useStyles();
    const [columns, setColumns] = useState([
        { title: 'Kebele Name', field: 'name' },
    ]);

    const [data, setData] = useState([
        { name: 'Adi Kisandid' },
        { name: 'Agulae' },
        { name: 'Wukro Ketema' },
        { name: 'Abrha Atsbeha' },
        { name: 'Negashi' },
    ]);

    return (
        <Grid container spacing={2} className={classes.root}>
            <Grid item xs={6} md={6}>
                <MaterialTable
                    title="Kebeles"
                    icons={TableIcons}
                    options={{
                        padding: "dense",
                        pageSize: 5,
                        pageSizeOptions: [],
                        toolbarButtonAlignment: "left",
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

            <Grid item xs={6} md={6}>
                <MaterialTable
                    title="Gotes"
                    icons={TableIcons}
                    options={{
                        padding: "dense",
                        pageSize: 5,
                        pageSizeOptions: [],
                        toolbarButtonAlignment: "left",
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

export default AdministrativeDivision;