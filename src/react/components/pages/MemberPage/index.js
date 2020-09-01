import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box'
import MaterialTable from 'material-table';
import { makeStyles } from '@material-ui/core/styles';
import TableIcons from '../../molecules/TableIcons';
import AddBox from '@material-ui/icons/AddBox';
import Edit from '@material-ui/icons/Edit';
import GroupAdd from '@material-ui/icons/GroupAdd';
import RotateLeft from '@material-ui/icons/RotateLeft';
import Delete from '@material-ui/icons/Delete';
import Modal from '@material-ui/core/Modal';
import MemberForm from '../../organisms/MemberForm';
import RenewalForm from '../../organisms/RenewalForm';
import DialogWindow from '../../molecules/DialogWindow';
import { channels } from '../../../../shared/constants';
import { toEthiopian } from 'ethiopian-date';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: "55px",
        marginLeft: 200,
        fontSize: 13
    }
}));

const convertDate = (date) => {
    let convertedDate;
    const dateObj = new Date(date);
    const [year, month, day] = [dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()];
    convertedDate = toEthiopian(year, month, day);
    //Returned Date Format DD/MM/YYYY
    return `${convertedDate[2]}/${convertedDate[1]}/${convertedDate[0]}`
}

const calculateAge = (dateOfBirth) => {
    var diff = new Date().getTime() - new Date(dateOfBirth).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const Members = () => {

    const [open, setOpen] = useState(false);

    const tableRef = React.createRef();

    const [gridState, setGridState] = useState({
        isLoading: false
    })

    const [modalForm, setModalForm] = useState({
        type: "",
        householdId: null,
        memberId: null,
        parentId: null,
        householdCBHIId: null
    });

    const [dialogState, setDialogState] = useState({
        open: false,
        title: "",
        message: "",
        memberId: 0,
    });


    const classes = useStyles();

    const columns = [
        { title: 'Full Name', field: 'Members.fullName', cellStyle: { width: '32%' } },
        {
            title: 'Age',
            field: 'Members.age',
            render: rowData => calculateAge(rowData['Members.dateOfBirth']),
            sorting: false
        },
        { title: 'Gender', field: 'Members.gender' },
        {
            title: 'CBHI ID',
            field: 'Members.cbhiId',
            cellStyle: { width: '25%' },
            render: rowData => `${rowData.cbhiId}/${rowData['Members.cbhiId']}`
        },
        {
            title: 'Kebele/Gote',
            field: 'AdministrativeDivision',
            render: rowData => rowData.AdministrativeDivisionId && `${rowData['AdministrativeDivision.name']} (${rowData['AdministrativeDivision.level']})`,
            hidden: true,
            sorting: false
        },
        { title: 'Relationship', field: 'Members.relationship', hidden: true },
        { title: 'Profession', field: 'Members.profession', hidden: true },
        {
            title: 'Enrollment Date',
            field: 'Members.enrolledDate',
            render: rowData => convertDate(rowData.enrolledDate),
            hidden: true
        },
        {
            title: 'Membership Status',
            field: 'status',
            sorting: false,
            render: rowData => rowData['EnrollmentRecords.id'] ? 'Active' : 'Expired'
        }
    ];

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleDialogClose = () => {
        setDialogState({
            ...dialogState,
            open: false
        });
    }

    const handleDialogAction = () => {
        ipcRenderer.send(channels.REMOVE_MEMBER, dialogState.memberId);
    }

    useEffect(() => {
        ipcRenderer.on(channels.MEMBER_REMOVED, (event) => {
            reloadGrid();
            setDialogState({
                ...dialogState,
                open: false
            })
        })
        return () => {
            ipcRenderer.removeAllListeners(channels.MEMBER_REMOVED);
        }
    })

    useEffect(() => {
        ipcRenderer.on(channels.EXPORT_ENROLLMENT, (event) => {
            setGridState({
                ...gridState,
                isLoading: false
            })
        })
        return () => {
            ipcRenderer.removeAllListeners(channels.EXPORT_ENROLLMENT);
        }
    })

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
                    <MemberForm memberId={modalForm.memberId} parentId={modalForm.parentId} reloadGrid={reloadGrid} closeModal={handleClose} />
                    : <RenewalForm householdId={modalForm.householdId} reloadGrid={reloadGrid} closeModal={handleClose} />}
            </Modal>
            <DialogWindow
                open={dialogState.open}
                title={dialogState.title}
                message={dialogState.message}
                recordId={dialogState.memberId}
                handleClose={handleDialogClose}
                handleAction={handleDialogAction}
            />
            <MaterialTable
                title="CBHI Members & Beneficiaries"
                tableRef={tableRef}
                icons={TableIcons}
                isLoading={gridState.isLoading}
                parentChildData={(row, rows) => rows.find(a => a['Members.id'] === row['Members.parentId'])}
                options={{
                    padding: "dense",
                    pageSize: 13,
                    pageSizeOptions: [],
                    exportButton: true,
                    exportCsv: (columns, data) => {
                        ipcRenderer.send(channels.EXPORT_ENROLLMENT);
                        setGridState({
                            ...gridState,
                            isLoading: true
                        })
                    },
                    grouping: false,
                    draggable: false,
                    columnsButton: true,
                    exportAllData: true,
                    loadingType: "overlay",
                    toolbarButtonAlignment: "left",
                    rowStyle: rowData => ({
                        backgroundColor: rowData['EnrollmentRecords.id'] ? "inherit" : "#ffcdd2"
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
                                memberId: rowData['Members.id'],
                                parentId: null
                            });
                            handleOpen();
                        }
                    }),
                    rowData => ({
                        icon: () => <GroupAdd />,
                        tooltip: `Add Beneficiary`,
                        isFreeAction: false,
                        hidden: rowData['Members.parentId'] === null ? false : true,
                        onClick: (event) => {
                            setModalForm({
                                type: "memberForm",
                                memberId: null,
                                parentId: rowData['Members.id']
                            });
                            handleOpen();
                        }
                    }),
                    rowData => ({
                        icon: () => <RotateLeft color="secondary" />,
                        tooltip: 'Renew Membership',
                        isFreeAction: false,
                        hidden: rowData['EnrollmentRecords.id'] || rowData['Members.parentId'] ? true : false,
                        onClick: (event) => {
                            ipcRenderer.send(channels.CHECK_ACTIVE_PERIOD);
                            ipcRenderer.on(channels.CHECK_ACTIVE_PERIOD, (event, result) => {
                                if (result) {
                                    setModalForm({
                                        type: "renewForm",
                                        householdId: rowData.id,
                                    });
                                    handleOpen();
                                }
                            })
                        }
                    }),
                    rowData => ({
                        icon: () => <Delete />,
                        tooltip: `Delete Beneficiary`,
                        isFreeAction: false,
                        hidden: rowData['Members.parentId'] === null ? true : false,
                        onClick: (event) => setDialogState({
                            open: true,
                            title: "Are you sure you want to delete the selected member?",
                            message: "Attention! If you press Yes, the selected member will be deleted from the system.",
                            memberId: rowData['Members.id']
                        })
                    })]
                }
            />
        </Box>
    )
}

export default Members;