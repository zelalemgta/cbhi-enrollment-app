import React, { useState, useEffect } from 'react'
import Box from '@material-ui/core/Box';
import Modal from '@material-ui/core/Modal';
import makeStyles from '@material-ui/core/styles/makeStyles'
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    header: {
        position: "absolute",
        top: 0,
        right: 0
    },
    container: {
        position: 'absolute',
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgb(51, 87, 125)",
        background: "radial-gradient(circle, rgba(51, 87, 125, 1) 10%, rgba(5, 17, 20, 1) 110%)",
        color: "#fff",
        '&:focus': {
            outline: "none",
            boxShadow: "0px 0px 10px 10px rgb(5, 17, 20, 0.3)"
        }
    },
    button: {
        width: "200px"
    },
    textField: {
        margin: "20px 0px",
        '& label, input, .Mui-focused, .MuiInputAdornment-root, .MuiFormHelperText-root': {
            color: "#fff",
            opacity: 0.87
        },
        '& .Mui-focused::before, .MuiInput-formControl::before, .MuiInput-formControl:hover::before': {
            borderColor: "#fff",
            opacity: 0.87
        },
        '& .MuiFormHelperText-root.Mui-error': {
            color: "#f44336"
        }
    }
}))

const AccountProtection = React.forwardRef(({ open }, ref) => {
    const [accountPassword, setAccountPassword] = useState("")
    const [accountError, setAccountError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        ipcRenderer.on(channels.ACCOUNT_LOGIN, (event, result) => {
            setIsLoading(false)
            if (!result.success)
                setAccountError(result.errorMessage);
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.ACCOUNT_LOGIN);
        }
    }, [accountError])

    const handleChange = (e) => {
        setAccountPassword(e.target.value)
    }

    const handleLogin = (e) => {
        e.preventDefault()
        setIsLoading(true)
        ipcRenderer.send(channels.ACCOUNT_LOGIN, accountPassword);
    }

    const closeApplication = () => {
        ipcRenderer.send(channels.CLOSE_APPLICATION);
    }

    const classes = useStyles()
    return (
        <Modal
            disableAutoFocus
            open={open}>
            <Box boxShadow={3} className={classes.container} m={0} textAlign="center" width={270} p={5} borderRadius={15}>
                <Box className={classes.header}>
                    <IconButton color="inherit" onClick={closeApplication}><CloseIcon /></IconButton>
                </Box>
                <form onSubmit={handleLogin}>
                    <Box>
                        <Typography variant='h5'>Welcome</Typography><br />
                        <AccountBoxIcon style={{ fontSize: "100px" }} />
                    </Box>
                    <Box mt={2} mb={4}>
                        <TextField
                            error={accountError !== ""}
                            autoFocus
                            id="account-password"
                            label="Account Password"
                            className={classes.textField}
                            helperText={accountError ? accountError : "Please type your password here"}
                            onChange={handleChange}
                            value={accountPassword}
                            type='password'
                            placeholder='*******************'
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <VpnKeyIcon color='inherit' />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Box>
                        <Button
                            type="submit"
                            variant="contained"
                            className={classes.button}
                            startIcon={isLoading ? <CircularProgress thickness={5} color='primary' size={20} /> : <VerifiedUserIcon color='secondary' />}
                        >
                            Login
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    )
})

export default AccountProtection;