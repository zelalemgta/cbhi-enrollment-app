import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { makeStyles, Box, Typography } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import SuccessIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';
import ErrorIcon from '@material-ui/icons/ErrorOutlineOutlined';

const useStyles = makeStyles((theme) => ({
    root: {
        '& p': {
            fontSize: '14px',
            fontWeight: 500,
        },
        '& svg': {
            verticalAlign: "middle",
            marginRight: '5px'
        }
    },
    success: {
        marginBottom: '30px',
        '& div': {
            backgroundColor: theme.palette.success.main
        }
    },
    info: {
        marginBottom: '30px',
        '& div': {
            backgroundColor: theme.palette.info.main
        }
    },
    warning: {
        marginBottom: '30px',
        '& div': {
            backgroundColor: theme.palette.warning.main
        }
    },
    error: {
        marginBottom: '30px',
        '& div': {
            backgroundColor: theme.palette.error.main
        }
    }
}))

const SlideTransition = (props) => {
    return <Slide {...props} direction="left" />;
}

const Alert = (props) => {
    switch (props.alertType) {
        case 'Success':
            return (
                <Typography display="inline">
                    <SuccessIcon />
                    {props.message}
                </Typography>
            )
        case 'Info':
            return (
                <Typography display="inline">
                    <InfoIcon />
                    {props.message}
                </Typography>
            )
        case 'Warning':
            return (
                <Typography display="inline">
                    <WarningIcon />
                    {props.message}
                </Typography>
            )
        case 'Error':
            return (
                <Typography display="inline">
                    <ErrorIcon />
                    {props.message}
                </Typography>
            )
        default:
            return null;
    }
}

const Notification = (props) => {

    const classes = useStyles();
    let notificationClass;
    switch (props.type) {
        case 'Success':
            notificationClass = classes.success;
            break;
        case 'Info':
            notificationClass = classes.info;
            break;
        case 'Warning':
            notificationClass = classes.warning;
            break;
        case 'Error':
            notificationClass = classes.error;
            break;
        default:
            notificationClass = classes.info;
    }

    const [state, setState] = useState({
        open: props.open,
        transition: SlideTransition
    });

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setState({
            ...state,
            open: false
        });
    }

    return (
        <Snackbar
            className={notificationClass}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            open={state.open}
            TransitionComponent={state.transition}
            autoHideDuration={7000}
            onClose={handleClose}
            message={
                <Box className={classes.root} width={250}>
                    <Alert alertType={props.type} message={props.message} />
                </Box>
            }
            action={
                < React.Fragment >
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        className={classes.close}
                        onClick={handleClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </React.Fragment >
            }
        />

    )
}

export default Notification;