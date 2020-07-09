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
        top: "15%",
        left: `calc(50% - 200px)`,
        width: 500,
        height: 500,
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

const MemberForm = React.forwardRef((props, ref) => {
    const classes = useStyles();
    return (
        <Box className={classes.root}>
            <Box display="flex">
                <Box flexGrow={1}>
                    <Typography component="h6" variant="h6">
                        Add New Member
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
                    <TextField className={classes.fullWidth} required id="fullName" label="Full Name" />
                    <TextField className={classes.TextField} required type="number" id="age" label="Age" />
                    <TextField className={classes.TextField} required type="text" placeholder="MM/DD/YYYY" helperText="02/25/1970" id="dob" label="Date of Birth" />
                    <TextField className={classes.fullWidth} required id="cbhi" placeholder="00/00/00/P-000/00" helperText="01/01/02/P-001234/00" label="CBHI Id" />
                    <TextField className={classes.TextField} type="number" id="kebele" label="Kebele" />
                    <TextField className={classes.TextField} type="number" id="gote" label="Gote" />
                    <TextField className={classes.TextField} required type="text" placeholder="MM/DD/YYYY" helperText="04/15/2008" id="enrollmentDate" label="Enrollment Date" />
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

