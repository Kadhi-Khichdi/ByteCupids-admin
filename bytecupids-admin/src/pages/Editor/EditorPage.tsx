import type React from "react";
import styles from "./Editor.module.css"; // Import styles as an object
const EditorPage :React.FC = () => {
    return (
        <div className={styles['editor-container']}>
            <h1 className={styles['editor-title']}>Editor Page</h1>
            <p className={styles['editor-description']}>This is the editor page where you can create and edit content.</p>
            {/* Add more editor-specific components or functionality here */}
        </div>
        
    );
}
export default EditorPage;