import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid'
import MaterialTable from 'material-table';
import TableIcons from '../../molecules/TableIcons';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const Kebele = (props) => {

    const [data, setData] = useState([]);

    const [selectedKebele, setSelectedKebele] = useState(0);

    const columns = [{ title: 'Kebele / Ketena Name', field: 'name', width: "70%" }, { title: 'Code', field: 'code' }];

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_KEBELE);
    }, [])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_KEBELE, (event, result) => {
            const validatedResult = result.map(kebele => ({ ...kebele, code: kebele.code ? kebele.code : "" }));
            setData(validatedResult);
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_KEBELE);
        }
    }, [data])

    return (
        <Grid item xs={6} md={6}>
            <MaterialTable
                title="Kebeles / Ketena"
                icons={TableIcons}
                options={{
                    padding: "dense",
                    pageSize: 5,
                    pageSizeOptions: [],
                    toolbarButtonAlignment: "left",
                    rowStyle: rowData => ({
                        backgroundColor: rowData.id === selectedKebele ? "#c2eafc" : "inherit"
                    })
                }}
                onRowClick={(event, rowData) => {
                    setSelectedKebele(rowData.id);
                    props.loadGotes(rowData.id);
                }}
                columns={columns}
                data={data}
                editable={{
                    onRowAdd: newData =>
                        new Promise((resolve, reject) => {
                            if (!newData.name) return reject();
                            newData.name = newData.name.trim();
                            ipcRenderer.send(channels.CREATE_KEBELE, newData);
                            resolve();
                        }),
                    onRowUpdate: (newData, oldData) =>
                        new Promise((resolve, reject) => {
                            if (!newData.name) return reject();
                            newData.name = newData.name.trim();
                            ipcRenderer.send(channels.UPDATE_KEBELE, newData);
                            resolve();
                        })
                }}
            />
        </Grid>
    )
}

export default Kebele;