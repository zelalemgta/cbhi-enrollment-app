import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => (
    {
        root: {
            padding: "10px",
            "& p": {
                margin: "5px 0"
            }
        },
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
            backgroundColor: "rgba(0, 0, 0, 0.8)"
        },
        progressCircle: {
            width: "60px !important",
            height: "60px !important",
            display: "block"
        },
        progressTitle: {
            top: "40%"
        }

    }
))

const SystemProgress = () => {

    const [progressState, setProgressState] = useState({
        open: true,
        progressTitle: "",
        progressValue: 0
    });

    useEffect(() => {
        ipcRenderer.on(channels.SYSTEM_PROGRESS, (event, result) => {
            setProgressState(result)
        })
        return (() => ipcRenderer.removeAllListeners(channels.SYSTEM_PROGRESS))
    }, [progressState])

    const classes = useStyles();
    return (
        <Backdrop className={classes.backdrop} open={progressState.open}>
            <Box position="relative" display="inline-flex">
                <CircularProgress
                    className={classes.progressCircle}
                    variant="indeterminate"
                    value={progressState.progressValue}
                    color="secondary"
                />
                <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    {progressState.progressValue > 0 &&
                        <Typography variant="h6" component="div">
                            {`${Math.round(progressState.progressValue)}%`}
                        </Typography>}
                </Box>
            </Box>
            <Box position="absolute" className={classes.progressTitle}>
                <Typography variant="h6">{progressState.progressTitle}</Typography>
            </Box>
        </Backdrop>
    )
}

export default SystemProgress;