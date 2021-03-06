import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid'
import MaterialTable from 'material-table';
import TableIcons from '../../molecules/TableIcons';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const Gote = (props) => {

    const columns = [{ title: 'Gote / Block Name', field: 'name' }];

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (props.parent >= 0) {
            setLoading(true);
            ipcRenderer.send(channels.LOAD_GOTE, props.parent);
        }
    }, [props.parent])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_GOTE, (event, result) => {
            setData(result);
            setLoading(false);
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_GOTE);
        }
    }, [data])

    return (
        <Grid item xs={6} md={6}>
            <MaterialTable
                title="Gotes / Block"
                icons={TableIcons}
                options={{
                    padding: "dense",
                    pageSize: 5,
                    pageSizeOptions: [],
                    toolbarButtonAlignment: "left",
                }}
                isLoading={loading}
                columns={columns}
                data={data}
                editable={{
                    onRowAdd: newData =>
                        new Promise((resolve, reject) => {
                            if (!newData.name) return reject();
                            newData.parent = props.parent;
                            newData.name = newData.name.trim();
                            ipcRenderer.send(channels.CREATE_GOTE, newData);
                            setLoading(true);
                            resolve();
                        }),
                    onRowUpdate: (newData, oldData) =>
                        new Promise((resolve, reject) => {
                            if (!newData.name) return reject();
                            newData.name = newData.name.trim();
                            ipcRenderer.send(channels.UPDATE_GOTE, newData);
                            setLoading(true);
                            resolve();

                        })
                }}
            />
        </Grid>
    );
}

export default Gote;