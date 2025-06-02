import React from 'react';
import styles from './StageComponents.module.css';

const SubtopicContent: React.FC = () => {
  return (
    <div className={styles.stageComponent}>
      <div className={styles.centerContent}>
        <h2 className={styles.componentTitle}>Subtopic's Content</h2>
        <p className={styles.componentDescription}>
          This component will handle subtopic content editing
        </p>
      </div>
    </div>
  );
};

export default SubtopicContent;