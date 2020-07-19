import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { channels } from '../../../../shared/constants';

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

    const [memberRenewal, setMemberRenewal] = useState({
        id: null,
        HouseholdId: null,
        householdHead: "",
        EnrollmentPeriodId: null,
        enrollmentPeriod: "",
        contributionAmount: "",
        registrationFee: "",
        penalty: "",
        otherFees: "",
        receiptNo: "",
        receiptDate: "",
        isPaying: true,
        cbhiId: ""
    });

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_MEMBER_RENEWAL, props.householdId);
    }, [props.householdId])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_MEMBER_RENEWAL, (event, result) => {
            setMemberRenewal({
                ...memberRenewal,
                ...result
            });
            console.log(result);
        })
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_MEMBER_RENEWAL);
        }
    }, [memberRenewal]);

    useEffect(() => {
        ipcRenderer.on(channels.MEMBER_RENEWAL_SUCCESS, (event) => {
            props.reloadGrid();
            props.closeModal();
        })
        return () => {
            ipcRenderer.removeAllListeners(channels.MEMBER_RENEWAL_SUCCESS);
        }
    })

    const handleStatusChange = (event) => {
        setMemberRenewal({
            ...memberRenewal,
            [event.target.name]: event.target.checked
        })
    }

    const handleChange = (e) => {
        setMemberRenewal({
            ...memberRenewal,
            [e.target.name]: e.target.value
        });
        console.log(memberRenewal)
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        ipcRenderer.send(channels.CREATE_MEMBER_RENEWAL, memberRenewal);
    }

    const classes = useStyles();
    return (
        <Box className={classes.root}>
            <Box display="flex">
                <Box flexGrow={1}>
                    <Typography component="h6" variant="h6">
                        Renew Membership ({memberRenewal.enrollmentPeriod})
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
                <form className={classes.fullWidth} onSubmit={handleSubmit} autoComplete="off" noValidate>
                    <TextField className={classes.fullWidth}
                        id="householdHead"
                        name="householdHead"
                        label="Full Name"
                        value={memberRenewal.householdHead}
                        aria-readonly={true}
                        inputProps={{
                            readOnly: true
                        }}
                        variant="filled" />
                    <TextField className={classes.fullWidth}
                        required
                        id="cbhiID"
                        name="cbhiId"
                        onChange={handleChange}
                        label="CBHI Id"
                        value={memberRenewal.cbhiId}
                        variant="outlined" />
                    <Divider variant="middle" style={{ margin: 10 }} />
                    <Grid component="div" spacing={1} container alignItems="center" justify="center">
                        <Grid item>Indigent</Grid>
                        <Grid item>
                            <Switch
                                id="isPaying"
                                name="isPaying"
                                checked={memberRenewal.isPaying}
                                onChange={handleStatusChange}
                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                            />
                        </Grid>
                        <Grid item>Paying</Grid>
                    </Grid>

                    <Box hidden={!memberRenewal.isPaying}>
                        <TextField className={classes.fullWidth} required id="receiptNo" name="receiptNo" onChange={handleChange} value={memberRenewal.receiptNo} label="Reciept Number" />
                        <TextField className={classes.TextField} required id="registrationFee" name="registrationFee" onChange={handleChange} value={memberRenewal.registrationFee} type="number" label="Registration Fee (ETB)" />
                        <TextField className={classes.TextField} required id="contributionAmount" name="contributionAmount" onChange={handleChange} value={memberRenewal.contributionAmount} type="number" label="Contribution Amount (ETB)" />
                        <TextField className={classes.TextField} required id="penalty" name="penalty" onChange={handleChange} value={memberRenewal.penalty} type="number" label="Penaltiy (ETB)" />
                        <TextField className={classes.TextField} required id="otherFees" name="otherFees" onChange={handleChange} value={memberRenewal.otherFees} type="number" label="Other Fees (ETB)" />
                    </Box>
                    <TextField className={classes.TextField} required type="text"
                        placeholder="MM/DD/YYYY"
                        helperText="04/15/2008"
                        id="receiptDate"
                        name="receiptDate"
                        value={memberRenewal.receiptDate}
                        onChange={handleChange}
                        label="Renewed Date" />
                    <Divider />
                    <Box flexDirection="row-reverse" mt={2}>
                        <Button type="submit" variant="contained">Renew Membership</Button>
                    </Box>
                </form>
            </Box>
        </Box>
    );
});

export default RenewalForm;

