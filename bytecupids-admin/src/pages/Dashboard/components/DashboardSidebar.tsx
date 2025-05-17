import type React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardSidebar.module.css";


const DashboardSidebar:React.FC = () => {
  const navigate = useNavigate();
  return (
    <aside className={styles["sidebar"]}>
      <div className={styles["logo"]}>Bytecupids</div>

      {/* <div className={styles["sidebar__menu-item sidebar__menu-item--active"]} onClick={() => navigate("/")}>
              <span className={styles["sidebar__icon"]}>
          <svg
            width="25"
            height="25"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 9.5L10 4L17 9.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 17V10.5H15V17"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className={styles["sidebar__label"]}>Dashboard</span>
      </div>

      <div className={styles["sidebar__menu-item"]}>
              <span className={styles["sidebar__icon"]}>
          <svg
            width="25"
            height="25"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              stroke="currentColor"
              strokeWidth="2.2"
            />
            <rect x="9" y="8" width="2" height="6" rx="1" fill="currentColor" />
            <rect x="9" y="5" width="2" height="2" rx="1" fill="currentColor" />
          </svg>
        </span>
              <span className={styles["sidebar__label"]}>Modules</span>
      </div> */}

      <div className={styles["sidebar-items"]}>
        
        <div className={styles["sidebar-item"]}>
          <span>Dashboard</span>
        </div>

        <div className={styles["sidebar-item"]}>
          <span>Modules</span>
        </div>

        <div className={styles["sidebar-item"]}>
          <span>Pipelines</span>
        </div>
      </div>
    </aside>
  );
};
export default DashboardSidebar;