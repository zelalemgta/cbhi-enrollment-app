import React from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import PublishIcon from '@material-ui/icons/Publish';
import { channels } from '../../../../shared/constants';
import { makeStyles } from '@material-ui/core/styles';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => (
    {
        root: {
            padding: "10px",
            "& p": {
                margin: "5px 0"
            }
        }
    }
))

const ImportEnrollmentData = () => {

    const classes = useStyles();

    const handleUpload = () => {
        ipcRenderer.send(channels.IMPORT_ENROLLMENT);
    }

    return (
        <Paper elevation={2} className={classes.root}>
            <Typography variant="h6">Import Enrollment Data</Typography>
            <Typography variant="body2">Please make sure CBHI members/beneficiaries data is structured according to the provided format. The system will
            <Typography variant="inherit" color="error"><b> raise error</b></Typography> if failed to match the template.</Typography>
            <Box display="flex" flexDirection="row-reverse" mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PublishIcon />}
                    onClick={handleUpload}
                >
                    Upload Enrollment Data
        </Button>
            </Box>
        </Paper>
    )
}

export default ImportEnrollmentData;

