import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { TeamMember } from '../types/team';

const COLLECTION_NAME = 'teamMembers';

export class TeamService {
  // Obtenir tous les membres d'équipe
  static async getAllMembers(): Promise<TeamMember[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('joinDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
      throw error;
    }
  }

  // Ajouter un nouveau membre
  static async addMember(memberData: Omit<TeamMember, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...memberData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('Membre ajouté avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      throw error;
    }
  }

  // Mettre à jour un membre existant
  static async updateMember(memberId: string, memberData: Partial<TeamMember>): Promise<void> {
    try {
      const memberRef = doc(db, COLLECTION_NAME, memberId);
      await updateDoc(memberRef, {
        ...memberData,
        updatedAt: Timestamp.now()
      });
      
      console.log('Membre mis à jour:', memberId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du membre:', error);
      throw error;
    }
  }

  // Supprimer un membre
  static async deleteMember(memberId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, memberId));
      console.log('Membre supprimé:', memberId);
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      throw error;
    }
  }

  // Écouter les changements en temps réel
  static subscribeToMembers(callback: (members: TeamMember[]) => void): () => void {
    const q = query(collection(db, COLLECTION_NAME), orderBy('joinDate', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const members = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      
      callback(members);
    }, (error) => {
      console.error('Erreur lors de l\'écoute des membres:', error);
    });
  }

  // Obtenir un membre par ID
  static async getMemberById(memberId: string): Promise<TeamMember | null> {
    try {
      const members = await this.getAllMembers();
      return members.find(member => member.id === memberId) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du membre:', error);
      throw error;
    }
  }

  // Rechercher des membres par critères
  static async searchMembers(searchTerm: string, role?: string, status?: string): Promise<TeamMember[]> {
    try {
      const allMembers = await this.getAllMembers();
      
      return allMembers.filter(member => {
        const matchesSearch = !searchTerm || 
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.speciality.toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesRole = !role || role === 'all' || member.role === role;
        const matchesStatus = !status || status === 'all' || member.status === status;
        
        return matchesSearch && matchesRole && matchesStatus;
      });
    } catch (error) {
      console.error('Erreur lors de la recherche des membres:', error);
      throw error;
    }
  }
}

export default TeamService;
