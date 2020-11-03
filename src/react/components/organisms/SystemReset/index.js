import React from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ErrorIcon from '@material-ui/icons/Error';
import RestoreFromTrashIcon from '@material-ui/icons/RestoreFromTrash';
import { channels } from '../../../../shared/constants';
import { makeStyles } from '@material-ui/core/styles';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => (
    {
        root: {
            padding: "10px",
            "& p": {
                margin: "5px 0"
            },
            "& svg": {
                verticalAlign: "middle",
                marginTop: "-2px",
            }
        }
    }
))

const SystemReset = () => {
    const classes = useStyles();

    const handleBackup = () => {
        ipcRenderer.send(channels.SYSTEM_RESET);
    }

    return (
        <Paper elevation={2} className={classes.root}>
            <Typography variant="h6" color="error"><ErrorIcon /> System Reset</Typography>
            <Typography variant="body2" color="error"><b>Note:</b> This will remove all your data from the system.</Typography>
            <Box display="flex" flexDirection="row-reverse" mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RestoreFromTrashIcon />}
                    onClick={handleBackup}
                >
                    Reset System
        </Button>
            </Box>
        </Paper>
    )
}

export default SystemReset;

