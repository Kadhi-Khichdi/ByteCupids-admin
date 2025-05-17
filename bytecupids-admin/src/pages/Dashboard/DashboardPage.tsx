import type React from "react";
import styles from "./DashboardPage.module.css"; // Import styles as an object
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardContents from "./components/DashboardContents";

const DashbaordPage: React.FC = () => {
    return (
        <div className={styles['dashboard-container']}> 
        <DashboardSidebar />
        <DashboardContents />
        </div>
    );
}


export default DashbaordPage;