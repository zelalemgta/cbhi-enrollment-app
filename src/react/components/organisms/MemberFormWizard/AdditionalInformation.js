import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import SaveIcon from '@material-ui/icons/Save'
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import DatePicker from '../../atoms/DatePicker';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Button from '@material-ui/core/Button';
import AutocompleteFormControl from '../AutocompleteFormControl';

const useStyles = makeStyles((theme) => ({
    form: {
        maxWidth: "500px"
    },
    dialogTitle: {
        paddingBottom: "0px"
    },
    textField: {
        margin: "10px 0px"
    }

}))

const AdditionalInformation = ({ data, handleAdditionalInformation, handleCancel, nextStep, goToStep }) => {

    const [formData, setFormData] = useState({
        cbhiId: "",
        'Household.id': "",
        'Household.cbhiId': "",
        'Household.AdministrativeDivisionId': "",
        isHouseholdHead: false,
        enrolledDate: "",
        'Household.idCardIssued': false,
        isSubmitted: false,
        selectedAdministrativeDivision: ""
    })

    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        if (data) {
            setFormData({ ...formData, ...data, selectedAdministrativeDivision: selectedOption?.name })
            if (data['Household.AdministrativeDivisionId'])
                setSelectedOption({
                    id: data['Household.AdministrativeDivision.id'],
                    name: data['Household.AdministrativeDivision.name'],
                    level: data['Household.AdministrativeDivision.level']
                })
        }
    }, [data])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleAdministrativeDivisionChange = (newSelectedOption) => {
        setFormData({
            ...formData,
            "Household.AdministrativeDivisionId": newSelectedOption ? newSelectedOption.id : null,
            selectedAdministrativeDivision: newSelectedOption ? newSelectedOption.name : ""
        })
        setSelectedOption(newSelectedOption);
    }

    const handleIDCardStatusChange = (e) => {        
        setFormData({
            ...formData,
            [e.target.name]: e.target.checked
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        handleAdditionalInformation(formData)
        nextStep()
    }

    const classes = useStyles();
    return (
        <form className={classes.form} autoComplete="off" onSubmit={handleSubmit}>
            <DialogContent style={{ height: "350px" }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            className={classes.householdCBHI}
                            onChange={handleChange}
                            required={formData.isHouseholdHead ? true : false}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">/</InputAdornment>,
                                readOnly: formData.isHouseholdHead ? false : true
                            }}
                            variant={!formData.isHouseholdHead ? "filled" : "standard"}
                            id="Household.cbhiId"
                            name="Household.cbhiId"
                            placeholder="00/00/00/P-000/"
                            helperText="eg. 01/01/02/P-001234/"
                            label="Household CBHI Id"
                            value={formData["Household.cbhiId"]}
                            size='small'
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            className={classes.memberCBHI}
                            onChange={handleChange}
                            required
                            id="cbhiId"
                            name="cbhiId"
                            placeholder="00"
                            helperText="eg. 01"
                            label="Member CBHI Id"
                            value={formData.cbhiId}
                            size='small'
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <DatePicker
                            required id="enrolledDate"
                            name="enrolledDate"
                            placeholder="YYYY-MM-DD"
                            label="Enrollment Date"
                            materialUi
                            onChange={handleChange}
                            value={formData.enrolledDate}
                            maxDate={0}
                            helperText="test"
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <FormControlLabel
                            control={<Checkbox id="Household.idCardIssued" checked={formData['Household.idCardIssued']} onChange={handleIDCardStatusChange} name="Household.idCardIssued" disabled={!formData.isHouseholdHead} />}
                            label="CBHI ID Card Issued?"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box pb={1} my={1} style={{ borderBottom: "1px solid #e3e3e3" }} fontSize={14} fontWeight="fontWeightBold">[ Household Location ]</Box>
                    </Grid>
                    <Grid item xs={6}>
                        <AutocompleteFormControl
                            classes={classes.AutocompleteField}
                            handleChange={handleAdministrativeDivisionChange}
                            disabled={!formData.isHouseholdHead}
                            required={formData.isHouseholdHead ? true : false}
                            selectedOption={selectedOption}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <Divider style={{ margin: "10px 0px" }} />
            <DialogActions>
                <Button onClick={handleCancel} color="primary" size="small" autoFocus>
                    Cancel
                </Button>
                <Button
                    onClick={() => goToStep(1)}
                    variant='outlined'
                    color="primary"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                >
                    Previous
                </Button>
                <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    size="small"
                    startIcon={<SaveIcon />}
                >
                    Next
                </Button>
            </DialogActions>
        </form>


    );
}

export default AdditionalInformation;

