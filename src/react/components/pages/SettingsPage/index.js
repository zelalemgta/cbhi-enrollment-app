import React from 'react';
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import GeneralSettings from '../../organisms/GeneralSettings';
import AdministrativeDivision from '../../organisms/AdministrativeDivision';
import EnrollmentPeriod from '../../organisms/EnrollmentPeriod';
import Subsidy from '../../organisms/Subsidy';
import ImportExcel from '../../organisms/ImportExcel';
import SystemSettings from '../../organisms/SystemSettings';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: "50px",
        backgroundColor: '#ecf0f5',
        marginLeft: 200
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.primary,
    },
}));

const Settings = () => {
    const classes = useStyles();

    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Box className={classes.root} p={1}>
            <ExpansionPanel expanded={expanded === 'panel1'} onChange={handleChange('panel1')} TransitionProps={{ unmountOnExit: true }}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                    <Typography className={classes.heading}>General settings</Typography>
                    <Typography className={classes.secondaryHeading}>Set Woreda profile</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <GeneralSettings />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded === 'panel2'} onChange={handleChange('panel2')} TransitionProps={{ unmountOnExit: true }}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2bh-content"
                    id="panel2bh-header"
                >
                    <Typography className={classes.heading}>Kebele/Gote Settings</Typography>
                    <Typography className={classes.secondaryHeading}>
                        Define Kebeles/Ketena and Gotes/Block under the woreda
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <AdministrativeDivision />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded === 'panel3'} onChange={handleChange('panel3')} TransitionProps={{ unmountOnExit: true }}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3bh-content"
                    id="panel3bh-header"
                >
                    <Typography className={classes.heading}>Enrollment Period</Typography>
                    <Typography className={classes.secondaryHeading}>
                        Set enrollment year/month start & end date
          </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <EnrollmentPeriod />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded === 'panel4'} onChange={handleChange('panel4')} TransitionProps={{ unmountOnExit: true }}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                >
                    <Typography className={classes.heading}>Subsidies</Typography>
                    <Typography className={classes.secondaryHeading}>
                        Manage General, Targeted & Other Subsidies
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Subsidy />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel5bh-content"
                    id="panel5bh-header"
                >
                    <Typography className={classes.heading}>Import Excel</Typography>
                    <Typography className={classes.secondaryHeading}>Import enrollment data from Excel</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <ImportExcel />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel6bh-content"
                    id="panel6bh-header"
                >
                    <Typography className={classes.heading}>System Settings</Typography>
                    <Typography className={classes.secondaryHeading}>System management & configurations</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <SystemSettings />
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </Box>
    );
}

export default Settings;