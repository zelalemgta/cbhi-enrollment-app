import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/SaveOutlined';
import InputAdornment from '@material-ui/core/InputAdornment';
import InfoIcon from '@material-ui/icons/Info';
import LockIcon from '@material-ui/icons/Lock';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
            width: '30ch'
        },
        '& label': {
            color: theme.palette.text.label
        },
        '& button': {
            minWidth: '20ch',
            marginTop: '20px'
        },
        "& svg": {
            verticalAlign: "middle",
            marginTop: "-4px",
        }
    },
}));

const GeneralSettings = () => {
    const classes = useStyles();

    const [profile, setProfile] = useState({
        id: "",
        zoneName: "",
        woredaName: "",
        contributionAmount: 0,
        registrationFee: 0,
        additionalBeneficiaryFee: 0,
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_PROFILE);
    }, [])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_PROFILE, (event, result) => {
            if (result)
                setProfile({ ...result, newPassword: result.password, confirmPassword: result.password });
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

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (profile.id === null)
            ipcRenderer.send(channels.CREATE_PROFILE, { ...profile, password: profile.newPassword });
        else
            ipcRenderer.send(channels.UPDATE_PROFILE, { ...profile, password: profile.newPassword });
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <form className={classes.root} autoComplete="off" onSubmit={handleSubmit}>
                    <Typography variant="h6"><InfoIcon />  Scheme Information</Typography>
                    <TextField id="zoneName" label="Zone/Subcity Name" onChange={handleChange} value={profile.zoneName} />
                    <TextField required id="woredaName" label="Scheme Name" onChange={handleChange} value={profile.woredaName} />
                    {/*
            ************** Removed temporarely until we start to generate reports based on this ****************
            <Typography variant="h6">Scheme Member Contribution</Typography>
            <TextField type="number" id="contributionAmount" label="Contribution Amount (ETB)" onChange={handleChange} value={profile.contributionAmount} />
            <TextField type="number" id="registrationFee" label="Registration Fee (ETB)" onChange={handleChange} value={profile.registrationFee} />
            <TextField type="number" id="additionalBeneficiaryFee" label="Additional Beneficiary Fee (ETB)" onChange={handleChange} value={profile.additionalBeneficiaryFee} />
             */}
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
            </Grid>
            <Grid item xs={6}>
                <form className={classes.root} autoComplete="off" onSubmit={handleChangePassword}>
                    <Typography variant="h6"><LockIcon />  Account Protection</Typography>
                    <TextField
                        id="newPassword"
                        label="Current Password"
                        onChange={handleChange}
                        value={profile.newPassword}
                        type='password'
                        placeholder='*******************'
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <VpnKeyIcon color='disabled' />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        error={profile.newPassword !== profile.confirmPassword}
                        helperText={profile.newPassword !== profile.confirmPassword && "Password doesn't match!"}
                        id="confirmPassword"
                        label="Confirm Password"
                        onChange={handleChange}
                        value={profile.confirmPassword}
                        type='password'
                        placeholder='*******************'
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <VpnKeyIcon color='disabled' />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <br />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={profile.newPassword !== profile.confirmPassword}
                        //className={classes.button}
                        startIcon={<VerifiedUserIcon />}
                    >
                        Change Password
                    </Button>
                </form>
            </Grid>
        </Grid>

    );
}

export default GeneralSettings;