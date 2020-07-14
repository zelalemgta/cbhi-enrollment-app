import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/SaveOutlined';
import { channels } from '../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
            width: '25ch'
        },
        '& label': {
            color: theme.palette.text.label
        },
        '& button': {
            width: '20ch',
            marginTop: '20px'
        }
    },
}));

const GeneralSettings = () => {
    const classes = useStyles();

    const [profile, setProfile] = useState({
        id: null,
        zoneName: "",
        woredaName: "",
        eligibleHouseholds: 0,
        contributionAmount: 0,
        registrationFee: 0
    });

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_PROFILE);
    }, [])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_PROFILE, (event, result) => {
            if (result)
                setProfile(result);
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_PROFILE);
        }
    }, [profile]);

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.id]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        if (profile.id === null)
            ipcRenderer.send(channels.CREATE_PROFILE, profile);
        else
            ipcRenderer.send(channels.UPDATE_PROFILE, profile);
        e.preventDefault();
    }

    return (
        <form className={classes.root} noValidate autoComplete="off" onSubmit={handleSubmit}>
            <Typography variant="h6">Basic Information</Typography>
            <TextField required id="zoneName" label="Zone Name" onChange={handleChange} value={profile.zoneName} />
            <TextField required id="woredaName" label="Woreda Name" onChange={handleChange} value={profile.woredaName} />
            <TextField required type="number" id="eligibleHouseholds" label="Eligible Households" onChange={handleChange} value={profile.eligibleHouseholds} />
            <Typography variant="h6">Woreda Member Contribution</Typography>
            <TextField required type="number" id="contributionAmount" label="Contribution Amount (ETB)" onChange={handleChange} value={profile.contributionAmount} />
            <TextField required type="number" id="registrationFee" label="Registration Fee (ETB)" onChange={handleChange} value={profile.registrationFee} />
            <br />
            <Button
                type="submit"
                variant="contained"
                color="secondary"
                className={classes.button}
                startIcon={<SaveIcon />}
            >
                Save
            </Button>
        </form>
    );
}

export default GeneralSettings;