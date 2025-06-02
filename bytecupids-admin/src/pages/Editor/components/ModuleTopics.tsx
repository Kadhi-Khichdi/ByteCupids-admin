import React from 'react';
import styles from './StageComponents.module.css';

const ModuleTopics: React.FC = () => {
  return (
    <div className={styles.stageComponent}>
      <div className={styles.centerContent}>
        <h2 className={styles.componentTitle}>Module's Topics</h2>
        <p className={styles.componentDescription}>
          This component will handle module topics management
        </p>
      </div>
    </div>
  );
};

export default ModuleTopics;