// Liste structurée des matériaux et équipements pour la plateforme BTP Manager
// Cette liste peut être enrichie et utilisée dans BudgetSection, TransactionModal, TaskModal, etc.

export interface MaterialOrEquipment {
  name: string;
  category: string;
  unit: string;
  priceMin: number;
  priceMax?: number;
}

export const MATERIALS_EQUIPMENTS: MaterialOrEquipment[] = [
  // 🧱 Maçonnerie
  { name: 'Briques de 15 cm', category: 'Maçonnerie', unit: 'pièce', priceMin: 550 },
  { name: 'Briques de 20 cm', category: 'Maçonnerie', unit: 'pièce', priceMin: 700 },
  // 🔩 Ferraillage / Armatures
  { name: 'Fer de 6 mm', category: 'Ferraillage', unit: 'pièce', priceMin: 1300 },
  { name: 'Fer de 8 mm', category: 'Ferraillage', unit: 'pièce', priceMin: 1300 },
  { name: 'Fer de 10 mm', category: 'Ferraillage', unit: 'pièce', priceMin: 2500 },
  { name: 'Fer de 12 mm', category: 'Ferraillage', unit: 'pièce', priceMin: 3500 },
  { name: 'Fer de 14 mm', category: 'Ferraillage', unit: 'pièce', priceMin: 5750 },
  { name: 'Fer de 16 mm', category: 'Ferraillage', unit: 'pièce', priceMin: 6000 },
  // 🏗️ Sable, Gravier, Ciment
  { name: 'Sable', category: 'Maçonnerie', unit: 'm³', priceMin: 8000, priceMax: 8500 },
  { name: 'Gravier concassé', category: 'Maçonnerie', unit: 'm³', priceMin: 25000, priceMax: 45000 },
  { name: 'Ciment (sac de 50 kg)', category: 'Maçonnerie', unit: 'sac', priceMin: 4000, priceMax: 4500 },
  // 🪵 Bois et charpente
  { name: 'Planche industrielle', category: 'Bois', unit: 'pièce', priceMin: 14500 },
  { name: 'Chevrons en bois rouge', category: 'Bois', unit: 'pièce', priceMin: 9000, priceMax: 12500 },
  { name: 'Lattes en bois rouge', category: 'Bois', unit: 'pièce', priceMin: 3000, priceMax: 6500 },
  { name: 'Bastings', category: 'Bois', unit: 'pièce', priceMin: 13000 },
  { name: 'Panneaux en bois rouge industriel', category: 'Bois', unit: 'pièce', priceMin: 35000 },
  { name: 'Contre-plaqué', category: 'Bois', unit: 'pièce', priceMin: 12500 },
  { name: 'Verni', category: 'Bois', unit: 'pièce', priceMin: 6500 },
  { name: 'Colle pour bois', category: 'Bois', unit: 'pièce', priceMin: 4500 },
  { name: 'Papier vert', category: 'Bois', unit: 'ml', priceMin: 1500 },
  // 🛑 Tôlerie et toiture
  { name: 'Tôle bac acier 0,45 mm', category: 'Toiture', unit: 'pièce', priceMin: 35000 },
  { name: 'Tôles ondulées', category: 'Toiture', unit: 'pièce', priceMin: 3000 },
  { name: 'Tôles lisses', category: 'Toiture', unit: 'pièce', priceMin: 3000 },
  { name: 'Pointe de tôles', category: 'Toiture', unit: 'kg', priceMin: 7500 },
  { name: 'Fil d’attache', category: 'Toiture', unit: 'pièce', priceMin: 6000 },
  { name: 'Pointes diverses', category: 'Toiture', unit: 'kg/pièce', priceMin: 1500, priceMax: 2500 },
  { name: 'Étanchéité', category: 'Toiture', unit: 'ml', priceMin: 10000 },
  // 🔌 Électricité
  { name: 'Câble électrique TH1.5', category: 'Électricité', unit: 'rouleau', priceMin: 25000 },
  { name: 'Câble électrique TH2.5', category: 'Électricité', unit: 'rouleau', priceMin: 28000 },
  { name: 'Tube orange', category: 'Électricité', unit: 'rouleau', priceMin: 25000 },
  { name: 'Interrupteur simple allumage', category: 'Électricité', unit: 'pièce', priceMin: 3000 },
  { name: 'Interrupteur double allumage', category: 'Électricité', unit: 'pièce', priceMin: 4500 },
  { name: 'Interrupteur triple allumage va-et-vient', category: 'Électricité', unit: 'pièce', priceMin: 4500 },
  { name: 'Disjoncteur', category: 'Électricité', unit: 'pièce', priceMin: 45000 },
  { name: 'Variateur', category: 'Électricité', unit: 'pièce', priceMin: 35000 },
  { name: 'Tableau électrique modulaire', category: 'Électricité', unit: 'pièce', priceMin: 45000 },
  { name: 'Spots', category: 'Électricité', unit: 'pièce', priceMin: 7500 },
  { name: 'Modules', category: 'Électricité', unit: 'pièce', priceMin: 9500 },
  { name: 'Pique de terre', category: 'Électricité', unit: 'pièce', priceMin: 25000 },
  { name: 'Barrette de terre', category: 'Électricité', unit: 'pièce', priceMin: 25000 },
  { name: 'Fil cuivre nu', category: 'Électricité', unit: 'ml', priceMin: 35000 },
  // 🎨 Peinture et finition
  { name: 'Peinture à l’eau', category: 'Peinture', unit: 'litre/rouleau', priceMin: 2500 },
  { name: 'Peinture à l’huile', category: 'Peinture', unit: 'sceau', priceMin: 28000, priceMax: 35000 },
  { name: 'Mastique', category: 'Peinture', unit: 'pièce', priceMin: 18000 },
  { name: 'Stuc', category: 'Peinture', unit: 'boîte', priceMin: 45000 },
  { name: 'Diluant', category: 'Peinture', unit: 'litre', priceMin: 3500 },
  { name: 'Bande adhésive', category: 'Peinture', unit: 'pièce', priceMin: 8000 },
  { name: 'Pinceaux et rouleaux', category: 'Peinture', unit: 'pièce', priceMin: 1500 },
  // 💧 Plomberie
  { name: 'WC à chaise anglaise', category: 'Plomberie', unit: 'pièce', priceMin: 190000 },
  { name: 'Lavabo', category: 'Plomberie', unit: 'pièce', priceMin: 90000 },
  { name: 'Receveur de douche', category: 'Plomberie', unit: 'pièce', priceMin: 65000 },
  { name: 'Miroir de douche', category: 'Plomberie', unit: 'pièce', priceMin: 35000 },
  { name: 'Bac à savon', category: 'Plomberie', unit: 'pièce', priceMin: 5000 },
  { name: 'Bocal papier hygiène', category: 'Plomberie', unit: 'pièce', priceMin: 5000 },
  { name: 'Évier de cuisine', category: 'Plomberie', unit: 'pièce', priceMin: 85000 },
  { name: 'Pompe à pression/surpresseur', category: 'Plomberie', unit: 'pièce', priceMin: 350000 },
  { name: 'Tuyau PVC 125', category: 'Plomberie', unit: 'pièce', priceMin: 14500 },
  { name: 'Tuyau PVC 110', category: 'Plomberie', unit: 'pièce', priceMin: 3500 },
  { name: 'Tuyau PVC 75', category: 'Plomberie', unit: 'pièce', priceMin: 2500 },
  { name: 'Tuyau PPR 3/4', category: 'Plomberie', unit: 'pièce', priceMin: 6500 },
  { name: 'Tuyau PPR 1/2', category: 'Plomberie', unit: 'pièce', priceMin: 1500 },
  { name: 'Coudes PVC et PPR', category: 'Plomberie', unit: 'pièce', priceMin: 2500, priceMax: 7500 },
  { name: 'Siphons de sol', category: 'Plomberie', unit: 'pièce', priceMin: 9000 },
  { name: 'Colle pour tuyauterie', category: 'Plomberie', unit: 'pièce', priceMin: 2500 },
  { name: 'Bombonne gaz', category: 'Plomberie', unit: 'pièce', priceMin: 25000 },
  // 🧱 Carrelage et revêtements
  { name: 'Carreaux de sol', category: 'Revêtement', unit: 'm²', priceMin: 15000 },
  { name: 'Faïence', category: 'Revêtement', unit: 'm²', priceMin: 5500 },
  { name: 'Plâtre', category: 'Revêtement', unit: 'm²', priceMin: 3000 },
  { name: 'Filages', category: 'Revêtement', unit: 'ml', priceMin: 20000 },
  // 🪟 Menuiserie bois massif
  { name: 'Fenêtres baie vitrée', category: 'Menuiserie', unit: 'm²', priceMin: 85000 },
  { name: 'Balcons baie vitrée', category: 'Menuiserie', unit: 'm²', priceMin: 85000 },
  { name: 'Portes baie vitrée', category: 'Menuiserie', unit: 'm²', priceMin: 85000 },
  { name: 'Bouche portes', category: 'Menuiserie', unit: 'pièce', priceMin: 10000 },
  { name: 'Machine pour menuiserie', category: 'Menuiserie', unit: 'forfait', priceMin: 550000 },
  // ❄️ Climatisation
  { name: 'Climatiseur 2CV', category: 'Climatisation', unit: 'unité', priceMin: 400000 },
  { name: 'Climatiseur 1,5CV', category: 'Climatisation', unit: 'unité', priceMin: 350000 },
  { name: 'Climatiseur CV', category: 'Climatisation', unit: 'unité', priceMin: 300000 },
  { name: 'Accessoires climatiseurs', category: 'Climatisation', unit: 'forfait', priceMin: 4000000 },
  // 🚽 Sanitaires
  { name: 'Lave-mains', category: 'Sanitaires', unit: 'pièce', priceMin: 90000 },
  { name: 'Surpresseur', category: 'Sanitaires', unit: 'pièce', priceMin: 350000 },
  // 🛠️ Outils de chantier
  { name: 'Sert-joints', category: 'Outils', unit: 'pièce', priceMin: 4500 },
  { name: 'Brouettes', category: 'Outils', unit: 'unité', priceMin: 25000 },
  { name: 'Baramines', category: 'Outils', unit: 'pièce', priceMin: 25000 },
  { name: 'Marteaux', category: 'Outils', unit: 'pièce', priceMin: 2500, priceMax: 3500 },
  { name: 'Pelles', category: 'Outils', unit: 'pièce', priceMin: 3000 },
  { name: 'Masses', category: 'Outils', unit: 'pièce', priceMin: 5000 },
  { name: 'Seaux maçon', category: 'Outils', unit: 'pièce', priceMin: 3000 },
  { name: 'Scie circulaire', category: 'Outils', unit: 'unité', priceMin: 200000 },
  { name: 'Meule', category: 'Outils', unit: 'unité', priceMin: 180000 },
  { name: 'Disque à couper', category: 'Outils', unit: 'pièce', priceMin: 3500 },
  { name: 'Disque à béton', category: 'Outils', unit: 'pièce', priceMin: 5000 },
  { name: 'Disque à meule', category: 'Outils', unit: 'pièce', priceMin: 4500 },
  // 🧱 Hourdis et coffrage
  { name: 'Hourdis', category: 'Maçonnerie', unit: 'pièce', priceMin: 900 },
  // 🚰 Fosse septique et puisard
  { name: 'Moellons', category: 'Fosse septique', unit: 'm³', priceMin: 35000 },
  { name: 'Goudron', category: 'Fosse septique', unit: 'sc', priceMin: 9000 },
  { name: 'Pétrole', category: 'Fosse septique', unit: 'litre', priceMin: 1000 },
];
