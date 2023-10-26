import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box'
import MaterialTable, { MTableToolbar } from 'material-table';
import BeneficiariesTableRow from '../../organisms/BeneficiariesTableRow';
import { makeStyles } from '@material-ui/core/styles';
import TableIcons from '../../molecules/TableIcons';
import AddBox from '@material-ui/icons/AddBox';
import Edit from '@material-ui/icons/Edit';
import GroupAdd from '@material-ui/icons/GroupAdd';
import RotateLeft from '@material-ui/icons/RotateLeft';
import LocalAtmTwoToneIcon from '@material-ui/icons/LocalAtmTwoTone';
import Delete from '@material-ui/icons/Delete';
import Modal from '@material-ui/core/Modal';
import MemberForm from '../../organisms/MemberFormWizard';
import RenewalForm from '../../organisms/RenewalForm';
import DialogWindow from '../../molecules/DialogWindow';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import MembersFilter from '../../molecules/MembersFilter';
import { channels } from '../../../../shared/constants';
import { toEthiopian } from 'ethiopian-date';
import AdditionalPaymentForm from '../../organisms/AdditionalPaymentForm';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: "55px",
        marginLeft: "160px",
        fontSize: "0.8rem"
    },
    badge: {
        '& span': {
            top: "9px",
            right: "-30px"
        }
    },
    warningBadge: {
        '& span': {
            top: "9px",
            right: "-30px",
            padding: "0px 5px",
            backgroundColor: theme.palette.warning.main
        },

    }
}));

const convertDate = (date) => {
    let convertedDate;
    const dateObj = new Date(date);
    const [year, month, day] = [dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()];
    convertedDate = toEthiopian(year, month, day);
    //Returned Date Format DD/MM/YYYY
    return `${convertedDate[0]}-${convertedDate[1]}-${convertedDate[2]}`
}

const calculateAge = (dateOfBirth) => {
    var diff = new Date().getTime() - new Date(dateOfBirth).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const Members = () => {

    const tableRef = React.createRef();

    const [gridState, setGridState] = useState({
        isLoading: false
    })

    const [queryFilter, setQueryFilter] = useState({
        administrativeDivisionId: "",
        gender: "",
        membershipType: "",
        membershipStatus: "",
        idCardIssued: "",
        selectedOption: null,
        page: null
    })

    const [modalForm, setModalForm] = useState({
        open: false,
        type: "",
        householdId: null,
        memberId: null,
        isHouseholdHead: false,
        isNew: false
    });

    const [dialogState, setDialogState] = useState({
        open: false,
        title: "",
        message: "",
        memberId: 0,
    });

    const classes = useStyles();

    const columns = [
        {
            title: 'Full Name',
            field: 'Members.fullName',
            cellStyle: { width: '30%' },
            sorting: false
        },
        {
            title: 'Age',
            field: 'Members.dateOfBirth',
            render: rowData => calculateAge(rowData['Members.dateOfBirth']),
            sorting: false,
        },
        { title: 'Gender', field: 'Members.gender', sorting: false },
        {
            title: 'CBHI ID',
            field: 'Members.cbhiId',
            cellStyle: { width: '25%' },
            render: rowData =>
                <>
                    <Box width={20} display="inline-block" mr={1}>
                        {rowData['idCardIssued'] ?
                            <Tooltip placement="top" title="ID Card Issued">
                                <AssignmentIndIcon fontSize="small" style={{ verticalAlign: "middle", color: "#007bb2" }} />
                            </Tooltip> : <></>
                        }
                    </Box>
                    {rowData.cbhiId}/{rowData['Members.cbhiId']}
                </>,
            sorting: false
        },
        // {
        //     title: 'Household Size',
        //     field: 'householdSize',
        //     render: rowData => rowData['Members.isHouseholdHead'] && rowData.householdSize,
        //     hidden: true,
        //     sorting: false
        // },
        {
            title: 'Kebele/Gote',
            field: 'AdministrativeDivision',
            render: rowData => rowData.AdministrativeDivisionId && `${rowData['AdministrativeDivision.name']} (${rowData['AdministrativeDivision.level']}) - ${rowData['AdministrativeDivision.parentName']}`,
            hidden: true,
            sorting: false
        },
        { title: 'Relationship', field: 'Members.relationship', hidden: true, sorting: false },
        { title: 'Profession', field: 'Members.profession', hidden: true, sorting: false },
        {
            title: 'Enrollment Date',
            field: 'Members.enrolledDate',
            render: rowData => convertDate(rowData['Members.enrolledDate']),
            hidden: true,
            sorting: false
        },
        {
            title: 'Membership Status',
            field: 'status',
            sorting: false,
            render: rowData => rowData['EnrollmentRecords.id'] ?
                rowData['EnrollmentRecords.isPaying'] ?
                    <Tooltip placement="top" title="Paying">
                        <Badge className={classes.badge} badgeContent="P" color="secondary">Active</Badge>
                    </Tooltip> :
                    <Tooltip placement="top" title="Indigent">
                        <Badge className={classes.warningBadge} badgeContent="I">Active</Badge>
                    </Tooltip> :
                'Expired'
        }
    ];

    const handleClose = () => {
        setModalForm({
            open: false,
            type: "",
            householdId: null,
            memberId: null,
            isHouseholdHead: false,
            isNew: false
        })
    }

    const handleDialogClose = () => {
        setDialogState({
            open: false,
            title: "",
            message: "",
            memberId: 0,
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

    const handleFilterSubmit = (filterData) => {
        reloadGrid()
    }

    const handleFilterChange = (e) => {
        setQueryFilter({
            ...queryFilter,
            [e.target.name]: e.target.value,
            page: 0
        })
    }

    const handleAdministrativeDivisionChange = (newSelectedOption) => {
        setQueryFilter({
            ...queryFilter,
            selectedOption: newSelectedOption,
            administrativeDivisionId: newSelectedOption ? newSelectedOption.id : null
        })
    }

    const handleFilterReset = () => {
        setQueryFilter({
            administrativeDivisionId: "",
            gender: "",
            membershipType: "",
            membershipStatus: "",
            selectedOption: null,
            idCardIssued: "",
            page: null
        });
        reloadGrid()
    }

    const handleEditBeneficiary = (id) => {
        setModalForm({
            open: true,
            type: "memberForm",
            memberId: id
        });
    }

    const handleDeleteBeneficiary = (id) => {
        setDialogState({
            open: true,
            title: "Are you sure you want to delete the selected beneficiary?",
            message: "Attention! If you press Yes, the selected beneficiary will be deleted from the system.",
            memberId: id
        })
    }

    const reloadGrid = () => {
        tableRef.current && tableRef.current.onQueryChange();
    }

    return (
        <Box className={classes.root} p={1} mb={3}>
            <Modal
                open={modalForm.open}
                onClose={handleClose}>
                {modalForm.type === "memberForm" ?
                    <MemberForm memberId={modalForm.memberId} isNew={modalForm.isNew} reloadGrid={reloadGrid} closeModal={handleClose} />
                    : modalForm.type === "renewForm" ? <RenewalForm householdId={modalForm.householdId} reloadGrid={reloadGrid} closeModal={handleClose} />
                        : <AdditionalPaymentForm householdId={modalForm.householdId} reloadGrid={reloadGrid} closeModal={handleClose} />}
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
                localization={{
                    toolbar: {
                        exportName: "Export to Excel"
                    }
                }}
                detailPanel=
                {[
                    rowData => ({
                        tooltip: rowData["Members.isHouseholdHead"] && "Beneficiaries",
                        disabled: !rowData["Members.isHouseholdHead"],
                        render: rowData =>
                            <BeneficiariesTableRow
                                rowId={rowData.tableData.id}
                                householdId={rowData.id}
                                householdCBHI={rowData.cbhiId}
                                handleEditBeneficiary={handleEditBeneficiary}
                                handleDeleteBeneficiary={handleDeleteBeneficiary}
                            />
                    })
                ]}
                options={{
                    padding: "dense",
                    pageSize: 10,
                    pageSizeOptions: [],
                    exportButton: true,
                    exportCsv: (columns, data) => {
                        ipcRenderer.send(channels.EXPORT_ENROLLMENT, { filters: queryFilter });
                        setGridState({
                            ...gridState,
                            isLoading: true
                        })
                    },
                    grouping: false,
                    draggable: false,
                    debounceInterval: 500,
                    searchAutoFocus: true,
                    columnsButton: true,
                    loadingType: "overlay",
                    toolbarButtonAlignment: "left",
                    rowStyle: rowData => ({
                        backgroundColor: rowData['EnrollmentRecords.id'] ? "inherit" : "#ffcdd2"
                    })
                }}
                columns={columns}
                components={{
                    Toolbar: props => (
                        <>
                            <MTableToolbar {...props} />
                            <MembersFilter
                                handleFilterSubmit={handleFilterSubmit}
                                handleFilterReset={handleFilterReset}
                                handleFilterChange={handleFilterChange}
                                handleAdministrativeDivisionChange={handleAdministrativeDivisionChange}
                                filterData={queryFilter} />
                        </>
                    ),
                }}
                data={query =>
                    new Promise(async (resolve, reject) => {
                        query.filters = queryFilter;
                        query.page = queryFilter.page === 0 ? 0 : query.page
                        await ipcRenderer.send(channels.LOAD_MEMBERS, query);
                        ipcRenderer.on(channels.LOAD_MEMBERS, (event, result) => {
                            result.rows.map(household => {
                                if (household['AdministrativeDivision.parent']) {
                                    const parentAdministrativeDivision = result.administrativeDivisions.filter(ad => ad.id === household['AdministrativeDivision.parent'])[0]
                                    household['AdministrativeDivision.parentName'] = parentAdministrativeDivision.name
                                    return household;
                                } else {
                                    household["AdministrativeDivision.parentName"] = "";
                                    return household;
                                }
                            })
                            setQueryFilter({
                                ...queryFilter,
                                page: null,
                            });
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
                                open: true,
                                type: "memberForm",
                                memberId: null,
                                isNew: true
                            });
                        }
                    },
                    rowData => ({
                        icon: () => <Edit />,
                        tooltip: 'Edit Member',
                        isFreeAction: false,
                        onClick: (event) => {
                            setModalForm({
                                open: true,
                                type: "memberForm",
                                memberId: rowData['Members.id'],
                                isNew: false
                            });
                        }
                    }),
                    rowData => ({
                        icon: () => <GroupAdd />,
                        tooltip: `Add Beneficiary`,
                        isFreeAction: false,
                        hidden: !rowData['Members.isHouseholdHead'],
                        onClick: (event) => {
                            setModalForm({
                                open: true,
                                type: "memberForm",
                                memberId: rowData['Members.id'],
                                isNew: true
                            });
                        }
                    }),
                    rowData => ({
                        icon: () => <RotateLeft color="secondary" />,
                        tooltip: 'Renew Membership',
                        isFreeAction: false,
                        hidden: rowData['EnrollmentRecords.id'] || !rowData['Members.isHouseholdHead'],
                        onClick: (event) => {
                            ipcRenderer.send(channels.CHECK_ACTIVE_PERIOD);
                            ipcRenderer.on(channels.CHECK_ACTIVE_PERIOD, (event, result) => {
                                if (result) {
                                    setModalForm({
                                        open: true,
                                        type: "renewForm",
                                        householdId: rowData.id,
                                    });
                                }
                                ipcRenderer.removeAllListeners(channels.CHECK_ACTIVE_PERIOD);
                            })

                        }
                    }),
                    rowData => ({
                        icon: () => <LocalAtmTwoToneIcon color="secondary" />,
                        tooltip: 'Additional Payment',
                        isFreeAction: false,
                        hidden: !rowData['EnrollmentRecords.id'] || !rowData['Members.isHouseholdHead'] ? true : false,
                        onClick: (event) => {
                            ipcRenderer.send(channels.CHECK_ACTIVE_PERIOD);
                            ipcRenderer.on(channels.CHECK_ACTIVE_PERIOD, (event, result) => {
                                if (result) {
                                    setModalForm({
                                        open: true,
                                        type: "additionalPaymentForm",
                                        householdId: rowData.id,
                                    });
                                }
                                ipcRenderer.removeAllListeners(channels.CHECK_ACTIVE_PERIOD);
                            })
                        }
                    }),
                    rowData => ({
                        icon: () => <Delete />,
                        tooltip: `Delete Beneficiary`,
                        isFreeAction: false,
                        hidden: rowData['Members.isHouseholdHead'],
                        onClick: (event) => setDialogState({
                            open: true,
                            title: "Are you sure you want to delete the selected beneficiary?",
                            message: "Attention! If you press Yes, the selected beneficiary will be deleted from the system.",
                            memberId: rowData['Members.id']
                        })
                    })
                ]}
            />
        </Box>
    )
}

export default Members;