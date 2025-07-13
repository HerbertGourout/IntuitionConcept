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

    // Mapping Project -> ProjectData attendu par BudgetOverview
    const budgetData = {
        name: currentProject.name,
        budget: currentProject.budget,
        actualSpent: currentProject.spent,
        phases: (currentProject.phases || []).map(phase => ({
            id: phase.id,
            name: phase.name,
            estimatedCost: (phase.tasks || []).reduce((sum, t) => sum + (t.budget || 0), 0),
            actualCost: (phase.tasks || []).reduce((sum, t) => sum + (t.spent || 0), 0),
            completion: Math.round(
                ((phase.tasks || []).reduce((sum, t) => sum + (t.spent || 0), 0) /
                Math.max(1, (phase.tasks || []).reduce((sum, t) => sum + (t.budget || 0), 0))) * 100
            ),
        })),
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Budget du projet : {currentProject.name}</h1>
            <BudgetOverview project={budgetData} />
        </div>
    );
};

export default ProjectBudget;
