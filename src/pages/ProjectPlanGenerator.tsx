

import React from 'react';
import ProjectPlanGeneratorComponent from '../components/Planning/ProjectPlanGenerator';

const ProjectPlanGeneratorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProjectPlanGeneratorComponent
        onPlanGenerated={(plan) => {
          console.log('Plan généré:', plan);
        }}
      />
    </div>
  );
};

export default ProjectPlanGeneratorPage;
