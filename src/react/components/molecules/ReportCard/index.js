import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    figures: {
        marginTop: '15px'
    }
}))

const ReportCard = (props) => {
    const classes = useStyles();
    return (
        <Paper elevation={3}>
            <Typography variant="subtitle2">
                {props.title}
            </Typography>
            <Divider variant="fullWidth" />
            {
                props.children ? props.children :
                    <Typography className={classes.figures} variant="h4">
                        {props.value}
                    </Typography>
            }
        </Paper>
    )
}

export default ReportCard;
