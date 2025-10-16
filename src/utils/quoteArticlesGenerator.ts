/**
 * Générateur d'Articles de Devis Détaillés
 * 
 * Génère automatiquement les articles avec quantités calculées
 * pour chaque phase d'un projet BTP
 * 
 * @author IntuitionConcept BTP Platform
 * @version 1.0.0
 */

export interface QuoteArticle {
  designation: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Génère les articles pour une phase donnée
 */
export function generateArticlesForPhase(
  phaseName: string,
  totalArea: number,
  roomCount: number,
  floorCount: number
): QuoteArticle[] {
  
  const articles: QuoteArticle[] = [];
  
  switch (phaseName) {
    case '1. Installation de chantier':
      articles.push(
        {
          designation: 'Hangar provisoire 20m²',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 500000,
          totalPrice: 500000
        },
        {
          designation: 'Clôture provisoire',
          unit: 'ml',
          quantity: Math.ceil(totalArea * 0.5),
          unitPrice: 8000,
          totalPrice: Math.ceil(totalArea * 0.5) * 8000
        },
        {
          designation: 'Branchement eau provisoire',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 150000,
          totalPrice: 150000
        },
        {
          designation: 'Branchement électricité provisoire',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 200000,
          totalPrice: 200000
        },
        {
          designation: 'Signalisation chantier',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 100000,
          totalPrice: 100000
        }
      );
      break;
      
    case '2. Terrassement et fondations':
      articles.push(
        {
          designation: 'Décapage terre végétale',
          unit: 'm²',
          quantity: totalArea,
          unitPrice: 2500,
          totalPrice: totalArea * 2500
        },
        {
          designation: 'Fouilles en rigole',
          unit: 'ml',
          quantity: Math.ceil(totalArea * 0.4),
          unitPrice: 15000,
          totalPrice: Math.ceil(totalArea * 0.4) * 15000
        },
        {
          designation: 'Béton de propreté',
          unit: 'm³',
          quantity: Math.ceil(totalArea * 0.05),
          unitPrice: 75000,
          totalPrice: Math.ceil(totalArea * 0.05) * 75000
        },
        {
          designation: 'Ferraillage semelles',
          unit: 'kg',
          quantity: Math.ceil(totalArea * 15),
          unitPrice: 800,
          totalPrice: Math.ceil(totalArea * 15) * 800
        },
        {
          designation: 'Béton fondations C25/30',
          unit: 'm³',
          quantity: Math.ceil(totalArea * 0.15),
          unitPrice: 120000,
          totalPrice: Math.ceil(totalArea * 0.15) * 120000
        },
        {
          designation: 'Longrines béton armé',
          unit: 'ml',
          quantity: Math.ceil(totalArea * 0.3),
          unitPrice: 25000,
          totalPrice: Math.ceil(totalArea * 0.3) * 25000
        }
      );
      break;
      
    case '3. Assainissement':
      articles.push(
        {
          designation: 'Fosse septique 3000L',
          unit: 'u',
          quantity: 1,
          unitPrice: 850000,
          totalPrice: 850000
        },
        {
          designation: 'Puisard infiltration',
          unit: 'u',
          quantity: 1,
          unitPrice: 450000,
          totalPrice: 450000
        },
        {
          designation: 'Canalisations PVC Ø110',
          unit: 'ml',
          quantity: Math.ceil(totalArea * 0.2),
          unitPrice: 8500,
          totalPrice: Math.ceil(totalArea * 0.2) * 8500
        },
        {
          designation: 'Regards de visite',
          unit: 'u',
          quantity: Math.max(2, Math.ceil(roomCount / 3)),
          unitPrice: 75000,
          totalPrice: Math.max(2, Math.ceil(roomCount / 3)) * 75000
        }
      );
      break;
      
    case '4. Gros œuvre':
      articles.push(
        {
          designation: 'Parpaings 15x20x50',
          unit: 'u',
          quantity: Math.ceil(totalArea * 50),
          unitPrice: 400,
          totalPrice: Math.ceil(totalArea * 50) * 400
        },
        {
          designation: 'Ciment CPJ 45',
          unit: 'sac',
          quantity: Math.ceil(totalArea * 8),
          unitPrice: 6500,
          totalPrice: Math.ceil(totalArea * 8) * 6500
        },
        {
          designation: 'Fer à béton HA',
          unit: 'kg',
          quantity: Math.ceil(totalArea * 25),
          unitPrice: 800,
          totalPrice: Math.ceil(totalArea * 25) * 800
        },
        {
          designation: 'Béton dalle C25/30',
          unit: 'm³',
          quantity: Math.ceil(totalArea * floorCount * 0.15),
          unitPrice: 120000,
          totalPrice: Math.ceil(totalArea * floorCount * 0.15) * 120000
        },
        {
          designation: 'Poteaux béton armé',
          unit: 'u',
          quantity: Math.ceil(totalArea / 15),
          unitPrice: 180000,
          totalPrice: Math.ceil(totalArea / 15) * 180000
        },
        {
          designation: 'Chaînages béton armé',
          unit: 'ml',
          quantity: Math.ceil(totalArea * 0.6),
          unitPrice: 18000,
          totalPrice: Math.ceil(totalArea * 0.6) * 18000
        }
      );
      break;
      
    case '5. Charpente et couverture':
      articles.push(
        {
          designation: 'Charpente bois',
          unit: 'm²',
          quantity: Math.ceil(totalArea * 1.2),
          unitPrice: 18000,
          totalPrice: Math.ceil(totalArea * 1.2) * 18000
        },
        {
          designation: 'Couverture tôles bac acier',
          unit: 'm²',
          quantity: Math.ceil(totalArea * 1.2),
          unitPrice: 12000,
          totalPrice: Math.ceil(totalArea * 1.2) * 12000
        },
        {
          designation: 'Zinguerie complète',
          unit: 'ml',
          quantity: Math.ceil(totalArea * 0.4),
          unitPrice: 15000,
          totalPrice: Math.ceil(totalArea * 0.4) * 15000
        },
        {
          designation: 'Isolation toiture',
          unit: 'm²',
          quantity: Math.ceil(totalArea * 1.2),
          unitPrice: 8000,
          totalPrice: Math.ceil(totalArea * 1.2) * 8000
        }
      );
      break;
      
    case '6. Menuiseries extérieures':
      articles.push(
        {
          designation: 'Porte d\'entrée blindée',
          unit: 'u',
          quantity: 1,
          unitPrice: 450000,
          totalPrice: 450000
        },
        {
          designation: 'Fenêtres aluminium',
          unit: 'u',
          quantity: Math.max(8, Math.ceil(roomCount * 1.5)),
          unitPrice: 85000,
          totalPrice: Math.max(8, Math.ceil(roomCount * 1.5)) * 85000
        },
        {
          designation: 'Portes-fenêtres',
          unit: 'u',
          quantity: Math.max(2, Math.ceil(roomCount / 3)),
          unitPrice: 120000,
          totalPrice: Math.max(2, Math.ceil(roomCount / 3)) * 120000
        },
        {
          designation: 'Volets roulants',
          unit: 'u',
          quantity: Math.max(6, Math.ceil(roomCount * 1.2)),
          unitPrice: 65000,
          totalPrice: Math.max(6, Math.ceil(roomCount * 1.2)) * 65000
        }
      );
      break;
      
    case '7. Électricité':
      articles.push(
        {
          designation: 'Tableau électrique',
          unit: 'u',
          quantity: 1,
          unitPrice: 350000,
          totalPrice: 350000
        },
        {
          designation: 'Câblage général',
          unit: 'forfait',
          quantity: 1,
          unitPrice: totalArea * 10000,
          totalPrice: totalArea * 10000
        },
        {
          designation: 'Prises électriques',
          unit: 'u',
          quantity: Math.ceil(roomCount * 8),
          unitPrice: 8500,
          totalPrice: Math.ceil(roomCount * 8) * 8500
        },
        {
          designation: 'Points lumineux',
          unit: 'u',
          quantity: Math.ceil(roomCount * 4),
          unitPrice: 12000,
          totalPrice: Math.ceil(roomCount * 4) * 12000
        },
        {
          designation: 'Interrupteurs',
          unit: 'u',
          quantity: Math.ceil(roomCount * 6),
          unitPrice: 6500,
          totalPrice: Math.ceil(roomCount * 6) * 6500
        }
      );
      break;
      
    case '8. Plomberie sanitaire':
      const bathroomCount = Math.max(1, Math.ceil(roomCount / 3));
      articles.push(
        {
          designation: 'Réseau eau froide/chaude',
          unit: 'forfait',
          quantity: 1,
          unitPrice: totalArea * 8000,
          totalPrice: totalArea * 8000
        },
        {
          designation: 'Chauffe-eau 200L',
          unit: 'u',
          quantity: bathroomCount,
          unitPrice: 250000,
          totalPrice: bathroomCount * 250000
        },
        {
          designation: 'WC complets',
          unit: 'u',
          quantity: bathroomCount,
          unitPrice: 85000,
          totalPrice: bathroomCount * 85000
        },
        {
          designation: 'Lavabos avec robinetterie',
          unit: 'u',
          quantity: bathroomCount,
          unitPrice: 65000,
          totalPrice: bathroomCount * 65000
        },
        {
          designation: 'Douches italiennes',
          unit: 'u',
          quantity: bathroomCount,
          unitPrice: 180000,
          totalPrice: bathroomCount * 180000
        },
        {
          designation: 'Évier cuisine',
          unit: 'u',
          quantity: 1,
          unitPrice: 95000,
          totalPrice: 95000
        }
      );
      break;
      
    case '9. Carrelage et faïence':
      articles.push(
        {
          designation: 'Carrelage sols 60x60',
          unit: 'm²',
          quantity: Math.ceil(totalArea * 0.8),
          unitPrice: 12000,
          totalPrice: Math.ceil(totalArea * 0.8) * 12000
        },
        {
          designation: 'Faïence murale cuisine/SDB',
          unit: 'm²',
          quantity: Math.ceil(totalArea * 0.25),
          unitPrice: 15000,
          totalPrice: Math.ceil(totalArea * 0.25) * 15000
        },
        {
          designation: 'Plinthes carrelage',
          unit: 'ml',
          quantity: Math.ceil(totalArea * 0.5),
          unitPrice: 3500,
          totalPrice: Math.ceil(totalArea * 0.5) * 3500
        }
      );
      break;
      
    case '10. Menuiseries intérieures':
      const doorCount = Math.max(6, roomCount);
      articles.push(
        {
          designation: 'Portes intérieures isoplane',
          unit: 'u',
          quantity: doorCount,
          unitPrice: 45000,
          totalPrice: doorCount * 45000
        },
        {
          designation: 'Portes techniques',
          unit: 'u',
          quantity: Math.ceil(doorCount / 3),
          unitPrice: 55000,
          totalPrice: Math.ceil(doorCount / 3) * 55000
        },
        {
          designation: 'Placards intégrés',
          unit: 'ml',
          quantity: Math.max(4, Math.ceil(roomCount * 0.8)),
          unitPrice: 55000,
          totalPrice: Math.max(4, Math.ceil(roomCount * 0.8)) * 55000
        },
        {
          designation: 'Quincaillerie complète',
          unit: 'forfait',
          quantity: 1,
          unitPrice: doorCount * 8000,
          totalPrice: doorCount * 8000
        }
      );
      break;
      
    case '11. Peinture et finitions':
      const wallArea = totalArea * 2.5; // Estimation surface murale
      articles.push(
        {
          designation: 'Enduit intérieur',
          unit: 'm²',
          quantity: Math.ceil(wallArea),
          unitPrice: 3500,
          totalPrice: Math.ceil(wallArea) * 3500
        },
        {
          designation: 'Peinture intérieure',
          unit: 'm²',
          quantity: Math.ceil(wallArea),
          unitPrice: 4500,
          totalPrice: Math.ceil(wallArea) * 4500
        },
        {
          designation: 'Enduit extérieur crépi',
          unit: 'm²',
          quantity: Math.ceil(totalArea * 1.5),
          unitPrice: 5000,
          totalPrice: Math.ceil(totalArea * 1.5) * 5000
        },
        {
          designation: 'Peinture extérieure',
          unit: 'm²',
          quantity: Math.ceil(totalArea * 1.5),
          unitPrice: 5500,
          totalPrice: Math.ceil(totalArea * 1.5) * 5500
        }
      );
      break;
      
    case '12. Nettoyage final':
      articles.push(
        {
          designation: 'Évacuation gravats',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 300000,
          totalPrice: 300000
        },
        {
          designation: 'Nettoyage complet intérieur',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 200000,
          totalPrice: 200000
        },
        {
          designation: 'Nettoyage extérieur',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 150000,
          totalPrice: 150000
        },
        {
          designation: 'Aménagement abords',
          unit: 'forfait',
          quantity: 1,
          unitPrice: totalArea * 2000,
          totalPrice: totalArea * 2000
        }
      );
      break;
      
    case '13. Réception et livraison':
      articles.push(
        {
          designation: 'Essais installations',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 150000,
          totalPrice: 150000
        },
        {
          designation: 'Contrôle qualité',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 100000,
          totalPrice: 100000
        },
        {
          designation: 'Levée réserves',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 200000,
          totalPrice: 200000
        },
        {
          designation: 'Réception travaux',
          unit: 'forfait',
          quantity: 1,
          unitPrice: 50000,
          totalPrice: 50000
        }
      );
      break;
      
    default:
      // Phase non reconnue - estimation générique
      const estimatedCost = totalArea * 15000;
      articles.push({
        designation: `Travaux ${phaseName}`,
        unit: 'forfait',
        quantity: 1,
        unitPrice: estimatedCost,
        totalPrice: estimatedCost
      });
  }
  
  return articles;
}
