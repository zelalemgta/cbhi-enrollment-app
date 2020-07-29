import React from 'react';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

const ReportDivider = (props) => {
    return (
        <>
            <Typography variant="subtitle2">{props.title}</Typography>
            <Divider variant="fullWidth" />
        </>
    )
}

export default ReportDivider;