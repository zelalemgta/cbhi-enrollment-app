import React from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        position: 'fixed',
        width: `calc(100% - 200px)`,
        marginLeft: 200,
        bottom: 0,
        color: theme.palette.text.altColor
    }
}));


const Footer = () => {
    const classes = useStyles();
    return (
        <Box className={classes.root} display="flex" bgcolor="primary.footer" p={1}>
            <Box flexGrow={1} pl={2}>
                <Typography component="span" variant="caption">
                    Copyright © 2020 Ethiopian Health Insurance Agency. All rights reserved.
                </Typography>
            </Box>
            <Box pr={3}>
                <Typography component="span" variant="caption">Version <b>0.1.0</b></Typography>
            </Box>

        </Box>
    );
}

export default Footer;