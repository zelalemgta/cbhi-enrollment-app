import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import Tooltip from '@material-ui/core/Tooltip'

const ExportBtn = ({ label = "Download Report", tooltip = "Export Report", action, isDisabled = false, className }) => {
    return (
        <Tooltip title={tooltip} arrow placement="left">
            <div className={className}>
                <Button
                    onClick={action}
                    disabled={isDisabled}
                    variant="contained"
                    color="secondary"
                    style={{ fontSize: ".75rem" }}
                    startIcon={<SaveAltIcon />}
                >
                    {label}
                </Button>
            </div>
        </Tooltip>
    )
}

export default ExportBtn