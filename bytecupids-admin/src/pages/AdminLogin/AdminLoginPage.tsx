import type React from "react";
import styles from "./AdminLoginPage.module.css";
import LoginForm from "./LoginForm";

const AdminLoginPage : React.FC = () => {
    return (
        <div className={styles['admin-login-page']}>
            <LoginForm/>
        </div>
    );
}

export default AdminLoginPage;