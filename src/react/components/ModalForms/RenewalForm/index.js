import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        top: "12%",
        left: `calc(50% - 200px)`,
        width: 500,
        height: 550,
        border: '1px solid #999',
        backgroundColor: "#ecf0f5",
        borderRadius: "5px",
        '& h6': {
            padding: "12px"
        }
    },
    TextField: {
        margin: theme.spacing(1),
        width: "20ch"
    },
    fullWidth: {
        width: "100%",
        marginBottom: theme.spacing(1),
    },
    label: {
        color: theme.palette.text.label
    }

}))

const RenewalForm = React.forwardRef((props, ref) => {
    const classes = useStyles();
    return (
        <Box className={classes.root}>
            <Box display="flex">
                <Box flexGrow={1}>
                    <Typography component="h6" variant="h6">
                        Renew Membership (Tahesas 2012 - Hidar 2013)
                    </Typography>
                </Box>
                <Box p={0}>
                    <IconButton onClick={props.closeModal}>
                        <Close />
                    </IconButton>
                </Box>
            </Box>
            <Divider />
            <Box display="flex" p={2}>
                <form autoComplete="off" noValidate>
                    <TextField className={classes.fullWidth} required id="fullName" label="Full Name" value="Zelalem Gebeyehu Tessema" aria-readonly variant="filled" />
                    <TextField className={classes.fullWidth} required id="cbhiID" label="CBHI Id" fullWidth value="01/07/07/P-00007/00" aria-readonly variant="filled" />
                    <Divider variant="middle" style={{ margin: 10 }} />
                    <TextField className={classes.fullWidth} required id="recieptNo" label="Reciept Number" />
                    <TextField className={classes.TextField} required id="registration" type="number" label="Registration Fee (ETB)" />
                    <TextField className={classes.TextField} required id="premium" type="number" label="Contribution Amount (ETB)" />
                    <TextField className={classes.TextField} required id="penaltiy" type="number" label="Penaltiy (ETB)" />
                    <TextField className={classes.TextField} required id="other" type="number" label="Other Fees (ETB)" />
                    <TextField className={classes.TextField} required type="text" placeholder="MM/DD/YYYY" helperText="04/15/2008" id="registrationDate" label="Renewed Date" />
                    <Box flexDirection="row-reverse" mt={2}>
                        <Button type="submit" variant="contained">Renew Membership</Button>
                    </Box>
                </form>
            </Box>
        </Box>
    );
});

export default RenewalForm;

