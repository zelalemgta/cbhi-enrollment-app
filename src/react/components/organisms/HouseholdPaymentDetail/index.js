import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box'
import MaterialTable from 'material-table';
import DatePicker from '../../atoms/DatePicker';
import TableIcons from '../../molecules/TableIcons';

import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const membershipType = { 0: "Indigent", 1: "Paying" }

const HouseholdPaymentDetail = ({ householdId, enrollmentPeriodId, paymentRecords, isPaying }) => {

    const columns = [
        { title: 'Receipt No.', field: 'receiptNo', sorting: false, validate: rowData => rowData.receiptNo ? true : false },
        { title: 'Registration Fee (ETB)', field: 'registrationFee', type: 'numeric', sorting: false },
        {
            title: 'Contribution Fee (ETB)',
            field: 'contributionAmount',
            type: 'numeric',
            sorting: false,
            editable: 'never'
        },
        { title: 'Additional Beneficiary Fee (ETB)', field: 'additionalBeneficiaryFee', type: 'numeric', sorting: false },
        { title: 'Other Fees (ETB)', field: 'otherFees', type: 'numeric', sorting: false },
        { title: 'Membership Type', field: 'isPaying', lookup: membershipType, sorting: false, hidden: true },
        {
            title: 'Payment Date',
            field: 'receiptDate',
            editComponent: props => {
                return (
                    <DatePicker
                        value={props.value ? props.value : ""}
                        onChange={e => props.onChange(e.target.value)}
                        width={75}
                    />
                )
            },
            validate: rowData => rowData.receiptDate ? true : false,
            sorting: false
        }
    ];

    const [data, setData] = useState([]);

    useEffect(() => {
        if (paymentRecords) {
            setData(paymentRecords)
        }
    }, [paymentRecords])


    return (
        <Box>
            <MaterialTable
                title="Household Payment Records"
                icons={TableIcons}
                options={{
                    draggable: false,
                    padding: "dense",
                    pageSize: 4,
                    pageSizeOptions: [],
                    headerStyle: {
                        textAlign: "center",
                        backgroundColor: "#ecf0f5",
                        fontSize: "13px",
                        padding: "0px 2px",
                        borderRight: "1px solid #e3e3e3"
                    },
                    rowStyle: {
                        fontSize: "13px",
                        textAlign: "center"
                    },
                    toolbarButtonAlignment: "left",
                }}
                columns={columns}
                data={data}
                editable={{
                    onRowAdd: newData =>
                        new Promise((resolve, reject) => {
                            newData.HouseholdId = householdId
                            newData.EnrollmentPeriodId = enrollmentPeriodId
                            newData.isPaying = isPaying
                            //TODO - Create new Channel to address payment adding
                            ipcRenderer.send(channels.CREATE_MEMBER_RENEWAL, newData);
                            resolve();
                        }),
                    onRowUpdate: (newData, oldData) =>
                        new Promise((resolve, reject) => {
                            ipcRenderer.send(channels.UPDATE_ENROLLMENT_RECORD, newData);
                            resolve();
                        }),
                    onRowDelete: (oldData) =>
                        new Promise((resolve, reject) => {
                            ipcRenderer.send(channels.REMOVE_ENROLLMENT_RECORD, oldData.id);
                            resolve()
                        }),
                }}
            />
        </Box>
    )
}

export default HouseholdPaymentDetail;