import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    SelectField: {
        padding: 0,
        margin: "8px",
        width: "20ch"
    }
}));

const SelectField = (props) => {
    const classes = useStyles();
    return (
        <FormControl className={classes.SelectField}>
            <InputLabel id={props.labelId}>{props.label}</InputLabel>
            <Select
                labelId={props.labelId}
                id={props.id}
                name={props.name}
                value={props.selectedValue}
                onChange={props.onChange}
            >
                {props.options.map((option, index) => (
                    <MenuItem key={index} value={option.value}>{option.text}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

export default SelectField;