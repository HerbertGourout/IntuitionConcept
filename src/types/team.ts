export interface TeamMember {
  id: string;
  projectId: string; // Isolation par projet
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

// Spécialités BTP professionnelles
export const BTP_SPECIALTIES = {
  // Direction et Management
  'directeur_travaux': '🏗️ Directeur de Travaux',
  'conducteur_travaux': '👷‍♂️ Conducteur de Travaux',
  'chef_chantier': '🦺 Chef de Chantier',
  'ingenieur_btp': '🎓 Ingénieur BTP',
  'architecte': '📐 Architecte',
  'economiste_construction': '💰 Économiste de la Construction',
  
  // Gros Œuvre
  'macon': '🧱 Maçon',
  'coffreur_bancheur': '🔨 Coffreur-Bancheur',
  'ferrailleur': '⚙️ Ferrailleur',
  'grutier': '🏗️ Grutier',
  'conducteur_engins': '🚜 Conducteur d\'Engins',
  'terrassier': '⛏️ Terrassier',
  
  // Second Œuvre
  'electricien': ' Électricien',
  'plombier': '🔧 Plombier',
  'chauffagiste': '🔥 Chauffagiste',
  'menuisier': '🪚 Menuisier',
  'carreleur': '🔲 Carreleur',
  'peintre': ' Peintre',
  'platrier': '🏠 Plâtrier',
  'couvreur': '🏠 Couvreur',
  'etancheur': '💧 Étancheur',
  'serrurier': '🔐 Serrurier-Métallier',
  
  // Finitions
  'decorateur': '🎭 Décorateur',
  'moquetteur': '🏠 Moquetteur-Solier',
  'vitrier': '🪟 Vitrier',
  'ascensoriste': '🛗 Ascensoriste',
  
  // Spécialisés
  'geometre': '📏 Géomètre',
  'topographe': '🗺️ Topographe',
  'controleur_qualite': '✅ Contrôleur Qualité',
  'coordinateur_sps': '🛡️ Coordinateur SPS',
  'technicien_bureau_etudes': '📊 Technicien Bureau d\'Études'
};

// Départements BTP par phase de projet
export const BTP_DEPARTMENTS = {
  'direction': '🏢 Direction',
  'bureau_etudes': '📐 Bureau d\'Études',
  'gros_oeuvre': '🏗️ Gros Œuvre',
  'second_oeuvre': '🔧 Second Œuvre',
  'finitions': ' Finitions',
  'vrd': '🛣️ VRD (Voirie et Réseaux)',
  'qualite_securite': '🛡️ Qualité & Sécurité',
  'logistique': '📦 Logistique',
  'maintenance': '🔧 Maintenance',
  'administration': '📋 Administration'
};

export interface Role {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  icon: string;
  level: number;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  onLeaveMembers: number;
  averageWorkload: number;
  topPerformers: number;
}
