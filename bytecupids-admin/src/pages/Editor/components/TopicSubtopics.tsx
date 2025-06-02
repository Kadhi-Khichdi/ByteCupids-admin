import React from 'react';
import styles from './StageComponents.module.css';

const TopicSubtopics: React.FC = () => {
  return (
    <div className={styles.stageComponent}>
      <div className={styles.centerContent}>
        <h2 className={styles.componentTitle}>Topic's Subtopics</h2>
        <p className={styles.componentDescription}>
          This component will handle topic subtopics management
        </p>
      </div>
    </div>
  );
};

export default TopicSubtopics;