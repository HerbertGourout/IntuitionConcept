import React, { useState, useMemo } from 'react';
import {
  UserPlus, User, Users, Edit3, Trash2, Mail, Phone,
  BarChart3, Calendar, Clock, CheckCircle, AlertTriangle,
  Building2, Target, Award, TrendingUp, Filter, Search,
  UserCheck, UserX, MoreVertical, X, Grid, List,
  Crown, Shield, Wrench, HardHat, Eye
} from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'project_manager' | 'supervisor' | 'worker' | 'client';
  speciality: string;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  projectsCount: number;
  avatar?: string;
  department?: string;
  salary?: number;
  workload?: number;
  skills?: string[];
  certifications?: string[];
  lastActivity?: string;
  performance?: number;
}

interface Role {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  icon: React.ComponentType<any>;
  level: number;
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  onLeaveMembers: number;
  averageWorkload: number;
  topPerformers: number;
}

const Team: React.FC = () => {
  const { currentProject } = useProjectContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Données d'exemple des membres de l'équipe
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '+33 1 23 45 67 89',
      role: 'project_manager',
      speciality: 'Gestion de projet',
      status: 'active',
      joinDate: '2023-01-15',
      projectsCount: 5,
      department: 'Management',
      salary: 65000,
      workload: 85,
      skills: ['Leadership', 'Planification', 'Budget'],
      certifications: ['PMP', 'Agile'],
      lastActivity: '2024-01-15',
      performance: 92
    },
    {
      id: '2',
      name: 'Marie Martin',
      email: 'marie.martin@example.com',
      phone: '+33 1 23 45 67 90',
      role: 'supervisor',
      speciality: 'Supervision chantier',
      status: 'active',
      joinDate: '2023-03-20',
      projectsCount: 3,
      department: 'Supervision',
      salary: 45000,
      workload: 75,
      skills: ['Supervision', 'Sécurité', 'Qualité'],
      certifications: ['CACES', 'Sécurité'],
      lastActivity: '2024-01-14',
      performance: 88
    },
    {
      id: '3',
      name: 'Pierre Durand',
      email: 'pierre.durand@example.com',
      phone: '+33 1 23 45 67 91',
      role: 'worker',
      speciality: 'Maçonnerie',
      status: 'active',
      joinDate: '2023-06-10',
      projectsCount: 2,
      department: 'Production',
      salary: 35000,
      workload: 90,
      skills: ['Maçonnerie', 'Béton', 'Finitions'],
      certifications: ['CAP Maçon'],
      lastActivity: '2024-01-15',
      performance: 85
    },
    {
      id: '4',
      name: 'Sophie Leroy',
      email: 'sophie.leroy@example.com',
      phone: '+33 1 23 45 67 92',
      role: 'admin',
      speciality: 'Administration',
      status: 'on_leave',
      joinDate: '2022-11-05',
      projectsCount: 8,
      department: 'Administration',
      salary: 55000,
      workload: 0,
      skills: ['Administration', 'Comptabilité', 'RH'],
      certifications: ['Comptabilité', 'Paie'],
      lastActivity: '2024-01-10',
      performance: 95
    }
  ]);

  const roles: Role[] = [
    {
      key: 'admin',
      name: 'Administrateur',
      description: 'Accès complet au système',
      permissions: ['all'],
      color: 'bg-red-500',
      icon: Crown,
      level: 1
    },
    {
      key: 'project_manager',
      name: 'Chef de Projet',
      description: 'Gestion des projets et équipes',
      permissions: ['project_management', 'team_management'],
      color: 'bg-blue-500',
      icon: Shield,
      level: 2
    },
    {
      key: 'supervisor',
      name: 'Superviseur',
      description: 'Supervision des travaux',
      permissions: ['supervision', 'quality_control'],
      color: 'bg-green-500',
      icon: Eye,
      level: 3
    },
    {
      key: 'worker',
      name: 'Ouvrier',
      description: 'Exécution des travaux',
      permissions: ['task_execution'],
      color: 'bg-yellow-500',
      icon: HardHat,
      level: 4
    },
    {
      key: 'client',
      name: 'Client',
      description: 'Consultation des projets',
      permissions: ['view_projects'],
      color: 'bg-purple-500',
      icon: User,
      level: 5
    }
  ];

  // Filtrage des membres
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.speciality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || member.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teamMembers, searchTerm, selectedRole, selectedStatus]);

  // Fonctions utilitaires
  const getRoleInfo = (roleKey: string): Role => {
    return roles.find(role => role.key === roleKey) || roles[0];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'on_leave': return 'En congé';
      default: return 'Inconnu';
    }
  };

  // Calcul des statistiques de l'équipe
  const teamStats: TeamStats = useMemo(() => {
    const totalMembers = teamMembers.length;
    const activeMembers = teamMembers.filter(m => m.status === 'active').length;
    const onLeaveMembers = teamMembers.filter(m => m.status === 'on_leave').length;
    const averageWorkload = totalMembers > 0 
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.workload || 0), 0) / totalMembers)
      : 0;
    const topPerformers = teamMembers.filter(m => (m.performance || 0) >= 90).length;
    
    return {
      totalMembers,
      activeMembers,
      onLeaveMembers,
      averageWorkload,
      topPerformers
    };
  }, [teamMembers]);

  // Gestionnaires d'événements
  const handleAddMember = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Équipe
              </h1>
              <p className="text-gray-600 mt-1">
                Gestion des membres de l'équipe et des rôles
              </p>
            </div>
          </div>
          <button
            onClick={handleAddMember}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <UserPlus className="h-5 w-5" />
            <span>Nouveau membre</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Membres</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{teamStats.activeMembers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Congé</p>
              <p className="text-2xl font-bold text-yellow-600">{teamStats.onLeaveMembers}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Performers</p>
              <p className="text-2xl font-bold text-purple-600">{teamStats.topPerformers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">Tous les rôles</option>
            {roles.map(role => (
              <option key={role.key} value={role.key}>{role.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border-2 border-white/30 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="on_leave">En congé</option>
          </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">
              Membres de l'équipe ({filteredMembers.length})
            </h3>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">Aucun membre trouvé</p>
            <button
              onClick={handleAddMember}
              className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:scale-105 transition-all duration-200"
            >
              <UserPlus className="h-5 w-5" />
              <span>Ajouter le premier membre</span>
            </button>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => {
              const roleInfo = getRoleInfo(member.role);
              const IconComponent = roleInfo.icon;
              
              return (
                <div key={member.id} className="glass-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <IconComponent className="h-3 w-3 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.speciality}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                              {getStatusText(member.status)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} text-white`}>
                              {roleInfo.name}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Projets</p>
                            <p className="text-lg font-semibold text-blue-600">{member.projectsCount}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Performance</p>
                            <p className="text-lg font-semibold text-green-600">{member.performance || 0}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{member.phone}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de gestion des membres */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedMember ? 'Modifier le membre' : 'Nouveau membre'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="text-center text-gray-600 py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Formulaire de gestion des membres en cours de développement</p>
                <p className="text-sm mt-2">Cette fonctionnalité sera implémentée dans la prochaine version</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-all duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
