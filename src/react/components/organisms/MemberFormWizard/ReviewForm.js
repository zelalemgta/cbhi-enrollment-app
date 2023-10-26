import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress'
import { toGregorian } from 'ethiopian-date';

// const useStyles = makeStyles((theme) => ({
//     // table: {
//     //     '& .MuiTableCell-root': {
//     //         fontSize: "13px",
//     //         whiteSpace: 'nowrap'
//     //     }
//     // },
//     // form: {
//     //     maxHeight: "445px"
//     // },
//     // dialogTitle: {
//     //     paddingBottom: "0px"
//     // },
//     // textField: {
//     //     margin: "10px 0px"
//     // }
// }))

const calculateAge = (dateOfBirth) => {
    var diff = new Date().getTime() - new Date(dateOfBirth).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const ReviewForm = ({ data, handleSubmit, handleCancel, loading, goToStep }) => {
    const birthDateGregorian = data.dateOfBirth ? toGregorian(data.dateOfBirth.split("-").map(date => parseInt(date))).join("-") : ""
    return (
        <>
            <DialogContent style={{ height: "350px", maxWidth: "470px" }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Box mb={2} fontSize={"0.85rem"}>
                            <Box><b>Full Name:</b></Box>
                            <span>{data.fullName}</span>
                        </Box>
                        <Box mb={2} fontSize={"0.85rem"}><Box><b>Gender</b></Box><span>{data.gender}</span></Box>
                        <Box mb={0} fontSize={"0.85rem"}><Box><b>Age</b></Box><span>{birthDateGregorian && calculateAge(birthDateGregorian)}</span></Box>

                    </Grid>
                    <Grid item xs={6}>
                        <Box mb={2} fontSize={"0.85rem"}><Box><b>Relationship</b></Box><span>{data.relationship}</span></Box>
                        <Box mb={2} fontSize={"0.85rem"}><Box><b>Profession</b></Box> <span>{data.profession}</span></Box>
                        <Box mb={0} fontSize={"0.85rem"}><Box><b>Contact Information</b></Box> <span>{data['Household.address']}</span></Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box pb={1} my={2} style={{ borderBottom: "1px solid #e3e3e3" }} fontSize={"0.9rem"} fontWeight="fontWeightBold">[ Community Based Health Insurance Information ]</Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box mb={2} fontSize={"0.85rem"}><Box><b>CBHI ID</b></Box> <span>{data['Household.cbhiId']}/{data.cbhiId}</span></Box>
                        <Box mb={0} fontSize={"0.85rem"}><Box><b>Household Location</b></Box> <span>{data.selectedAdministrativeDivision}</span></Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box mb={2} fontSize={"0.85rem"}><Box><b>Enrollment Date</b></Box> <span>{data.enrolledDate}</span></Box>
                        <Box mb={0} fontSize={"0.85rem"}><Box><b>CBHI ID Card Issued?</b></Box> <span>{data['Household.idCardIssued'] ? "Yes" : "No"}</span></Box>
                    </Grid>

                    <Grid item xs={12}>

                    </Grid>
                </Grid>
            </DialogContent>
            <Divider style={{ margin: "10px 0px" }} />
            <DialogActions >
                <Button onClick={handleCancel} disabled={loading} color="primary" size="small" autoFocus>
                    Cancel
                </Button>
                <Button
                    onClick={() => goToStep(2)}
                    variant='outlined'
                    color="primary"
                    size="small"
                    disabled={loading}
                    startIcon={<ArrowBackIcon />}
                >
                    Previous
                </Button>
                <Button
                    variant="contained"
                    type="button"
                    color="secondary"
                    disabled={loading}
                    size="small"
                    onClick={handleSubmit}
                    startIcon={loading ? <CircularProgress color="inherit" size={18} thickness={5} /> : <SaveIcon />}
                >
                    {data.id ? "Update" : "Create"}
                </Button>
            </DialogActions>
        </>
    )
}

export default ReviewForm