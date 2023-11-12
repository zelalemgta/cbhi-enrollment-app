import React, { useState, useEffect } from 'react'
import StepWizard from "react-step-wizard";
import BasicInformation from "./BasicInformation";
import AdditionalInformation from './AdditionalInformation';
import ReviewForm from './ReviewForm';
import Box from '@material-ui/core/Box';
import AddBoxIcon from '@material-ui/icons/AddBox';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { channels, relationshipOptions } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    form: {
        maxWidth: "340px"
    },
    dialogTitle: {
        paddingBottom: "0px",
        marginBottom: "5px",
        borderBottom: "1px solid #e3e3e3"
    },
    textField: {
        margin: "10px 0px"
    }
}))

const MemberFormWizard = React.forwardRef(({ memberId, isNew, reloadGrid, closeModal }, ref) => {
    const [member, setMember] = useState({
        id: null,
        fullName: "",
        age: "",
        dateOfBirth: "",
        gender: "",
        cbhiId: "",
        'Household.id': "",
        'Household.cbhiId': "",
        'Household.AdministrativeDivisionId': null,
        'Household.address': "",
        relationship: "",
        profession: "",
        isHouseholdHead: false,
        enrolledDate: "",
        'Household.idCardIssued': false,
        isSubmitted: false
    })

    useEffect(() => {
        if (memberId !== null)
            ipcRenderer.send(channels.LOAD_MEMBER, memberId)
        else if (isNew) {
            setMember(memberState => ({
                ...memberState,
                relationship: relationshipOptions[0],
                isHouseholdHead: true
            }))
        }
        else {
            setMember(memberState => ({
                ...memberState,
                isHouseholdHead: false
            }))
        }
    }, [memberId, isNew])

    useEffect(() => {
        ipcRenderer.on(channels.LOAD_MEMBER, (event, result) => {
            if (isNew) {
                setMember({
                    ...member,
                    "Household.id": result['Household.id'],
                    "Household.cbhiId": result['Household.cbhiId'],
                    "Household.address": result['Household.address'] || "",
                    "Household.idCardIssued": result['Household.idCardIssued'] || false,
                    "Household.AdministrativeDivisionId": result['Household.AdministrativeDivisionId'],
                    "Household.AdministrativeDivision.id": result['Household.AdministrativeDivision.id'],
                    "Household.AdministrativeDivision.name": result['Household.AdministrativeDivision.name'],
                    "Household.AdministrativeDivision.level": result['Household.AdministrativeDivision.level']
                })
            }
            else
                setMember({
                    ...result,
                    "Household.address": result['Household.address'] || "",
                    "Household.idCardIssued": result['Household.idCardIssued'] ? true : false
                });
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.LOAD_MEMBER);
        }
    }, [member, isNew])

    useEffect(() => {
        ipcRenderer.on(channels.MEMBER_SUCCESS, (event) => {
            reloadGrid();
            closeModal();
        });
        return () => {
            ipcRenderer.removeAllListeners(channels.MEMBER_SUCCESS);
        }
    })

    const handleBasicInformation = (basicInformationObj) => {
        setMember({
            ...member,
            ...basicInformationObj
        })
    }

    const handleAdditionalInformation = (additionalInformationObj) => {
        setMember({
            ...member,
            ...additionalInformationObj
        })
    }

    const handleSubmit = () => {
        if (member.isSubmitted) return;
        setMember({
            ...member,
            isSubmitted: true
        })
        if (member.id === null)
            ipcRenderer.send(channels.CREATE_MEMBER, member);
        else
            ipcRenderer.send(channels.UPDATE_MEMBER, member);
    }

    const MemberFormNav = ({ currentStep, totalSteps }) => {
        const progress = Math.floor((currentStep / totalSteps) * 100)
        return (
            <Box py={1} mx={3} style={{ borderBottom: "2px solid #D1D5DB" }}>
                <Box color="#93959B" fontWeight="fontWeightBold" fontSize={14} mb={1}>{`Step: ${currentStep} of ${totalSteps}`}</Box>
                <Box display="flex" className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <Box flexGrow={1}>
                        {{
                            1: <div>
                                <Box fontWeight="fontWeightBold" fontSize={18}>Basic Information</Box>
                            </div>,
                            2: <div>
                                <Box fontWeight="fontWeightBold" fontSize={18}>Additional Information</Box>
                            </div>,
                            3: <div>
                                <Box fontWeight="fontWeightBold" fontSize={18}>Review Member</Box>
                            </div>

                        }[currentStep]}
                    </Box>

                    <Box display="flex" width="45%" justifyItems="center" className="flex items-center md:w-64">
                        <Box width="100%" mr={2}>
                            <Box mt={0.75} borderRadius={16} height="50%" bgcolor="secondary.main" style={{ width: progress + "%" }} />
                        </Box>
                        <Box fontSize={12} className="text-xs w-10 text-gray-600">{progress}%</Box>
                    </Box>
                </Box>
            </Box>
        )
    }

    const classes = useStyles()
    return (
        <Dialog
            maxWidth="sm"
            open={true}
            aria-labelledby="member-form-dialog"
            aria-describedby="create-household"
        >
            <DialogTitle className={classes.dialogTitle} id="alert-dialog-title">
                <Box display="flex">
                    <Box mr={1}>
                        <AddBoxIcon />
                    </Box>
                    {member.id ? "Update" : "Add New"} {member.isHouseholdHead ? "Household" : "Beneficiary"}
                </Box>
            </DialogTitle>
            <StepWizard transitions={{}} nav={<MemberFormNav />}>
                <BasicInformation data={member} loading={null} handleCancel={closeModal} handleBasicInformation={handleBasicInformation} />
                <AdditionalInformation data={member} loading={null} handleCancel={closeModal} handleAdditionalInformation={handleAdditionalInformation} />
                <ReviewForm data={member} loading={null} handleCancel={closeModal} handleSubmit={handleSubmit} />
            </StepWizard>
        </Dialog>
    )
})

export default MemberFormWizard;