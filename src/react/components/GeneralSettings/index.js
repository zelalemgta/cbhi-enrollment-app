import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
            width: '25ch'
        },
        '& label': {
            color: theme.palette.text.label
        }
    },
}));

const GeneralSettings = () => {
    const classes = useStyles();

    return (
        <form className={classes.root} noValidate autoComplete="off">
            <Typography variant="h6">Basic Information</Typography>
            <TextField required id="zoneName" label="Zone Name" />
            <TextField required id="woredaName" label="Woreda Name" />
            <TextField required type="number" id="woredaEligbleHH" label="Eligible Households" />
            <Typography variant="h6">Woreda Member Contribution</Typography>
            <TextField required type="number" id="woredaPremium" label="Contribution Amount (ETB)" />
            <TextField required type="number" id="woredaRegistrationFee" label="Registration Fee (ETB)" />
        </form>
    );
}

export default GeneralSettings;