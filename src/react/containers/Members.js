import React, { useState } from 'react';
import Box from '@material-ui/core/Box'
import MaterialTable from 'material-table';
import { makeStyles } from '@material-ui/core/styles';
import TableIcons from '../components/TableIcons';
import AddBox from '@material-ui/icons/AddBox';
import Edit from '@material-ui/icons/Edit';
import GroupAdd from '@material-ui/icons/GroupAdd';
import RotateLeft from '@material-ui/icons/RotateLeft';
import Delete from '@material-ui/icons/Delete';
import Modal from '@material-ui/core/Modal';
import MemberForm from '../components/ModalForms/MemberForm';
import RenewalForm from '../components/ModalForms/RenewalForm';

const useStyles = makeStyles((theme) => ({
    root: {
        marginLeft: 200,
        fontSize: 13
    }
}));

const Members = () => {

    const [open, setOpen] = useState(false);
    const [modalForm, setModalForm] = useState("");
    const classes = useStyles();
    const columns = [
        { title: 'Full Name', field: 'fullName', cellStyle: { width: '30%' } },
        { title: 'Age', field: 'age', type: 'numeric' },
        {
            title: 'Gender',
            field: 'gender',
            lookup: { 1: 'Male', 2: 'Female' },

        },
        { title: 'CBHI ID', field: 'cbhiId', cellStyle: { width: '30%' } },
        { title: 'Kebele', field: 'kebele', hidden: true },
        { title: 'Gote', field: 'gote', hidden: true },
        {
            title: 'Relationship',
            field: 'relationship',
            hidden: true,
            lookup: { 1: 'Household Head', 2: 'Wife/Husband', 3: 'Son', 4: 'Daughter', 5: 'Parent', 6: 'Other' },
        },
        { title: 'Enollment Date', field: 'enrollmentDate', hidden: true },
        { title: 'Membership Status', field: 'status' }
    ];

    const [data, setData] = useState([
        {
            id: 1, fullName: 'Mulugeta G/Michael Amdemariam', age: 37, gender: 1,
            cbhiId: '01/01/03/P-000798/00', kebele: 'Agulae', gote: 'Chikun', relationship: 1, enrollmentDate: '04/25/2007', status: 'active'
        }, {
            id: 2, fullName: 'Biniam Mulugeta G/Michael', age: 13, gender: 1,
            cbhiId: '01/01/03/P-000798/01', kebele: 'Agulae', gote: 'Chikun', relationship: 3, status: 'active', parentId: 1
        },
        {
            id: 3, fullName: 'Senait Mulugeta G/Michael', age: 8, gender: 2,
            cbhiId: '01/01/03/P-000798/02', kebele: 'Agulae', gote: 'Chikun', relationship: 4, status: 'active', parentId: 1
        },
        {
            id: 4, fullName: 'Fitsum Hadgu W/Michael', age: 27, gender: 1,
            cbhiId: '01/01/03/P-000798/00', kebele: 'Abrha Atsbeha', gote: 'Gemad', relationship: 1, status: 'expired'
        }, {
            id: 5, fullName: 'Semhal G/Kidan Kiros', age: 13, gender: 2,
            cbhiId: '01/01/03/P-000798/01', kebele: 'Agulae', gote: 'Chikun', relationship: 2, status: 'active', parentId: 4
        },
        {
            id: 6, fullName: 'Senait Mulugeta G/Michael', age: 8, gender: 2,
            cbhiId: '01/01/03/P-000798/02', kebele: 'Agulae', gote: 'Chikun', relationship: 4, status: 'active', parentId: 4
        },
        {
            id: 7, fullName: 'Hellina Haileselassie Toma', age: 37, gender: 2,
            cbhiId: '01/01/03/P-000798/00', kebele: 'Wukro', gote: 'Tsaeda', relationship: 1, status: 'active'
        }, {
            id: 8, fullName: 'Biniam Mulugeta G/Michael', age: 13, gender: 1,
            cbhiId: '01/01/03/P-000798/01', kebele: 'Agulae', gote: 'Chikun', relationship: 3, status: 'active', parentId: 7
        },
        {
            id: 9, fullName: 'Senait Mulugeta G/Michael', age: 8, gender: 2,
            cbhiId: '01/01/03/P-000798/02', kebele: 'Agulae', gote: 'Chikun', relationship: 4, status: 'active', parentId: 7
        },
        {
            id: 10, fullName: 'Mulugeta G/Michael Amdemariam', age: 37, gender: 1,
            cbhiId: '01/01/03/P-000798/00', kebele: 'Agulae', gote: 'Chikun', relationship: 1, status: 'active'
        }, {
            id: 11, fullName: 'Biniam Mulugeta G/Michael', age: 13, gender: 1,
            cbhiId: '01/01/03/P-000798/01', kebele: 'Agulae', gote: 'Chikun', relationship: 3, status: 'active', parentId: 10
        },
        {
            id: 12, fullName: 'Senait Mulugeta G/Michael', age: 8, gender: 2,
            cbhiId: '01/01/03/P-000798/02', kebele: 'Agulae', gote: 'Chikun', relationship: 4, status: 'active', parentId: 10
        },
        {
            id: 13, fullName: 'Fitsum Hadgu W/Michael', age: 27, gender: 1,
            cbhiId: '01/01/03/P-000798/00', kebele: 'Abrha Atsbeha', gote: 'Gemad', relationship: 1, status: 'expired'
        }, {
            id: 14, fullName: 'Semhal G/Kidan Kiros', age: 13, gender: 2,
            cbhiId: '01/01/03/P-000798/01', kebele: 'Agulae', gote: 'Chikun', relationship: 2, status: 'active', parentId: 13
        },
        {
            id: 15, fullName: 'Senait Mulugeta G/Michael', age: 8, gender: 2,
            cbhiId: '01/01/03/P-000798/02', kebele: 'Agulae', gote: 'Chikun', relationship: 4, status: 'active', parentId: 13
        },
        {
            id: 16, fullName: 'Hellina Haileselassie Toma', age: 37, gender: 2,
            cbhiId: '01/01/03/P-000798/00', kebele: 'Wukro', gote: 'Tsaeda', relationship: 1, status: 'active'
        }, {
            id: 17, fullName: 'Biniam Mulugeta G/Michael', age: 13, gender: 1,
            cbhiId: '01/01/03/P-000798/01', kebele: 'Agulae', gote: 'Chikun', relationship: 3, status: 'active', parentId: 16
        },
        {
            id: 18, fullName: 'Senait Mulugeta G/Michael', age: 8, gender: 2,
            cbhiId: '01/01/03/P-000798/02', kebele: 'Agulae', gote: 'Chikun', relationship: 4, status: 'active', parentId: 16
        },
        {
            id: 19, fullName: 'Mulugeta G/Michael Amdemariam', age: 37, gender: 1,
            cbhiId: '01/01/03/P-000798/00', kebele: 'Agulae', gote: 'Chikun', relationship: 1, status: 'active'
        }, {
            id: 20, fullName: 'Biniam Mulugeta G/Michael', age: 13, gender: 1,
            cbhiId: '01/01/03/P-000798/01', kebele: 'Agulae', gote: 'Chikun', relationship: 3, status: 'active', parentId: 19
        },
        {
            id: 21, fullName: 'Senait Mulugeta G/Michael', age: 8, gender: 2,
            cbhiId: '01/01/03/P-000798/02', kebele: 'Agulae', gote: 'Chikun', relationship: 4, status: 'active', parentId: 19
        },
        {
            id: 22, fullName: 'Fitsum Hadgu W/Michael', age: 27, gender: 1,
            cbhiId: '01/01/03/P-000798/00', kebele: 'Abrha Atsbeha', gote: 'Gemad', relationship: 1, status: 'expired'
        }, {
            id: 23, fullName: 'Semhal G/Kidan Kiros', age: 13, gender: 2,
            cbhiId: '01/01/03/P-000798/01', kebele: 'Agulae', gote: 'Chikun', relationship: 2, status: 'active', parentId: 22
        },
        {
            id: 24, fullName: 'Senait Mulugeta G/Michael', age: 8, gender: 2,
            cbhiId: '01/01/03/P-000798/02', kebele: 'Agulae', gote: 'Chikun', relationship: 4, status: 'active', parentId: 22
        },
        {
            id: 25, fullName: 'Hellina Haileselassie Toma', age: 37, gender: 2,
            cbhiId: '01/01/03/P-000798/00', kebele: 'Wukro', gote: 'Tsaeda', relationship: 1, status: 'active'
        }, {
            id: 26, fullName: 'Biniam Mulugeta G/Michael', age: 13, gender: 1,
            cbhiId: '01/01/03/P-000798/01', kebele: 'Agulae', gote: 'Chikun', relationship: 3, status: 'active', parentId: 25
        },
        {
            id: 27, fullName: 'Senait Mulugeta G/Michael', age: 8, gender: 2,
            cbhiId: '01/01/03/P-000798/02', kebele: 'Agulae', gote: 'Chikun', relationship: 4, status: 'active', parentId: 25
        },
    ]);

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }



    return (
        <Box className={classes.root} p={1} mb={3}>
            <Modal
                open={open}
                onClose={handleClose}
                disableBackdropClick={true}>
                {modalForm === "addMember" ? <MemberForm closeModal={handleClose} /> : <RenewalForm closeModal={handleClose} />}
            </Modal>
            <MaterialTable
                title="CBHI Members & Beneficiaries"
                icons={TableIcons}
                parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
                options={{
                    padding: "dense",
                    pageSize: 10,
                    pageSizeOptions: [],
                    exportButton: true,
                    grouping: false,
                    draggable: false,
                    columnsButton: true,
                    exportAllData: true,
                    loadingType: "overlay",
                    toolbarButtonAlignment: "left",
                    rowStyle: rowData => ({
                        backgroundColor: rowData.status === "expired" ? "#ffcdd2" : "inherit"
                    })
                }}
                columns={columns}
                data={data}
                actions={[
                    {
                        icon: () => <AddBox />,
                        tooltip: 'Add Member',
                        isFreeAction: true,
                        onClick: (event) => {
                            setModalForm("addMember");
                            handleOpen()
                        }
                    }, {
                        icon: () => <Edit />,
                        tooltip: 'Edit Member',
                        isFreeAction: false,
                        onClick: (event) => alert("You want to add a new row")
                    },
                    rowData => ({
                        icon: () => <GroupAdd />,
                        tooltip: `Add Beneficiary`,
                        isFreeAction: false,
                        hidden: rowData.parentId === undefined ? false : true,
                        onClick: (event) => alert("You want to add a new row")
                    }),
                    rowData => ({
                        icon: () => <RotateLeft color="secondary" />,
                        tooltip: 'Renew Membership',
                        isFreeAction: false,
                        hidden: rowData.status === "expired" ? false : true,
                        onClick: (event) => {
                            setModalForm("RenewMember");
                            handleOpen();
                        }
                    }),
                    rowData => ({
                        icon: () => <Delete />,
                        tooltip: `Delete Beneficiary`,
                        isFreeAction: false,
                        hidden: rowData.parentId === undefined ? true : false,
                        onClick: (event) => alert("You want to add a new row")
                    })]
                }
            />
        </Box>
    )
}

export default Members;