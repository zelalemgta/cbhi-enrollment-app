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
import { channels } from '../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        marginLeft: 200,
        fontSize: 13
    }
}));

const Members = () => {

    const [open, setOpen] = useState(false);

    const tableRef = React.createRef();

    const [modalForm, setModalForm] = useState({
        type: "",
        memberId: null,
        parentId: null,
        parentCBHI: null
    });
    const classes = useStyles();

    const columns = [
        { title: 'Full Name', field: 'fullName', cellStyle: { width: '35%' } },
        { title: 'Age', field: 'age', type: 'numeric' },
        { title: 'Gender', field: 'gender' },
        { title: 'CBHI ID', field: 'cbhiId', cellStyle: { width: '25%' } },
        { title: 'Kebele', field: 'kebele', hidden: true },
        { title: 'Gote', field: 'gote', hidden: true },
        { title: 'Relationship', field: 'relationship', hidden: true },
        { title: 'Profession', field: 'profession', hidden: true },
        { title: 'Enrollment Date', field: 'enrolledDate', hidden: true },
        { title: 'Membership Status', field: 'status' }
    ];

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const reloadGrid = () => {
        tableRef.current && tableRef.current.onQueryChange();
    }

    return (
        <Box className={classes.root} p={1} mb={3}>
            <Modal
                open={open}
                onClose={handleClose}
                disableBackdropClick={true}>
                {modalForm.type === "memberForm" ?
                    <MemberForm memberId={modalForm.memberId} parentCBHI={modalForm.parentCBHI} parentId={modalForm.parentId} reloadGrid={reloadGrid} closeModal={handleClose} />
                    : <RenewalForm memberId={modalForm.memberId} closeModal={handleClose} />}
            </Modal>
            <MaterialTable
                title="CBHI Members & Beneficiaries"
                tableRef={tableRef}
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
                data={query =>
                    new Promise((resolve, reject) => {
                        ipcRenderer.send(channels.LOAD_MEMBERS, query);
                        ipcRenderer.on(channels.LOAD_MEMBERS, (event, result) => {
                            ipcRenderer.removeAllListeners(channels.LOAD_MEMBERS);
                            resolve({
                                data: result.rows,
                                page: result.page,
                                totalCount: result.count
                            })
                        });
                    })
                }
                actions={[
                    {
                        icon: () => <AddBox />,
                        tooltip: 'Add Member',
                        isFreeAction: true,
                        onClick: (event) => {
                            setModalForm({
                                type: "memberForm",
                                memberId: null,
                                parentId: null
                            });
                            handleOpen();
                        }
                    },
                    rowData => ({
                        icon: () => <Edit />,
                        tooltip: 'Edit Member',
                        isFreeAction: false,
                        onClick: (event) => {
                            setModalForm({
                                type: "memberForm",
                                memberId: rowData.id,
                                parentId: rowData.parentId,
                                parentCBHI: null
                            });
                            handleOpen();
                        }
                    }),
                    rowData => ({
                        icon: () => <GroupAdd />,
                        tooltip: `Add Beneficiary`,
                        isFreeAction: false,
                        hidden: rowData.parentId === null ? false : true,
                        onClick: (event) => {
                            setModalForm({
                                type: "memberForm",
                                memberId: null,
                                parentId: rowData.id,
                                parentCBHI: rowData.cbhiId
                            });
                            handleOpen();
                        }
                    }),
                    rowData => ({
                        icon: () => <RotateLeft color="secondary" />,
                        tooltip: 'Renew Membership',
                        isFreeAction: false,
                        hidden: rowData.status === "expired" ? false : true,
                        onClick: (event) => {
                            setModalForm({
                                type: "renewForm",
                                memberId: rowData.id,
                                parentId: rowData.parentId,
                                parentCBHI: null
                            });
                            handleOpen();
                        }
                    }),
                    rowData => ({
                        icon: () => <Delete />,
                        tooltip: `Delete Beneficiary`,
                        isFreeAction: false,
                        hidden: rowData.parentId === null ? true : false,
                        onClick: (event) => alert("You want to add a new row")
                    })]
                }
            />
        </Box>
    )
}

export default Members;