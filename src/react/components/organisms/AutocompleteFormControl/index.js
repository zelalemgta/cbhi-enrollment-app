import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { channels } from "../../../../shared/constants";
import makeStyles from '@material-ui/core/styles/makeStyles';
const { ipcRenderer } = window;

const useStyles = makeStyles({
    option: {
      fontSize: 15,
    },
    groupLabel: {
        background: "rgba(0, 0, 0, 0.09)",
        paddingTop: 0,
        lineHeight: "40px",
        margin: 0
    }
  });

const AutocompleteFormControl = (props) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    ipcRenderer.send(channels.LOAD_ADMINISTRATIVE_DIVISIONS);
  }, []);

  useEffect(() => {
    ipcRenderer.on(channels.LOAD_ADMINISTRATIVE_DIVISIONS, (event, result) => {
      result.map((ad) => {
        if (ad.parent) {
          const parentKebele = result.filter((k) => k.id === ad.parent)[0];
          ad.parentName = parentKebele.name;
          return ad;
        } else {
          ad.parentName = "";
          return ad;
        }
      });
      setOptions(result);
    });
    return () => {
      ipcRenderer.removeAllListeners(channels.LOAD_ADMINISTRATIVE_DIVISIONS);
    };
  }, [options]);
  const classes = useStyles()
  return (
    <Autocomplete
      id="AdministrativeDivisionId"
      className={props.classes}
      classes={{
        option: classes.option,
        groupLabel: classes.groupLabel
      }}
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
      groupBy={(option) => option.parentName}
      renderInput={(params) => (
        <TextField
          {...params}
          required={props.required}
          label="Kebele/Gote"
          variant="standard"
        />
      )}
    />
  );
};

export default AutocompleteFormControl;
