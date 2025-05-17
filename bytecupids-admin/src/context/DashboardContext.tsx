import { createContext, useContext, useState } from "react";

interface DashboardContextType {
    hasSelected: String;
    handleSelected: (selected: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboardContext = () => {
    const context = useContext(DashboardContext)
    if (!context) {
        throw new Error("useDashboardContext must be used within a DashboardProvider");
    }
    return context;
}

interface DashboardProviderProps {
    children: React.ReactNode;
}
export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
    const [hasSelected, setSelected] = useState<string>("dashboard"); // This should be replaced with actual logic to determine if something is selected

    const handleSelected = (selected: string) => {
        setSelected(selected);
    }

    return (
        <DashboardContext.Provider value={{ hasSelected , handleSelected }}>
            {children}
        </DashboardContext.Provider>
    );
}