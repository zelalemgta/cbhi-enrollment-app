import { useState } from "react";
import { SystemProgressContext } from '../contexts/SystemProgressContext'

const SystemProgressProvider = ({ children }) => {
    const [progressState, setProgressState] = useState({
        open: false,
        progressTitle: "",
        progressValue: 0
    });
    return (
        <SystemProgressContext.Provider value={{ progressState, setProgressState }}>
            {children}
        </SystemProgressContext.Provider>
    )
}

export default SystemProgressProvider