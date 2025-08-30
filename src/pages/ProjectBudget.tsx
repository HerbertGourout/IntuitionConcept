import React from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { BudgetOverview } from '../components/Costs/BudgetOverview';
import { Calculator, Plus } from 'lucide-react';

const ProjectBudget: React.FC = () => {
    const { projects, currentProject, loadingProjects } = useProjectContext();

    // Attendre la fin du chargement pour éviter un flash d'état vide
    if (loadingProjects) {
        return null;
    }

    // Si, après chargement, aucun projet n'existe
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
        <div className="space-y-6 max-w-full">
            {/* Header */}
            <div className="glass-card w-full">
                <div className="flex items-center justify-between p-4 px-3 md:px-4 lg:px-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                            <Calculator className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Budget du projet
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Suivi des coûts et performance financière: <span className="font-semibold text-orange-600">{currentProject.name}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                            <Plus className="h-5 w-5" />
                            <span>Nouvelle dépense</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Budget Overview Content */}
            <div className="w-full">
                <BudgetOverview />
            </div>
        </div>
    );
};

export default ProjectBudget;
