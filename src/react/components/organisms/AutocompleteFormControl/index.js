import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { channels } from '../../../../shared/constants'

const { ipcRenderer } = window;

const AutocompleteFormControl = (props) => {

    const [options, setOptions] = useState([]);

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_ADMINISTRATIVE_DIVISIONS);
    }, [])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_ADMINISTRATIVE_DIVISIONS, (event, result) => {
            setOptions(result);
        })
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_ADMINISTRATIVE_DIVISIONS);
        }
    }, [options])

    return (
        <Autocomplete
            id="AdministrativeDivisionId"
            className={props.classes}
            value={props.selectedOption}
            onChange={(event, newValue) => {
                props.handleChange(newValue);
            }}
            disableClearable={props.disableClearable}
            disabled={props.disabled}
            autoHighlight
            options={options}
            getOptionSelected={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option && `${option.name} (${option.level})`}
            renderInput={(params) => <TextField {...params} label="Kebele/Gote" variant="standard" />}
        />
    );
}

export default AutocompleteFormControl;
