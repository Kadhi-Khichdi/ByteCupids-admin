import type React from "react";
import styles from "./DashboardContents.module.css"; // Import styles as an object
import { useDashboardContext } from "../../../contexts/DashboardContext";
import DashBoardModules from "./ModulesSection";
import Dashboard from "./Dashboard";
import Pipelines from "./Pipelines";

const DashboardContents: React.FC = () => {
    
    const { hasSelected, handleSelected } = useDashboardContext();

    return (
        <div className={styles.component}>
            {hasSelected === "dashboard" && (
                <Dashboard />
            )}
            {hasSelected === "modules" && (
                <DashBoardModules />
            )}
            {hasSelected === "pipelines" && (
                <Pipelines/>
            )}
        </div>
    )
}

export default DashboardContents;