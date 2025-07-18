import React from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { BudgetOverview } from '../components/Costs/BudgetOverview';

const ProjectBudget: React.FC = () => {
    const { projects, currentProject } = useProjectContext();

    // Si aucun projet n'existe, afficher un état vide
    if (!projects || projects.length === 0 || !currentProject) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                <img src="/empty-state.svg" alt="Aucun projet" style={{ width: 180, marginBottom: 24 }} />
                <h2 className="text-xl font-semibold mb-2">Aucun projet disponible</h2>
                <p className="text-gray-500 mb-4">Créez un projet pour commencer à suivre votre budget.</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Budget du projet : {currentProject.name}</h1>
            <BudgetOverview />
        </div>
    );
};

export default ProjectBudget;
