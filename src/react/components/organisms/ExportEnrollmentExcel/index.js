import React, { useState, useEffect } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { ReactComponent as ExcelIcon} from '../../../assets/icons/file-excel-solid.svg'
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { channels } from '../../../../shared/constants';

const { ipcRenderer } = window;

const useStyles = makeStyles((theme) => ({
    progress: {
        position: "absolute",
        top: 3,
        left: 3
    },
}));

const ExportEnrollmentExcel = (props) => {

    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        ipcRenderer.on(channels.EXPORT_ENROLLMENT_REPORT, (event) => {
            setExportLoading(false);
        })
        return () => ipcRenderer.removeAllListeners(channels.EXPORT_ENROLLMENT_REPORT)
    })

    const handleExport = () => {
        setExportLoading(true)
        ipcRenderer.send(channels.EXPORT_ENROLLMENT_REPORT)
    }

    const classes = useStyles();
    return (
        <Tooltip title="Export to Excel">
            <IconButton onClick={handleExport} disabled={exportLoading} {...props}>
                <ExcelIcon color="#388e3c" width={25} height={25} />
                {exportLoading && <CircularProgress className={classes.progress} />}
            </IconButton>
        </Tooltip>
    )
}

export default ExportEnrollmentExcel;