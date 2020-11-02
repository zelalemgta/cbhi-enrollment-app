import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import DatePicker from '../../atoms/DatePicker';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import AutocompleteFormControl from '../AutocompleteFormControl';
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
    TextField: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginRight: "3px",
        marginLeft: "3px",
        width: "14rem"
    },
    SelectField: {
        margin: "8px",
        width: "13rem",
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
    householdCBHI: {
        width: "60%",
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    memberCBHI: {
        width: "30%",
        margin: theme.spacing(1),
        // marginBottom: theme.spacing(1),
    },
    label: {
        color: theme.palette.text.label
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

const MemberForm = React.forwardRef((props, ref) => {

    const [member, setMember] = useState({
        id: null,
        fullName: "",
        age: "",
        dateOfBirth: "",
        gender: "",
        cbhiId: "",
        'Household.id': "",
        'Household.cbhiId': "",
        'Household.AdministrativeDivisionId': null,
        'Household.address': "",
        relationship: "",
        profession: "",
        isHouseholdHead: false,
        enrolledDate: "",
        isSubmitted: false
    })
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        if (props.memberId !== null)
            ipcRenderer.send(channels.LOAD_MEMBER, props.memberId)
        else if (props.isNew) {
            setMember(memberState => ({
                ...memberState,
                relationship: relationshipOptions[0],
                isHouseholdHead: true
            }))
        }
        else {
            setMember(memberState => ({
                ...memberState,
                isHouseholdHead: false
            }))
        }
    }, [props.memberId, props.isNew])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_MEMBER, (event, result) => {
            if (props.isNew) {
                console.log("triggered")
                setMember({
                    ...member,
                    "Household.id": result['Household.id'],
                    "Household.cbhiId": result['Household.cbhiId'],
                    "Household.address": result['Household.address'] || ""
                })
            }
            else
                setMember({
                    ...result
                });
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
    }, [member, props.isNew])

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
            "Household.AdministrativeDivisionId": newSelectedOption ? newSelectedOption.id : null
        })
        setSelectedOption(newSelectedOption);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (member.isSubmitted) return;
        setMember({
            ...member,
            isSubmitted: true
        })
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
                        {member.id ? "Update" : "Add"} {member.isHouseholdHead ? "Member" : "Beneficiary"}
                    </Typography>
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
                    <DatePicker required id="dateOfBirth" name="dateOfBirth" placeholder="YYYY-MM-DD" label="Date of Birth" materialUi onChange={handleChange} value={member.dateOfBirth} maxDate={0} />
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
                    <AutocompleteFormControl
                        classes={classes.AutocompleteField}
                        handleChange={handleAdministrativeDivisionChange}
                        disabled={!member.isHouseholdHead}
                        required={member.isHouseholdHead ? true : false}
                        selectedOption={selectedOption}
                    />
                    <TextField
                        className={classes.householdCBHI}
                        onChange={handleChange}
                        required={member.isHouseholdHead ? true : false}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">/</InputAdornment>,
                            readOnly: member.isHouseholdHead ? false : true
                        }}
                        variant={!member.isHouseholdHead ? "filled" : "standard"}
                        id="Household.cbhiId"
                        name="Household.cbhiId"
                        placeholder="00/00/00/P-000/"
                        helperText="eg. 01/01/02/P-001234/"
                        label="Household CBHI Id"
                        value={member["Household.cbhiId"]}
                    />
                    <TextField
                        className={classes.memberCBHI}
                        onChange={handleChange}
                        required
                        id="cbhiId"
                        name="cbhiId"
                        placeholder="00"
                        helperText="eg. 01"
                        label="Member CBHI Id"
                        value={member.cbhiId}
                    />
                    <FormControl variant={!member.isHouseholdHead ? "standard" : "filled"} className={classes.SelectField}>
                        <InputLabel id="genderLabel">Relationship</InputLabel>
                        <Select
                            readOnly={member.isHouseholdHead ? true : false}
                            labelId="relationshipLabel"
                            id="relationship"
                            name="relationship"
                            value={member.isHouseholdHead ? relationshipOptions[0] : member.relationship}
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
                    <DatePicker required id="enrolledDate" name="enrolledDate" placeholder="YYYY-MM-DD" label="Enrollment Date" materialUi onChange={handleChange} value={member.enrolledDate} maxDate={0} />
                    <TextField
                        className={classes.TextField}
                        onChange={handleChange}
                        id="Household.address"
                        multiline
                        InputProps={{
                            readOnly: member.isHouseholdHead ? false : true
                        }}
                        variant={!member.isHouseholdHead ? "filled" : "standard"}
                        name="Household.address"
                        helperText="eg. Phone No; House No; ..."
                        label="Household Address"
                        value={member['Household.address']}
                    />
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

