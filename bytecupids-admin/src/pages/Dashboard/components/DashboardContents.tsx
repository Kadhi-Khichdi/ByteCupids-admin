import type React from "react";
import styles from "./DashboardContents.module.css"; // Import styles as an object
import { useDashboardContext } from "../../../context/DashboardContext";

const DashboardContents: React.FC = () => {

    // const [hasSelected, handleSelected] = useDashboardContext();

    const { hasSelected, handleSelected } = useDashboardContext();

    return (
        <div className={styles.component}>
            {hasSelected}
        </div>
    )
}

export default DashboardContents;