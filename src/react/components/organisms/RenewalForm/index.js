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
import DatePicker from '../../atoms/DatePicker';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        top: "7%",
        left: `calc(50% - 200px)`,
        width: 500,
        height: 'auto',
        border: '1px solid #999',
        backgroundColor: "#ecf0f5",
        borderRadius: "5px",
        '& h6': {
            padding: "12px"
        },
        '& input': {
            height: "1em"
        },
        '& #isPaying': {
            height: "1.9em"
        }
    },
    TextField: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        marginRight: "3px",
        marginLeft: "3px",
        width: "14rem",

    },
    fullWidth: {
        width: "100%",
        marginBottom: "16px"
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
        minRegDate: null,
        maxRegDate: null,
        contributionAmount: "",
        registrationFee: "",
        additionalBeneficiaryFee: "",
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
            contributionAmount: event.target.checked && 0,
            registrationFee: event.target.checked && 0,
            additionalBeneficiaryFee: event.target.checked && 0,
            otherFees: event.target.checked && 0,
            receiptNo: event.target.checked && "",
            [event.target.name]: event.target.checked
        })
    }

    const handleChange = (e) => {
        setMemberRenewal({
            ...memberRenewal,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        ipcRenderer.send(channels.CREATE_MEMBER_RENEWAL, memberRenewal);
    }

    const handleClose = (e) => {
        e.preventDefault();
        ipcRenderer.removeAllListeners(channels.LOAD_MEMBER_RENEWAL);
        props.closeModal();
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
                    <IconButton onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Box>
            </Box>
            <Divider />
            <Box display="flex" p={2}>
                <form className={classes.fullWidth} onSubmit={handleSubmit} autoComplete="off">
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
                    <Divider variant="middle" style={{ marginBottom: 10 }} />
                    <Grid component="div" spacing={1} container alignItems="center" justify="center">
                        <Grid item>Indigent</Grid>
                        <Grid item>
                            <Switch
                                id="isPaying"
                                name="isPaying"
                                checked={memberRenewal.isPaying}
                                onChange={handleStatusChange}
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                        </Grid>
                        <Grid item>Paying</Grid>
                    </Grid>

                    <Box hidden={!memberRenewal.isPaying}>
                        <TextField className={classes.fullWidth} required={memberRenewal.isPaying} id="receiptNo" name="receiptNo" onChange={handleChange} value={memberRenewal.receiptNo} label="Reciept Number" />
                        <TextField className={classes.TextField} id="registrationFee" name="registrationFee" onChange={handleChange} value={memberRenewal.registrationFee} type="number" label="Registration Fee (ETB)" />
                        <TextField className={classes.TextField} required={memberRenewal.isPaying} id="contributionAmount" name="contributionAmount" onChange={handleChange} value={memberRenewal.contributionAmount} type="number" label="Contribution Amount (ETB)" />
                        <TextField className={classes.TextField} id="additionalBeneficiaryFee" name="additionalBeneficiaryFee" onChange={handleChange} value={memberRenewal.additionalBeneficiaryFee} type="number" label="Add* Beneficiary Fee (ETB)" />
                        <TextField className={classes.TextField} id="otherFees" name="otherFees" onChange={handleChange} value={memberRenewal.otherFees} type="number" label="Other Fees (ETB)" />
                    </Box>
                    <DatePicker required id="receiptDate" name="receiptDate"
                        placeholder="YYYY-MM-DD"
                        label="Renewed Date"
                        materialUi
                        onChange={handleChange}
                        value={memberRenewal.receiptDate}
                        minDate={memberRenewal.minRegDate}
                        maxDate={memberRenewal.maxRegDate}
                    />
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

