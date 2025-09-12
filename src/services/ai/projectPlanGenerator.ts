import { aiConfig } from './aiConfig';

export interface ProjectPlan {
  phases: Array<{
    name: string;
    subTasks: Array<{
      name: string;
      tradeSkill: string;
      deliverables: string[];
      duration: string;
      risks: string[];
      materials: Array<{
        name: string;
        quantity: string;
        unit: string;
      }>;
      tools: string[];
      workforce: string;
      activities: string[];
    }>;
    duration: string;
    risks: string[];
  }>;
}

class ProjectPlanGenerator {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = aiConfig.openaiApiKey || '';
  }

  async generatePlanFromPrompt(projectPrompt: string): Promise<ProjectPlan> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured, using mock plan');
      return this.getMockProjectPlan(projectPrompt);
    }

    try {
      const systemPrompt = `Tu es un expert en gestion de projets BTP en Afrique francophone. 
      Génère un plan de projet détaillé basé sur la description fournie.

      INSTRUCTIONS IMPORTANTES :
      - Adapte les phases aux spécificités de la localisation (climat, matériaux locaux, réglementations)
      - Inclus les corps de métier appropriés pour chaque région
      - Considère les contraintes logistiques locales
      - Prévois les risques spécifiques à la zone géographique
      - Utilise les durées réalistes pour le contexte africain

      Retourne UNIQUEMENT un JSON valide avec cette structure exacte :
      {
        "phases": [
          {
            "name": "Nom de la phase",
            "duration": "X semaines/mois",
            "risks": ["risque1", "risque2"],
            "subTasks": [
              {
                "name": "Nom de la sous-tâche",
                "tradeSkill": "Corps de métier",
                "deliverables": ["livrable1", "livrable2"],
                "duration": "X jours/semaines",
                "risks": ["risque spécifique"],
                "materials": [
                  {"name": "Ciment", "quantity": "50", "unit": "sacs"},
                  {"name": "Fer à béton", "quantity": "2", "unit": "tonnes"}
                ],
                "tools": ["Bétonnière", "Vibreur", "Niveau laser"],
                "workforce": "2 maçons + 1 manœuvre",
                "activities": ["Coulage béton", "Ferraillage", "Coffrage"]
              }
            ]
          }
        ]
      }`;

      const userPrompt = `Description du projet : ${projectPrompt}

      Génère un plan TRÈS DÉTAILLÉ depuis les études préliminaires jusqu'à la livraison clés en main.
      
      EXIGENCES DE DÉTAIL :
      - 12-15 phases minimum (études, hangar provisoire, terrassement, fondation, élévation, charpente, électricité, peinture, plomberie, carrelage, menuiserie, climatisation, assainissement, finitions)
      - Pour chaque tâche : matériaux précis avec quantités, outils spécialisés, main d'œuvre détaillée
      - Activités concrètes (excavation, coffrage, ferraillage, coulage, etc.)
      - Spécifications techniques (diamètres tubes, sections câbles, types de briques)
      
      Exemple de niveau de détail attendu :
      - Matériaux : "Briques de 20cm", "Fer à béton ø12mm", "Tube PVC ø75mm", "Câble TH2.5mm²"
      - Outils : "Bétonnière 350L", "Vibreur béton", "Scie circulaire", "Poste à souder"
      - Main d'œuvre : "2 maçons + 1 coffreur + 2 manœuvres"
      - Activités : "Excavation manuelle", "Pose ferraillage", "Coulage béton C25/30"`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Nettoyer le contenu pour extraire le JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from OpenAI');
      }

      const projectPlan = JSON.parse(jsonMatch[0]);
      return projectPlan;

    } catch (error) {
      console.error('Erreur génération plan OpenAI:', error);
      return this.getMockProjectPlan(projectPrompt);
    }
  }

  private getMockProjectPlan(projectPrompt: string): ProjectPlan {
    // Extraire des informations basiques du prompt
    const location = this.extractLocation(projectPrompt);
    
    const basePhases: ProjectPlan = {
      phases: [
        {
          name: "Études préliminaires et autorisations",
          duration: "4-6 semaines",
          risks: ["Délais administratifs", "Modifications réglementaires"],
          subTasks: [
            {
              name: "Étude de faisabilité technique",
              tradeSkill: "Bureau d'études",
              deliverables: ["Rapport de faisabilité", "Plans préliminaires"],
              duration: "2 semaines",
              risks: ["Contraintes du terrain"],
              materials: [
                {name: "Papier technique", quantity: "50", unit: "feuilles"},
                {name: "Matériel topographique", quantity: "1", unit: "kit"}
              ],
              tools: ["Théodolite", "Niveau laser", "Mètre ruban"],
              workforce: "1 ingénieur + 1 topographe",
              activities: ["Relevé topographique", "Analyse contraintes", "Calculs préliminaires"]
            },
            {
              name: "Demande de permis de construire",
              tradeSkill: "Architecte",
              deliverables: ["Dossier de permis", "Plans architecturaux"],
              duration: "3-4 semaines",
              risks: ["Refus administratif", "Demandes de modifications"],
              materials: [
                {name: "Papier calque", quantity: "20", unit: "feuilles"},
                {name: "Encre traceur", quantity: "4", unit: "cartouches"}
              ],
              tools: ["Logiciel CAO", "Traceur A0", "Scanner"],
              workforce: "1 architecte + 1 dessinateur",
              activities: ["Conception plans", "Calculs surfaces", "Dépôt mairie"]
            },
            {
              name: "Étude géotechnique",
              tradeSkill: "Géotechnicien",
              deliverables: ["Rapport géotechnique", "Recommandations fondations"],
              duration: "1 semaine",
              risks: ["Sol inadapté", "Nappe phréatique"],
              materials: [
                {name: "Tubes de prélèvement", quantity: "10", unit: "unités"},
                {name: "Carburant sondage", quantity: "50", unit: "litres"}
              ],
              tools: ["Foreuse géotechnique", "Pénétromètre", "Laboratoire analyse"],
              workforce: "1 géotechnicien + 1 sondeur + 1 aide",
              activities: ["Sondages terrain", "Prélèvements échantillons", "Analyses laboratoire"]
            }
          ]
        },
        {
          name: "Préparation du terrain",
          duration: "2-3 semaines",
          risks: ["Conditions météorologiques", "Accès difficile"],
          subTasks: [
            {
              name: "Implantation et bornage",
              tradeSkill: "Géomètre",
              deliverables: ["Plan d'implantation", "Bornes définitives"],
              duration: "2 jours",
              risks: ["Litiges de voisinage"],
              materials: [
                {name: "Bornes béton", quantity: "8", unit: "unités"},
                {name: "Piquets bois", quantity: "20", unit: "unités"},
                {name: "Cordeau traceur", quantity: "200", unit: "mètres"}
              ],
              tools: ["Théodolite", "GPS topographique", "Niveau optique"],
              workforce: "1 géomètre + 1 aide-topographe",
              activities: ["Relevé GPS", "Implantation axes", "Pose bornes"]
            },
            {
              name: "Terrassement et nivellement",
              tradeSkill: "Terrassier",
              deliverables: ["Terrain nivelé", "Évacuation déblais"],
              duration: "1-2 semaines",
              risks: ["Pluies importantes", "Découverte d'obstacles"],
              materials: [
                {name: "Grave concassée 0/31.5", quantity: "50", unit: "m³"},
                {name: "Sable compactage", quantity: "20", unit: "m³"},
                {name: "Carburant engins", quantity: "200", unit: "litres"}
              ],
              tools: ["Pelle mécanique 20T", "Compacteur 2T", "Niveau laser rotatif"],
              workforce: "1 conducteur pelle + 1 conducteur compacteur + 2 manœuvres",
              activities: ["Décapage terre végétale", "Excavation fouilles", "Compactage grave"]
            },
            {
              name: "Réseaux provisoires",
              tradeSkill: "Électricien/Plombier",
              deliverables: ["Alimentation électrique chantier", "Point d'eau"],
              duration: "3 jours",
              risks: ["Retard des concessionnaires"],
              materials: [
                {name: "Câble RO2V 4x16mm²", quantity: "50", unit: "mètres"},
                {name: "Tube PVC ø32mm", quantity: "30", unit: "mètres"},
                {name: "Compteur provisoire", quantity: "1", unit: "unité"}
              ],
              tools: ["Perceuse à percussion", "Dénudeur câble", "Clé à molette"],
              workforce: "1 électricien + 1 plombier",
              activities: ["Raccordement EDF", "Pose compteur", "Branchement eau"]
            }
          ]
        },
        {
          name: "Fondations et gros œuvre",
          duration: "6-8 semaines",
          risks: ["Intempéries", "Qualité du béton", "Approvisionnement matériaux"],
          subTasks: [
            {
              name: "Excavation et fondations",
              tradeSkill: "Maçon",
              deliverables: ["Fondations coulées", "Chaînages"],
              duration: "2 semaines",
              risks: ["Infiltrations d'eau", "Qualité du béton"]
            },
            {
              name: "Élévation des murs",
              tradeSkill: "Maçon",
              deliverables: ["Murs porteurs", "Cloisons"],
              duration: "3-4 semaines",
              risks: ["Approvisionnement parpaings", "Respect des plans"]
            },
            {
              name: "Charpente et couverture",
              tradeSkill: "Charpentier/Couvreur",
              deliverables: ["Charpente posée", "Couverture étanche"],
              duration: "2 semaines",
              risks: ["Saison des pluies", "Qualité des matériaux"]
            }
          ]
        },
        {
          name: "Second œuvre",
          duration: "8-10 semaines",
          risks: ["Coordination des corps d'état", "Approvisionnement équipements"],
          subTasks: [
            {
              name: "Électricité",
              tradeSkill: "Électricien",
              deliverables: ["Câblage complet", "Tableau électrique", "Points lumineux"],
              duration: "2-3 semaines",
              risks: ["Coupures de courant", "Normes électriques"]
            },
            {
              name: "Plomberie et sanitaires",
              tradeSkill: "Plombier",
              deliverables: ["Réseaux eau/évacuation", "Sanitaires posés"],
              duration: "2-3 semaines",
              risks: ["Pression d'eau insuffisante", "Qualité des canalisations"]
            },
            {
              name: "Menuiseries",
              tradeSkill: "Menuisier",
              deliverables: ["Portes et fenêtres", "Placards intégrés"],
              duration: "2 semaines",
              risks: ["Délais de fabrication", "Transport"]
            },
            {
              name: "Climatisation",
              tradeSkill: "Frigoriste",
              deliverables: ["Unités installées", "Réseaux frigorifiques"],
              duration: "1-2 semaines",
              risks: ["Disponibilité équipements", "Techniciens qualifiés"]
            }
          ]
        },
        {
          name: "Finitions",
          duration: "4-6 semaines",
          risks: ["Qualité des finitions", "Retards livraisons"],
          subTasks: [
            {
              name: "Revêtements sols et murs",
              tradeSkill: "Carreleur/Peintre",
              deliverables: ["Carrelage posé", "Peintures finies"],
              duration: "3-4 semaines",
              risks: ["Qualité carrelage", "Conditions de séchage"]
            },
            {
              name: "Cuisine équipée",
              tradeSkill: "Cuisiniste",
              deliverables: ["Cuisine installée", "Électroménager"],
              duration: "1 semaine",
              risks: ["Mesures incorrectes", "Livraison équipements"]
            },
            {
              name: "Nettoyage et finitions",
              tradeSkill: "Équipe de finition",
              deliverables: ["Nettoyage complet", "Retouches"],
              duration: "1 semaine",
              risks: ["Détails oubliés"]
            }
          ]
        },
        {
          name: "Aménagements extérieurs",
          duration: "2-3 semaines",
          risks: ["Conditions météo", "Accès matériaux"],
          subTasks: [
            {
              name: "Forage et château d'eau",
              tradeSkill: "Foreur",
              deliverables: ["Forage fonctionnel", "Château d'eau installé"],
              duration: "1 semaine",
              risks: ["Nappe phréatique introuvable", "Qualité de l'eau"]
            },
            {
              name: "Aménagement cour et clôture",
              tradeSkill: "Maçon/Jardinier",
              deliverables: ["Cour aménagée", "Clôture posée"],
              duration: "1-2 semaines",
              risks: ["Drainage insuffisant"]
            }
          ]
        }
      ]
    };

    // Adapter selon la localisation
    if (location.includes('Dakar') || location.includes('Sénégal')) {
      basePhases.phases[2].risks.push('Saison des pluies (juin-octobre)');
      basePhases.phases[5].subTasks[0].risks.push('Réglementation sénégalaise');
    }

    return basePhases;
  }

  private extractLocation(prompt: string): string {
    const locationMatch = prompt.match(/(?:à|dans|sur)\s+([A-Za-zÀ-ÿ\s]+?)(?:[,.]|$)/i);
    return locationMatch ? locationMatch[1].trim() : '';
  }
}

export const projectPlanGenerator = new ProjectPlanGenerator();
export { ProjectPlanGenerator };
