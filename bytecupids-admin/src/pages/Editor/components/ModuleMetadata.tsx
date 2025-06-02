import React from 'react';
import styles from './StageComponents.module.css';

const ModuleMetadata: React.FC = () => {
  return (
    <div className={styles.stageComponent}>
      <div className={styles.centerContent}>
        <h2 className={styles.componentTitle}>Module Metadata</h2>
        <p className={styles.componentDescription}>
          This component will handle module metadata editing
        </p>
      </div>
    </div>
  );
};

export default ModuleMetadata;