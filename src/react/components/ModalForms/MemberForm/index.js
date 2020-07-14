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
import { channels, genderOptions, relationshipOptions, professionOptions } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        top: "12%",
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
        margin: theme.spacing(1),
        width: "20ch"
    },
    SelectField: {
        margin: "8px",
        width: "20ch"
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

const MemberForm = React.forwardRef((props, ref) => {

    const [member, setMember] = useState({
        id: null,
        fullName: "",
        dateOfBirth: "",
        gender: "",
        cbhiId: "",
        administrativeDivisionId: null,
        relationship: props.parentId ? "" : relationshipOptions[0],
        profession: "",
        parentId: props.parentId,
        enrolledDate: ""
    })

    useEffect(() => {
        if (props.memberId !== null)
            ipcRenderer.send(channels.LOAD_MEMBER, props.memberId)
    }, [props.memberId])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_MEMBER, (event, result) => {
            setMember(result);
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
                    {(member.parentId && !member.id) && <HouseholdHead cbhi={props.parentCBHI} />}
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
                    <TextField className={classes.TextField} onChange={handleChange} required type="number" id="age" name="age" label="Age" />
                    <TextField className={classes.TextField} onChange={handleChange} required type="text" placeholder="MM/DD/YYYY" helperText="02/25/1970" id="dateOfBirth" name="dateOfBirth" label="Date of Birth" value={member.dateOfBirth} />
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
                    <TextField className={classes.TextField} type="number" id="kebele" name="kebele" label="Kebele/Gote" />
                    <TextField className={classes.fullWidth} onChange={handleChange} required id="cbhiId" name="cbhiId" placeholder="00/00/00/P-000/00" helperText="01/01/02/P-001234/00" label="CBHI Id" value={member.cbhiId} />
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
                    <TextField className={classes.TextField} onChange={handleChange} required type="text" placeholder="MM/DD/YYYY" helperText="04/15/2008" id="enrolledDate" name="enrolledDate" label="Enrollment Date" value={member.enrolledDate} />
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

