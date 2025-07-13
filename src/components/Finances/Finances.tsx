import React, { useState, useContext } from 'react';
import { TrendingUp, TrendingDown, Euro, FileText, Filter, Search } from 'lucide-react';
import ProjectContext from '../../contexts/ProjectContext';
import { Project, CostItem } from '../../contexts/projectTypes';

const Finances: React.FC = () => {
  const projectContext = useContext(ProjectContext);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Données financières temporaires basées sur les coûts des tâches du projet
  const financialRecords = projectContext?.currentProject ? generateFinancialRecordsFromProject(projectContext.currentProject) : [];

  const filteredRecords = financialRecords.filter(record => {
    const matchesType = filterType === 'all' || record.type === filterType;
    const matchesProject = filterProject === 'all' || record.projectId === filterProject;
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.vendor && record.vendor.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesProject && matchesSearch;
  });

  // Calculs financiers
  const totalIncome = financialRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = financialRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalIncome - totalExpenses;


  const getProjectName = (projectId: string) => {
    const project = projectContext?.projects.find(p => p.id === projectId);
    return project ? project.name : 'Projet inconnu';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'materials': return '🏗️';
      case 'labor': return '👷';
      case 'equipment': return '🚜';
      case 'permits': return '📋';
      default: return '💼';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
          <p className="text-gray-600 mt-1">Gérez les finances de vos projets</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <TrendingUp className="w-4 h-4" />
            Nouveau Revenu
          </button>
          <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            <TrendingDown className="w-4 h-4" />
            Nouvelle Dépense
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Revenus</p>
              <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-100">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Dépenses</p>
              <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Euro className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Bénéfice Net</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(netProfit / 1000).toFixed(0)}k€
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{netProfit.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="income">Revenus</option>
              <option value="expense">Dépenses</option>
            </select>

            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tous les projets</option>
              {projectContext?.projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Financial Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transactions Récentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Description</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Projet</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Catégorie</th>
                <th className="text-right py-3 px-6 font-medium text-gray-700">Montant</th>
                <th className="text-center py-3 px-6 font-medium text-gray-700">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(record.category)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.description}</p>
                        {record.vendor && (
                          <p className="text-xs text-gray-500">{record.vendor}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {getProjectName(record.projectId)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 capitalize">
                    {record.category}
                  </td>
                  <td className={`py-4 px-6 text-sm font-semibold text-right ${record.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {record.type === 'income' ? '+' : '-'}{record.amount.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.approved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                      }`}>
                      {record.approved ? 'Approuvé' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction trouvée</h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche ou ajoutez une nouvelle transaction.
          </p>
        </div>
      )}
    </div>
  );
};

// Interface pour les enregistrements financiers
interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  projectId: string;
  approved: boolean;
  vendor?: string;
}

// Fonction utilitaire pour générer des données financières à partir des tâches du projet
const generateFinancialRecordsFromProject = (project: Project) => {
  const records: FinancialRecord[] = [];

  // Ajouter un revenu global pour le projet (acompte initial)
  records.push({
    id: `income-${project.id}-1`,
    type: 'income',
    category: 'payment',
    amount: project.budget * 0.3, // 30% d'acompte
    description: 'Acompte initial',
    date: project.startDate,
    projectId: project.id,
    approved: true,
    vendor: project.client || 'Client'
  });

  // Ajouter des dépenses basées sur les coûts des tâches
  project.phases.forEach((phase) => {
    phase.tasks.forEach((task) => {
      if (task.costItems && task.costItems.length > 0) {
        task.costItems.forEach((costItem: CostItem, index: number) => {
          records.push({
            id: `expense-${task.id}-${index}`,
            type: 'expense',
            category: costItem.type,
            amount: costItem.estimatedQuantity * costItem.estimatedUnitPrice,
            description: `${task.name}: ${costItem.name}`,
            date: task.startDate || task.dueDate || new Date().toISOString().split('T')[0],
            projectId: project.id,
            approved: Math.random() > 0.3, // Simulation: 70% approuvés
            vendor: `Fournisseur ${costItem.type}`
          });
        });
      }
    });
  });

  return records;
};

export default Finances;