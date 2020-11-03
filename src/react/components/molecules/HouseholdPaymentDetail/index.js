import React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const HouseholdPaymentDetail = (props) => {

    const tableData = [
        {
            stat: "Receipts",
            value: props.data.receipts //contributionStat.newMembersContributions.toLocaleString()
        },
        {
            stat: "Registration Fee (ETB)",
            value: props.data.totalRegistrationFee  //contributionStat.newMembersContributions.toLocaleString()
        }, {
            stat: "Contribution Amount (ETB)",
            value: props.data.totalContribution //contributionStat.renewedMembersContributions.toLocaleString()
        }, {
            stat: "Additional Beneficiary Fees (ETB)",
            value: props.data.totalAddBeneficiaryFee
        }, {
            stat: "Other Fees (ETB)",
            value: props.data.totalOtherFees
        }]

    return (
        <TableContainer component={Paper}>
            <Table aria-label="Selected Date Range Statistics" size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Household Payment Details</TableCell>
                        <TableCell align="right">#</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableData.map((data, index) => (
                        <TableRow key={index}>
                            <TableCell component="th" scope="row">
                                {data.stat}
                            </TableCell>
                            <TableCell align="right">{data.value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default HouseholdPaymentDetail;