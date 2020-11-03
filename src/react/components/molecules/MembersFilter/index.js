import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import AutocompleteFormControl from '../../organisms/AutocompleteFormControl';
import { genderOptions, MembershipStatusOptions, MembershipTypeOptions } from '../../../../shared/constants';
import FilterListIcon from '@material-ui/icons/FilterList';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: "24px",
    },
    actionButton: {
        marginTop: "16px",
        marginLeft: "10px"
    },
    inputField: {
        width: "100%",
        '& div, label': {
            fontSize: "0.875rem"
        }
    },
    AutocompleteField: {
        '& input, label': {
            width: "100%",
            fontSize: "0.875rem"
        }
    },
}))

const MembersFilter = (props) => {

    const handleSubmit = (e) => {
        e.preventDefault()
        props.handleFilterSubmit()
    }

    const classes = useStyles();

    return (
        <form autoComplete="off" onSubmit={handleSubmit}>
            <Grid container className={classes.root} spacing={2}>
                <Grid item xs={2}>
                    <AutocompleteFormControl
                        classes={classes.AutocompleteField}
                        disableClearable={true}
                        handleChange={props.handleAdministrativeDivisionChange}
                        selectedOption={props.filterData.selectedOption} />
                </Grid>
                <Grid item xs={2}>
                    <FormControl className={classes.inputField}>
                        <InputLabel id="genderLabel">Male/Female</InputLabel>
                        <Select
                            labelId="genderLabel"
                            id="gender"
                            name="gender"
                            value={props.filterData.gender}
                            placeholder="Male/Female"
                            onChange={props.handleFilterChange}
                        >
                            {genderOptions.map((gender, index) => (
                                <MenuItem key={index} value={gender}>{gender}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <FormControl className={classes.inputField}>
                        <InputLabel id="membershipTypeLabel">Indigent/Paying</InputLabel>
                        <Select
                            labelId="membershipTypeLabel"
                            id="membershipType"
                            name="membershipType"
                            value={props.filterData.membershipType}
                            placeholder="Indigent/Paying"
                            onChange={props.handleFilterChange}
                        >
                            {MembershipTypeOptions.map((type, index) => (
                                <MenuItem key={index} value={index}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <FormControl className={classes.inputField}>
                        <InputLabel id="membershipStatusLabel">Active/Expired</InputLabel>
                        <Select
                            labelId="membershipStatusLabel"
                            id="membershipStatus"
                            name="membershipStatus"
                            value={props.filterData.membershipStatus}
                            placeholder="Active/Expired"
                            onChange={props.handleFilterChange}
                        >
                            {MembershipStatusOptions.map((status, index) => (
                                <MenuItem key={index} value={index}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        size="small"
                        className={classes.actionButton}
                        startIcon={<FilterListIcon />}
                    >
                        Filter
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        className={classes.actionButton}
                        onClick={props.handleFilterReset}
                    >
                        Reset
                    </Button>
                </Grid>
            </Grid>
        </form>
    )
}

export default MembersFilter;