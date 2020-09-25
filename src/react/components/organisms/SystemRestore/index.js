import React from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import RestoreIcon from '@material-ui/icons/Restore';
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

const SystemRestore = () => {

    const classes = useStyles();

    const handleRestore = () => {
        ipcRenderer.send(channels.SYSTEM_RESTORE);
    }

    return (
        <Paper elevation={2} className={classes.root}>
            <Typography variant="h6">System Restore</Typography>
            <Typography variant="body2">This will restore all enrollment data & settings to last stable state.
                    Please make sure you upload the latest backup file. </Typography> <Typography variant="body2" color="error"><b>Note:</b> This will remove all your existing data & should only be used during system failure.</Typography>
            <Box display="flex" flexDirection="row-reverse" mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RestoreIcon />}
                    onClick={handleRestore}
                >
                    Restore
                    </Button>
            </Box>
        </Paper>
    )
}

export default SystemRestore;