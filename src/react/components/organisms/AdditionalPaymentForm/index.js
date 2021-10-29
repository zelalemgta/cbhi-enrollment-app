import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import DatePicker from '../../atoms/DatePicker';
import HouseholdPaymentDetail from '../../molecules/HouseholdPaymentDetail';
import DialogWindow from '../../molecules/DialogWindow';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        top: "10%",
        left: `calc(50% - 300px)`,
        width: 750,
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
        },
        '& table': {
            backgroundColor: "rgb(0,0,0,0.09)"
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

const AdditionalPaymentForm = React.forwardRef((props, ref) => {

    const [additionalPayment, setAdditionalPayment] = useState({
        HouseholdId: null,
        householdHead: "",
        EnrollmentPeriodId: null,
        enrollmentPeriod: "",
        minPaymentDate: null,
        maxPaymentDate: null,
        isPaying: null,
        contributionAmount: null,
        registrationFee: null,
        additionalBeneficiaryFee: "",
        otherFees: "",
        receiptNo: "",
        receiptDate: "",
        cbhiId: "",
        totalPaid: {},
        isSubmitted: false
    })

    const [dialogState, setDialogState] = useState({
        open: false,
        title: "",
        message: ""
    });

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_HOUSEHOLD_PAYMENTS, props.householdId);
    }, [props.householdId])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_HOUSEHOLD_PAYMENTS, (event, result) => {
            setAdditionalPayment({
                ...additionalPayment,
                ...result
            });
        })
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_HOUSEHOLD_PAYMENTS);
        }
    }, [additionalPayment]);

    useEffect(() => {
        ipcRenderer.on(channels.MEMBER_RENEWAL_SUCCESS, (event) => {
            props.reloadGrid();
            props.closeModal();
        })
        return () => {
            ipcRenderer.removeAllListeners(channels.MEMBER_RENEWAL_SUCCESS);
        }
    })

    const handleChange = (e) => {
        e.target.value.startsWith("-") ||
            setAdditionalPayment({
                ...additionalPayment,
                [e.target.name]: e.target.value
            });
    }

    const handleSubmit = () => {
        if (additionalPayment.isSubmitted) return;
        setAdditionalPayment({
            ...additionalPayment,
            isSubmitted: true
        })
        ipcRenderer.send(channels.CREATE_MEMBER_RENEWAL, additionalPayment);
    }

    const handleClose = (e) => {
        e.preventDefault();
        ipcRenderer.removeAllListeners(channels.LOAD_HOUSEHOLD_PAYMENTS);
        props.closeModal();
    }

    const handleAdditionalPaymentConfirmation = (e) => {
        e.preventDefault();
        setDialogState({
            open: true,
            title: "Are you sure you want to add this payment for the selected household?",
            message: "Attention! Please verify the data against the household payment receipt. This action cannot be reversed!"
        })
    }

    const handleDialogClose = () => {
        setDialogState({
            open: false,
            title: "",
            message: "",
        });
    }


    const classes = useStyles();
    return (
        <Box className={classes.root}>
            <DialogWindow
                open={dialogState.open}
                title={dialogState.title}
                message={dialogState.message}
                recordId={dialogState.memberId}
                handleClose={handleDialogClose}
                handleAction={handleSubmit}
            />
            <Box display="flex">
                <Box flexGrow={1}>
                    <Typography component="h6" variant="h6">
                        Add New Payment ({additionalPayment.enrollmentPeriod})
                    </Typography>
                </Box>
                <Box p={0}>
                    <IconButton onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Box>
            </Box>
            <Divider />
            <Box p={2}>
                <Grid container>
                    <Grid item xs={8}>
                        <TextField className={classes.fullWidth}
                            id="householdHead"
                            name="householdHead"
                            label="Full Name"
                            value={additionalPayment.householdHead}
                            aria-readonly={true}
                            inputProps={{
                                readOnly: true
                            }}
                            variant="filled" />
                        <TextField className={classes.fullWidth}
                            required
                            id="cbhiID"
                            name="cbhiId"
                            label="CBHI Id"
                            value={additionalPayment.cbhiId}
                            aria-readonly={true}
                            inputProps={{
                                readOnly: true
                            }}
                            variant="filled" />
                        <Divider variant="middle" style={{ marginBottom: 10 }} />
                        <HouseholdPaymentDetail data={additionalPayment.totalPaid} />
                    </Grid>
                    <Grid item xs={4}>
                        <Box display="flex" p={2}>
                            <form className={classes.fullWidth} onSubmit={handleAdditionalPaymentConfirmation} autoComplete="off">
                                <Box>
                                    <TextField className={classes.fullWidth} required={true} id="receiptNo" name="receiptNo" onChange={handleChange} value={additionalPayment.receiptNo} label="Reciept Number" />
                                    <TextField className={classes.TextField} id="additionalBeneficiaryFee" name="additionalBeneficiaryFee" onChange={handleChange} value={additionalPayment.additionalBeneficiaryFee} type="number" label="Add* Beneficiary Fee (ETB)" />
                                    <TextField className={classes.TextField} id="otherFees" name="otherFees" onChange={handleChange} value={additionalPayment.otherFees} type="number" label="Other Fees (ETB)" />
                                </Box>
                                <DatePicker required id="receiptDate" name="receiptDate"
                                    placeholder="YYYY-MM-DD"
                                    label="Payment Date *"
                                    materialUi
                                    onChange={handleChange}
                                    value={additionalPayment.receiptDate}
                                    minDate={additionalPayment.minPaymentDate}
                                    maxDate={additionalPayment.maxPaymentDate}
                                />
                                <Divider />
                                <Box flexDirection="row-reverse" mt={4}>
                                    <Button type="submit" color="secondary" variant="contained">Add Payment</Button>
                                </Box>
                            </form>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
});

export default AdditionalPaymentForm;