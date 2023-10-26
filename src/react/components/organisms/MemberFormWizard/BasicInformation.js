import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import SaveIcon from '@material-ui/icons/Save'
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import DatePicker from '../../atoms/DatePicker';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import { toEthiopian } from 'ethiopian-date';
import { genderOptions, relationshipOptions, professionOptions } from '../../../../shared/constants';

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

const calculateDateOfBirth = (age) => {
    if (age) {
        const currentDate = new Date().getTime();
        const ageInMilliseconds = age * (1000 * 60 * 60 * 24 * 365.25);
        const dateOfBirth = new Date(currentDate - ageInMilliseconds);
        const dobInEthiopian = toEthiopian(dateOfBirth.getFullYear(), dateOfBirth.getMonth() + 1, dateOfBirth.getDate());
        return `${dobInEthiopian[0]}-${dobInEthiopian[1]}-${dobInEthiopian[2]}`;
    } else return '';
}

const MemberForm = ({ data, handleBasicInformation, handleCancel, nextStep }) => {

    const [formData, setFormData] = useState({
        id: "",
        fullName: "",
        age: "",
        dateOfBirth: "",
        gender: "",
        relationship: "",
        profession: "",
        isHouseholdHead: false
    })

    useEffect(() => {
        if (data) {
            setFormData({
                ...formData,
                ...data
            })
        }
    }, [data])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleAgeChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
            dateOfBirth: calculateDateOfBirth(e.target.value)
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        handleBasicInformation(formData)
        nextStep()
    }

    const classes = useStyles();
    return (
        <form className={classes.form} autoComplete="off" onSubmit={handleSubmit}>
            <DialogContent style={{ height: "350px" }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            onChange={handleChange}
                            required
                            id="fullName"
                            name="fullName"
                            label="Full Name"
                            value={formData.fullName}
                            variant='standard'
                            helperText="Must include First name, Father name and G.father name"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            aria-readonly={true}
                            inputProps={{
                                readOnly: formData.id ? true : false
                            }}
                            variant={formData.id ? 'filled' : 'standard'}
                            onChange={handleAgeChange}
                            type="number"
                            id="age"
                            name="age"
                            label="Age"
                            value={formData.age}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <DatePicker required id="dateOfBirth" name="dateOfBirth" placeholder="YYYY-MM-DD" label="Date of Birth" materialUi onChange={handleChange} value={formData.dateOfBirth} maxDate={0} />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel id="genderLabel">Gender</InputLabel>
                            <Select
                                labelId="genderLabel"
                                id="gender"
                                name="gender"
                                required
                                value={formData.gender}
                                variant='standard'
                                placeholder="Gender"
                                onChange={handleChange}
                            >
                                {genderOptions.map((gender, index) => (
                                    <MenuItem key={index} value={gender}>{gender}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl variant={!formData.isHouseholdHead ? "standard" : "filled"} fullWidth>
                            <InputLabel id="genderLabel">Relationship</InputLabel>
                            <Select
                                readOnly={formData.isHouseholdHead ? true : false}
                                labelId="relationshipLabel"
                                id="relationship"
                                name="relationship"
                                value={formData.isHouseholdHead ? relationshipOptions[0] : formData.relationship}
                                onChange={handleChange}
                            >
                                {relationshipOptions.map((relationship, index) => (
                                    <MenuItem key={index} value={relationship}>{relationship}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel id="professionLabel">Profession</InputLabel>
                            <Select
                                labelId="professionLabel"
                                id="profession"
                                name="profession"
                                value={formData.profession}
                                onChange={handleChange}
                            >
                                {professionOptions.map((profession, index) => (
                                    <MenuItem key={index} value={profession}>{profession}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            className={classes.TextField}
                            onChange={handleChange}
                            id="Household.address"
                            multiline
                            minRows="3"
                            InputProps={{
                                readOnly: formData.isHouseholdHead ? false : true
                            }}
                            variant={!formData.isHouseholdHead ? "filled" : "standard"}
                            name="Household.address"
                            helperText="eg. Phone No; House No; ..."
                            label="Contact Information"
                            value={formData['Household.address']}
                            fullWidth
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

export default MemberForm;

