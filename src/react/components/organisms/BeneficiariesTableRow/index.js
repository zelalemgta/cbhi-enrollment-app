import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box'
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import { channels } from '../../../../shared/constants';
import { toEthiopian } from 'ethiopian-date';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: "#e9e9e9",
        "& th, td": {
            borderColor: "#d3d3d3"
        },        
    },
    header: {
        borderColor: "#c3c3c3"
    },
    actionBtn: {
        paddingRight: "0px",
        '& button': {
            padding: "0px 3px",
            color: "#000"
        }
    },
    emptyRecords: {
        textAlign: "center",
        padding: "16px 0"
    }
}))

const convertDate = (date) => {
    let convertedDate;
    const dateObj = new Date(date);
    const [year, month, day] = [dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()];
    convertedDate = toEthiopian(year, month, day);
    //Returned Date Format YYYY-MM-DD
    return `${convertedDate[0]}-${convertedDate[1]}-${convertedDate[2]}`
}

const calculateAge = (dateOfBirth) => {
    var diff = new Date().getTime() - new Date(dateOfBirth).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const BeneficiariesTableRow = (props) => {

    const [beneficiariesData, setBeneficiariesData] = useState({
        householdId: "",
        beneficiaries: []
    });
   
    useEffect(() => {
        if (beneficiariesData.householdId === "") {
            ipcRenderer.send(channels.LOAD_BENEFICIARIES, props.householdId)
            ipcRenderer.on(channels.LOAD_BENEFICIARIES, (event, result) => {
                setBeneficiariesData({
                    householdId: props.householdId,
                    beneficiaries: result
                });
            })
            return () => ipcRenderer.removeAllListeners(channels.LOAD_BENEFICIARIES)
        }
    }, [props.householdId, beneficiariesData])

    const classes = useStyles();
    return (
        <Box py={2} className={classes.root}>
            <Box pl={2} borderBottom={1} className={classes.header}>
                <Typography variant="button">
                    Beneficiaries
                </Typography>
            </Box>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell width="7%">Actions</TableCell>
                        <TableCell width="25%">Full Name</TableCell>
                        <TableCell width="5%">Age</TableCell>
                        <TableCell width="5%">Gender</TableCell>
                        <TableCell width="25%">CBHI ID</TableCell>
                        <TableCell width="5">Relationship</TableCell>
                        <TableCell width="25">Enrollment Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {beneficiariesData.beneficiaries.length ? beneficiariesData.beneficiaries.map(beneficiary => (
                        <TableRow key={beneficiary.id}>
                            <TableCell className={classes.actionBtn}>
                                <Tooltip title="Edit Beneficiary">
                                    <IconButton onClick={() => props.handleEditBeneficiary(beneficiary.id)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Beneficiary">
                                    <IconButton onClick={() => props.handleDeleteBeneficiary(beneficiary.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                            <TableCell style={{fontSize: "0.8rem"}}>{beneficiary.fullName}</TableCell>
                            <TableCell style={{fontSize: "0.8rem"}}>{calculateAge(beneficiary.dateOfBirth)}</TableCell>
                            <TableCell style={{fontSize: "0.8rem"}}>{beneficiary.gender}</TableCell>
                            <TableCell style={{fontSize: "0.8rem"}}>{`${props.householdCBHI}/${beneficiary.cbhiId}`}</TableCell>
                            <TableCell style={{fontSize: "0.8rem"}}>{beneficiary.relationship}</TableCell>
                            <TableCell style={{fontSize: "0.8rem"}}>{convertDate(beneficiary.enrolledDate)}</TableCell>
                        </TableRow>
                    )) :
                        <TableRow>
                            <TableCell className={classes.emptyRecords} colSpan={7}>
                                <Typography variant="body2">No Beneficiary Records to display</Typography>
                            </TableCell>
                        </TableRow>
                    }
                </TableBody>
            </Table>
        </Box >
    )
}

export default BeneficiariesTableRow;