import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import HouseholdPaymentDetail from '../HouseholdPaymentDetail';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        position: "absolute",
        top: "12%",
        left: `calc(50% - 400px)`,
        paddingBottom: 10,
        width: 850,
        height: "auto",
        border: '1px solid #999',
        backgroundColor: "#fff",
        borderRadius: "5px",
        '& h6': {
            padding: "12px 0px"
        }
    },
    summary: {
        '& .MuiTypography-body1': {
            fontSize: "13px",
        },
        '& .MuiTypography-body2': {
            width: 150,
            fontSize: "13px",
            fontWeight: "bold"
        }
    }
}))

const AdditionalPaymentForm = React.forwardRef((props, ref) => {

    const [householdPayment, setHouseholdPayment] = useState({
        HouseholdId: null,
        householdHead: "",
        cbhiId: "",
        address: "",
        idCardIssued: false,
        enrolledDate: "",
        EnrollmentPeriodId: null,
        enrollmentPeriod: "",
        minPaymentDate: null,
        maxPaymentDate: null,
        isPaying: null,
        paymentRecords: []
    })

    useEffect(() => {
        ipcRenderer.send(channels.LOAD_HOUSEHOLD_PAYMENTS, props.householdId);
    }, [props.householdId])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_HOUSEHOLD_PAYMENTS, (event, result) => {
            setHouseholdPayment({
                ...householdPayment,
                ...result
            });
        })
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_HOUSEHOLD_PAYMENTS);
        }
    }, [householdPayment]);

    useEffect(() => {
        ipcRenderer.on(channels.MEMBER_RENEWAL_SUCCESS, (event) => {
            ipcRenderer.send(channels.LOAD_HOUSEHOLD_PAYMENTS, props.householdId);
            props.reloadGrid();
        })
        return () => {
            ipcRenderer.removeAllListeners(channels.MEMBER_RENEWAL_SUCCESS);
        }
    })

    const handleClose = () => {
        //e.preventDefault();
        ipcRenderer.removeAllListeners(channels.LOAD_HOUSEHOLD_PAYMENTS);
        props.closeModal();
    }

    const classes = useStyles();
    return (
        <Box px={2} className={classes.root}>
            <Box display="flex">
                <Box flexGrow={1}>
                    <Typography component="h6" variant="h6">
                        Update Household Payment ({householdPayment.enrollmentPeriod})
                    </Typography>
                </Box>
                <Box p={0}>
                    <IconButton onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Box>
            </Box>
            <Divider />
            <Grid container>
                <Grid item xs={6}>
                    <Box p={2}>
                        <Box className={classes.summary} display="flex">
                            <Typography variant='body2'>Full Name</Typography>
                            <Typography>{householdPayment.householdHead}</Typography>
                        </Box>
                        <Box mt={1} className={classes.summary} display="flex">
                            <Typography variant='body2'>CBHI ID</Typography>
                            <Typography>{householdPayment.cbhiId}</Typography>
                        </Box>
                        <Box mt={1} className={classes.summary} display="flex">
                            <Typography variant='body2'>Address</Typography>
                            <Typography>{householdPayment.address}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box p={2}>
                        <Box className={classes.summary} display="flex">
                            <Typography variant='body2'>Membership Type</Typography>
                            <Typography>{householdPayment.isPaying ? "Paying" : "Indigent"}</Typography>
                        </Box>
                        <Box mt={1} className={classes.summary} display="flex">
                            <Typography variant='body2'>ID Card Issued</Typography>
                            <Typography>{householdPayment.idCardIssued ? "Yes" : "No"}</Typography>
                        </Box>
                        <Box mt={1} className={classes.summary} display="flex">
                            <Typography variant='body2'>Enrollment Date</Typography>
                            <Typography>{householdPayment.enrolledDate}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <HouseholdPaymentDetail
                        enrollmentPeriodId={householdPayment.EnrollmentPeriodId}
                        householdId={householdPayment.HouseholdId}
                        paymentRecords={householdPayment.paymentRecords}
                    />
                </Grid>
            </Grid>
        </Box>
    )
});

export default AdditionalPaymentForm;




{/* <Grid item xs={12}>
                        <TextField
                            className={classes.TextField}
                            id="householdHead"
                            name="householdHead"
                            label="Full Name"
                            value={additionalPayment.householdHead}
                            aria-readonly={true}
                            inputProps={{
                                readOnly: true
                            }}
                            variant="filled" />
                        <TextField
                            className={classes.TextField}
                            id="cbhiID"
                            name="cbhiId"
                            label="CBHI Id"
                            value={additionalPayment.cbhiId}
                            aria-readonly={true}
                            inputProps={{
                                readOnly: true
                            }}
                            variant="filled" />
                    </Grid> */}

//     <Grid item xs={6}>
//     <TextField className={classes.TextField} required={true} id="receiptNo" name="receiptNo" onChange={handleChange} value={additionalPayment.receiptNo} label="Reciept Number" />
//     <TextField className={classes.TextField} id="additionalBeneficiaryFee" name="additionalBeneficiaryFee" onChange={handleChange} value={additionalPayment.additionalBeneficiaryFee} type="number" label="Add* Beneficiary Fee (ETB)" />
//     <TextField className={classes.TextField} id="otherFees" name="otherFees" onChange={handleChange} value={additionalPayment.otherFees} type="number" label="Other Fees (ETB)" />
// </Grid>
// <Grid item xs={6}>
//     <TextField className={classes.TextField} id="additionalBeneficiaryFee" name="additionalBeneficiaryFee" onChange={handleChange} value={additionalPayment.additionalBeneficiaryFee} type="number" label="Add* Beneficiary Fee (ETB)" />
//     <TextField className={classes.TextField} id="otherFees" name="otherFees" onChange={handleChange} value={additionalPayment.otherFees} type="number" label="Other Fees (ETB)" />
//     <DatePicker required id="receiptDate" name="receiptDate"
//         placeholder="YYYY-MM-DD"
//         label="Payment Date *"
//         materialUi
//         onChange={handleChange}
//         value={additionalPayment.receiptDate}
//         minDate={additionalPayment.minPaymentDate}
//         maxDate={additionalPayment.maxPaymentDate}
//     />
// </Grid>
// <Grid item xs={12}>
//     <Box display="flex" flexDirection="row-reverse" bgcolor="#e3e3e3">
//         <Box my={2}>
//             <Button type="submit" color="secondary" variant="contained">Add Payment</Button>
//         </Box>
//     </Box>
// </Grid>