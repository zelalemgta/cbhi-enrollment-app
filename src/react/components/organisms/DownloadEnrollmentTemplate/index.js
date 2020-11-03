import React from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import GetAppIcon from '@material-ui/icons/GetApp';
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

const DownloadEnrollmentTemplate = () => {
    const classes = useStyles();

    const handleDownload = () => {
        ipcRenderer.send(channels.DOWNLOAD_ENROLLMENT_TEMPLATE);
    }

    return (
        <Paper elevation={2} className={classes.root}>
            <Typography variant="h6">Enrollment Data Format</Typography>
            <Typography variant="body2">The Enrollment template here will serve as standard format for importing
             members & beneficiaries data from Excel to this system.</Typography>
            <Box display="flex" flexDirection="row-reverse" mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<GetAppIcon />}
                    onClick={handleDownload}
                >
                    Download Enrollment Template
        </Button>
            </Box>
        </Paper>
    )
}

export default DownloadEnrollmentTemplate;

