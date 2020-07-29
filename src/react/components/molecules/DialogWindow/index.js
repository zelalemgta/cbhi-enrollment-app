import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const DialogWindow = (props) => {
    return (
        <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
        >
            <DialogTitle id="dialog-title">{props.title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="dialog-description">
                    {props.message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="primary" autoFocus>
                    Cancel
          </Button>
                <Button onClick={props.handleAction} color="primary">
                    Yes
          </Button>
            </DialogActions>
        </Dialog>

    );
}

export default DialogWindow;
