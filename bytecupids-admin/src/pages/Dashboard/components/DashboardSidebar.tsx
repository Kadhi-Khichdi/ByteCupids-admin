import type React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardSidebar.module.css";
import { useDashboardContext } from "../../../context/DashboardContext";


const DashboardSidebar:React.FC = () => {
  const navigate = useNavigate();
  const { hasSelected, handleSelected } = useDashboardContext();

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case "dashboard":
        handleSelected("dashboard");
        break;
      case "modules":
        handleSelected("modules");
        break;
      case "pipelines":
        handleSelected("pipelines");
        break;
      default:
        handleSelected("dashboard");
        break;
    }
  };

  return (
    <aside className={styles["sidebar"]}>
      <div className={styles["logo"]}>Bytecupids</div>      

      <div className={styles["sidebar-items"]}>
        
        <div className={styles["sidebar-item"]} onClick={() => {
          handleTabChange("dashboard");}}>
          <span>Dashboard</span>
        </div>

        <div className={styles["sidebar-item"]} onClick={() => {
          handleTabChange("modules");}}>
          <span>Modules</span>
        </div>

        <div className={styles["sidebar-item"]} onClick={() => {
          handleTabChange("pipelines");
        }}>
          <span>Pipelines</span>
        </div>
      </div>
    </aside>
  );
};
export default DashboardSidebar;