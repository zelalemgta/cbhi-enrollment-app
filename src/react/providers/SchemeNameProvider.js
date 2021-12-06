import { useState } from "react";
import { SchemeNameContext } from '../contexts'

const SchemeNameProvider = ({ children }) => {
    const [schemeName, setSchemeName] = useState("[Scheme Name]");
    return (
        <SchemeNameContext.Provider value={{ schemeName, setSchemeName }}>
            {children}
        </SchemeNameContext.Provider>
    )
}

export default SchemeNameProvider