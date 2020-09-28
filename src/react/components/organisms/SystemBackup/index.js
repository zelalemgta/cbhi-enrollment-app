import React from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
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

const SystemBackup = () => {
    const classes = useStyles();

    const handleBackup = () => {
        ipcRenderer.send(channels.SYSTEM_BACKUP);
    }

    return (
        <Paper elevation={2} className={classes.root}>
            <Typography variant="h6">System Backup</Typography>
            <Typography variant="body2">Please save the file in a safe place. This file will be used to restore all enrollment data
        during system crushes/malfunctions</Typography>
            <Box display="flex" flexDirection="row-reverse" mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SettingsBackupRestoreIcon />}
                    onClick={handleBackup}
                >
                    Backup
        </Button>
            </Box>
        </Paper>
    )
}

export default SystemBackup;

