import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const NavHeader = (props) => {

    return (
        <Box display="flex" p={1} my={1}>
            <Box color="secondary.main" clone>
                <AccountCircleIcon className fontSize="large" />
            </Box>
            <Box ml={1}>
                <Typography variant="overline">{props.name}</Typography>
            </Box>
        </Box>
    );
}

export default NavHeader;