import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import Close from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import AutocompleteFormControl from '../../AdministrativeDivision/components/AutocompleteFormControl';
import { toEthiopian } from 'ethiopian-date';
import { channels, genderOptions, relationshipOptions, professionOptions } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        top: "10%",
        left: `calc(50% - 200px)`,
        width: 500,
        height: 'auto',
        border: '1px solid #999',
        backgroundColor: "#ecf0f5",
        borderRadius: "5px",
        '& h6': {
            padding: "12px",
            display: "inline-block"
        }
    },
    formHeader: {
        backgroundColor: "#e3e3e3",
        '& svg': {
            verticalAlign: "bottom",
            marginRight: "5px"
        }
    },
    TextField: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginRight: "3px",
        marginLeft: "3px",
        width: "22ch"
    },
    SelectField: {
        margin: "8px",
        width: "20ch",
    },
    AutocompleteField: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginRight: "3px",
        marginLeft: "3px",
        width: "22ch",
        display: "inline-block"
    },
    fullWidth: {
        width: "100%",
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    label: {
        color: theme.palette.text.label
    }
}))

const HouseholdHead = (props) => {
    const classes = useStyles();
    return (
        <Typography className={classes.formHeader} display="inline" variant="subtitle2">
            <AccountBoxIcon />
            {props.cbhi}
        </Typography>
    )
}

const calculateDateOfBirth = (age) => {
    if (age) {
        const currentDate = new Date().getTime();
        const ageInMilliseconds = age * (1000 * 60 * 60 * 24 * 365.25);
        const dateOfBirth = new Date(currentDate - ageInMilliseconds);
        const dobInEthiopian = toEthiopian(dateOfBirth.getFullYear(), dateOfBirth.getMonth() + 1, dateOfBirth.getDate());
        return `${dobInEthiopian[2]}/${dobInEthiopian[1]}/${dobInEthiopian[0]}`;
    } else return '';
}

const MemberForm = React.forwardRef((props, ref) => {

    const [member, setMember] = useState({
        id: null,
        fullName: "",
        age: "",
        dateOfBirth: "",
        gender: "",
        cbhiId: "",
        HouseholdId: props.householdId,
        householdCBHI: props.householdCBHI,
        'Household.AdministrativeDivisionId': null,
        relationship: props.parentId ? "" : relationshipOptions[0],
        profession: "",
        parentId: props.parentId,
        enrolledDate: ""
    })
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        if (props.memberId !== null)
            ipcRenderer.send(channels.LOAD_MEMBER, props.memberId)
    }, [props.memberId])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_MEMBER, (event, result) => {
            setMember(result);
            if (result['Household.AdministrativeDivisionId'])
                setSelectedOption({
                    id: result['Household.AdministrativeDivision.id'],
                    name: result['Household.AdministrativeDivision.name'],
                    level: result['Household.AdministrativeDivision.level']
                })
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_MEMBER);
        }
    }, [member])

    useEffect(() => {
        ipcRenderer.on(channels.MEMBER_SUCCESS, (event) => {
            props.reloadGrid();
            props.closeModal();
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.MEMBER_SUCCESS);
        }
    })

    const handleChange = (e) => {
        setMember({
            ...member,
            [e.target.name]: e.target.value
        })
    }

    const handleAgeChange = (e) => {
        setMember({
            ...member,
            [e.target.name]: e.target.value,
            dateOfBirth: calculateDateOfBirth(e.target.value)
        })
    }

    const handleAdministrativeDivisionChange = (newSelectedOption) => {
        setMember({
            ...member,
            AdministrativeDivisionId: newSelectedOption ? newSelectedOption.id : null
        })
        setSelectedOption(newSelectedOption);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (member.id === null)
            ipcRenderer.send(channels.CREATE_MEMBER, member);
        else
            ipcRenderer.send(channels.UPDATE_MEMBER, member);
    }

    const classes = useStyles();
    return (
        <Box className={classes.root}>
            <Box display="flex">
                <Box flexGrow={1}>
                    <Typography component="h6" variant="h6">
                        {member.id ? "Update" : "Add"} {member.parentId ? "Beneficiary" : "Member"}
                    </Typography>
                    {member.parentId && <HouseholdHead cbhi={props.householdCBHI} />}
                </Box>
                <Box p={0}>
                    <IconButton onClick={props.closeModal}>
                        <Close />
                    </IconButton>
                </Box>
            </Box>
            <Divider />
            <Box display="flex" py={1} px={2}>
                <form autoComplete="off" onSubmit={handleSubmit}>
                    <TextField className={classes.fullWidth} onChange={handleChange} required id="fullName" name="fullName" label="Full Name" value={member.fullName} />
                    <TextField
                        aria-readonly={true}
                        inputProps={{
                            readOnly: member.id ? true : false
                        }}
                        variant={member.id ? 'filled' : 'standard'}
                        className={classes.TextField}
                        onChange={handleAgeChange}
                        type="number" id="age" name="age" label="Age" value={member.age} />
                    <TextField className={classes.TextField} onChange={handleChange} required type="text" placeholder="DD/MM/YYYY" helperText="eg. 25/02/1970" id="dateOfBirth" name="dateOfBirth" label="Date of Birth" value={member.dateOfBirth} />
                    <FormControl className={classes.SelectField}>
                        <InputLabel id="genderLabel">Gender</InputLabel>
                        <Select
                            labelId="genderLabel"
                            id="gender"
                            name="gender"
                            required
                            value={member.gender}
                            placeholder="Gender"
                            onChange={handleChange}
                        >
                            {genderOptions.map((gender, index) => (
                                <MenuItem key={index} value={gender}>{gender}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <AutocompleteFormControl classes={classes.AutocompleteField} handleChange={handleAdministrativeDivisionChange} selectedOption={selectedOption} />
                    <TextField className={classes.fullWidth} onChange={handleChange} required id="cbhiId" name="cbhiId" placeholder="00/00/00/P-000/00" helperText="eg. 01/01/02/P-001234/00" label="CBHI Id" value={member.cbhiId} />
                    <FormControl variant={member.parentId ? "standard" : "filled"} className={classes.SelectField}>
                        <InputLabel id="genderLabel">Relationship</InputLabel>
                        <Select
                            readOnly={member.parentId ? false : true}
                            labelId="relationshipLabel"
                            id="relationship"
                            name="relationship"
                            value={member.parentId ? member.relationship : relationshipOptions[0]}
                            onChange={handleChange}
                        >
                            {relationshipOptions.map((relationship, index) => (
                                <MenuItem key={index} value={relationship}>{relationship}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl className={classes.SelectField}>
                        <InputLabel id="professionLabel">Profession</InputLabel>
                        <Select
                            labelId="professionLabel"
                            id="profession"
                            name="profession"
                            value={member.profession}
                            onChange={handleChange}
                        >
                            {professionOptions.map((profession, index) => (
                                <MenuItem key={index} value={profession}>{profession}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField className={classes.TextField} onChange={handleChange} required type="text" placeholder="DD/MM/YYYY" helperText="eg. 16/09/2008" id="enrolledDate" name="enrolledDate" label="Enrollment Date" value={member.enrolledDate} />
                    <Divider />
                    <Box flexDirection="row-reverse" mt={2}>
                        <Button type="submit" variant="contained">Save</Button>
                    </Box>
                </form>
            </Box>
        </Box>
    );
});

export default MemberForm;

