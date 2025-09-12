import { aiConfig } from './aiConfig';

export interface DetailedProjectPlan {
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

class DetailedProjectPlanGenerator {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = aiConfig.openaiApiKey || '';
  }

  async generateDetailedPlan(projectPrompt: string): Promise<DetailedProjectPlan> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured, using detailed mock plan');
      return this.getDetailedMockPlan(projectPrompt);
    }

    try {
      const systemPrompt = `Tu es un expert en gestion de projets BTP en Afrique francophone avec 20 ans d'expérience. 
      Génère un plan de projet ULTRA-DÉTAILLÉ basé sur la description fournie.

      INSTRUCTIONS CRITIQUES :
      - Minimum 15 phases exhaustives (études, hangar provisoire, terrassement, fondation, élévation, charpente, électricité, peinture, plomberie, carrelage, menuiserie, climatisation, fosse septique, finitions, imprévus)
      - Chaque phase doit avoir 3-8 sous-tâches détaillées
      - Pour CHAQUE sous-tâche, spécifier OBLIGATOIREMENT :
        * Matériaux précis avec quantités exactes et unités
        * Outils spécialisés complets
        * Main d'œuvre détaillée (nombre + spécialité)
        * Activités concrètes étape par étape
      - Spécifications techniques précises (diamètres, sections, types, marques)
      - Adaptation aux contraintes locales (climat, matériaux disponibles, réglementations)

      Retourne UNIQUEMENT un JSON valide avec cette structure exacte :
      {
        "phases": [
          {
            "name": "Phase détaillée",
            "duration": "X semaines",
            "risks": ["risque1", "risque2"],
            "subTasks": [
              {
                "name": "Tâche précise",
                "tradeSkill": "Corps de métier spécialisé",
                "deliverables": ["livrable1", "livrable2"],
                "duration": "X jours",
                "risks": ["risque spécifique"],
                "materials": [
                  {"name": "Ciment CPJ 42.5", "quantity": "50", "unit": "sacs de 50kg"},
                  {"name": "Fer à béton ø12mm", "quantity": "2.5", "unit": "tonnes"},
                  {"name": "Gravier 5/15", "quantity": "15", "unit": "m³"}
                ],
                "tools": ["Bétonnière 350L", "Vibreur béton", "Niveau laser rotatif"],
                "workforce": "2 maçons qualifiés + 1 coffreur + 2 manœuvres",
                "activities": ["Préparation coffrage", "Mise en place ferraillage", "Coulage béton C25/30", "Vibration", "Lissage surface"]
              }
            ]
          }
        ]
      }`;

      const userPrompt = `Description du projet : ${projectPrompt}

      Génère un plan ULTRA-DÉTAILLÉ de 15+ phases minimum depuis les études jusqu'à la livraison.
      
      EXIGENCES ABSOLUES :
      - Phases complètes : Études structurelles, Hangar provisoire, Terrassement, Fondation, Élévation (R+1, R+2), Charpente/Toiture, Électricité, Peinture, Plomberie, Carrelage/Staf, Menuiserie bois massif, Climatisation, Fosse septique/Bâche eau, Finitions, Outils/Imprévus
      - Matériaux avec quantités précises : "Briques de 20cm : 5000 unités", "Tube PVC ø75mm : 50 mètres"
      - Outils spécialisés : "Scie circulaire 1800W", "Poste à souder 200A", "Compresseur 50L"
      - Main d'œuvre détaillée : "2 électriciens + 1 aide électricien"
      - Activités step-by-step : "Traçage saignées", "Pose gaines", "Tirage câbles", "Raccordements"`;

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
      console.error('Erreur génération plan détaillé OpenAI:', error);
      return this.getDetailedMockPlan(projectPrompt);
    }
  }

  private getDetailedMockPlan(projectPrompt: string): DetailedProjectPlan {
    const location = this.extractLocation(projectPrompt);
    
    return {
      phases: [
        {
          name: "1. Études structurelles",
          duration: "4-6 semaines",
          risks: ["Délais administratifs", "Sol inadapté"],
          subTasks: [
            {
              name: "Étude topographique",
              tradeSkill: "Géomètre-topographe",
              deliverables: ["Plan topographique", "Nivellement terrain"],
              duration: "3 jours",
              risks: ["Conditions météo"],
              materials: [
                {name: "Bornes béton", quantity: "8", unit: "unités"},
                {name: "Piquets bois", quantity: "20", unit: "unités"},
                {name: "Peinture marquage", quantity: "2", unit: "bombes"}
              ],
              tools: ["Théodolite", "GPS topographique", "Niveau optique", "Mire graduée"],
              workforce: "1 géomètre + 1 aide-topographe",
              activities: ["Reconnaissance terrain", "Implantation points", "Relevé altimétrique", "Calculs coordonnées"]
            },
            {
              name: "Étude géotechnique",
              tradeSkill: "Géotechnicien",
              deliverables: ["Rapport géotechnique", "Recommandations fondations"],
              duration: "1 semaine",
              risks: ["Nappe phréatique", "Sol rocheux"],
              materials: [
                {name: "Tubes PVC ø100mm", quantity: "20", unit: "mètres"},
                {name: "Carburant diesel", quantity: "100", unit: "litres"},
                {name: "Échantillons laboratoire", quantity: "15", unit: "unités"}
              ],
              tools: ["Foreuse géotechnique", "Pénétromètre dynamique", "Tarière manuelle"],
              workforce: "1 géotechnicien + 1 sondeur + 1 laborantin",
              activities: ["Sondages reconnaissance", "Prélèvements échantillons", "Tests laboratoire", "Analyse portance"]
            },
            {
              name: "Étude de structure béton armé",
              tradeSkill: "Ingénieur structure",
              deliverables: ["Plans ferraillage", "Note de calcul", "Métrés béton"],
              duration: "2 semaines",
              risks: ["Normes sismiques", "Charges importantes"],
              materials: [
                {name: "Logiciel calcul", quantity: "1", unit: "licence"},
                {name: "Papier calque A0", quantity: "50", unit: "feuilles"},
                {name: "Encre traceur", quantity: "4", unit: "cartouches"}
              ],
              tools: ["Logiciel Robot", "Traceur A0", "Calculatrice scientifique"],
              workforce: "1 ingénieur structure + 1 dessinateur",
              activities: ["Modélisation 3D", "Calculs descente charges", "Dimensionnement ferraillage", "Plans exécution"]
            },
            {
              name: "Demande autorisation construire",
              tradeSkill: "Architecte",
              deliverables: ["Permis de construire", "Dossier complet"],
              duration: "3-4 semaines",
              risks: ["Refus administration", "Modifications demandées"],
              materials: [
                {name: "Dossiers papier", quantity: "5", unit: "exemplaires"},
                {name: "Plans couleur", quantity: "20", unit: "planches A3"},
                {name: "Frais dossier", quantity: "1", unit: "forfait"}
              ],
              tools: ["Scanner A0", "Logiciel CAO", "Reliure spirale"],
              workforce: "1 architecte + 1 assistant administratif",
              activities: ["Constitution dossier", "Plans réglementaires", "Dépôt mairie", "Suivi instruction"]
            }
          ]
        },
        {
          name: "2. Construction hangar provisoire",
          duration: "1 semaine",
          risks: ["Intempéries", "Vol matériaux"],
          subTasks: [
            {
              name: "Pose structure métallique",
              tradeSkill: "Charpentier métallique",
              deliverables: ["Ossature complète", "Ancrage au sol"],
              duration: "2 jours",
              risks: ["Vent fort", "Nivellement incorrect"],
              materials: [
                {name: "Profilés IPE 120", quantity: "12", unit: "barres de 6m"},
                {name: "Cornières 50x50x5", quantity: "20", unit: "barres de 6m"},
                {name: "Boulons M12", quantity: "100", unit: "unités"},
                {name: "Platines d'ancrage", quantity: "8", unit: "unités"}
              ],
              tools: ["Poste à souder 200A", "Meuleuse 230mm", "Perceuse à colonne", "Niveau laser"],
              workforce: "2 charpentiers métalliques + 1 soudeur + 1 manœuvre",
              activities: ["Traçage implantation", "Assemblage au sol", "Levage structure", "Soudure définitive", "Contrôle verticalité"]
            },
            {
              name: "Pose couverture tôles",
              tradeSkill: "Couvreur",
              deliverables: ["Toiture étanche", "Évacuation eaux pluviales"],
              duration: "2 jours",
              risks: ["Glissade toiture", "Étanchéité défaillante"],
              materials: [
                {name: "Tôles bac acier", quantity: "150", unit: "m²"},
                {name: "Vis autoforeuses", quantity: "500", unit: "unités"},
                {name: "Faîtage métallique", quantity: "20", unit: "mètres"},
                {name: "Gouttière PVC", quantity: "30", unit: "mètres"}
              ],
              tools: ["Visseuse à chocs", "Scie circulaire métaux", "Pince à sertir", "Harnais sécurité"],
              workforce: "2 couvreurs + 1 aide couvreur",
              activities: ["Pose pannes", "Fixation tôles", "Pose faîtage", "Installation gouttières", "Test étanchéité"]
            }
          ]
        },
        {
          name: "3. Terrassement et stabilité sol",
          duration: "2-3 semaines",
          risks: ["Saison pluies", "Découverte réseaux"],
          subTasks: [
            {
              name: "Fouille de fondation",
              tradeSkill: "Terrassier",
              deliverables: ["Fouilles aux cotes", "Évacuation déblais"],
              duration: "1 semaine",
              risks: ["Éboulement", "Eau dans fouilles"],
              materials: [
                {name: "Carburant diesel", quantity: "300", unit: "litres"},
                {name: "Planches coffrage", quantity: "50", unit: "unités 4m"},
                {name: "Poteaux étaiement", quantity: "20", unit: "unités"}
              ],
              tools: ["Pelle mécanique 20T", "Dumper 3T", "Pompe à eau", "Laser de chantier"],
              workforce: "1 conducteur pelle + 1 conducteur dumper + 2 manœuvres",
              activities: ["Décapage terre végétale", "Excavation mécanique", "Réglage fond fouille", "Blindage parois", "Épuisement eau"]
            },
            {
              name: "Mise en grave concassé",
              tradeSkill: "Terrassier",
              deliverables: ["Hérisson drainant", "Plateforme stable"],
              duration: "3 jours",
              risks: ["Qualité grave", "Compactage insuffisant"],
              materials: [
                {name: "Grave concassée 0/31.5", quantity: "80", unit: "m³"},
                {name: "Géotextile", quantity: "200", unit: "m²"},
                {name: "Carburant compacteur", quantity: "50", unit: "litres"}
              ],
              tools: ["Compacteur vibrant 2T", "Niveau laser rotatif", "Règle de maçon 4m"],
              workforce: "1 conducteur compacteur + 2 manœuvres",
              activities: ["Pose géotextile", "Épandage grave", "Arrosage matériau", "Compactage par couches", "Contrôle épaisseur"]
            },
            {
              name: "Remblais compactés",
              tradeSkill: "Terrassier",
              deliverables: ["Remblais périphériques", "Évacuation surplus"],
              duration: "4 jours",
              risks: ["Tassements différentiels", "Matériaux inadaptés"],
              materials: [
                {name: "Tout-venant 0/80", quantity: "60", unit: "m³"},
                {name: "Sable compactage", quantity: "30", unit: "m³"},
                {name: "Eau arrosage", quantity: "20", unit: "m³"}
              ],
              tools: ["Compacteur à pneus", "Arrosoir automatique", "Densitomètre"],
              workforce: "1 conducteur + 3 manœuvres",
              activities: ["Sélection matériaux", "Mise en œuvre couches", "Arrosage optimal", "Compactage contrôlé", "Essais densité"]
            }
          ]
        }
        // ... Les autres phases seraient ajoutées de manière similaire
      ]
    };
  }

  private extractLocation(prompt: string): string {
    const locationMatch = prompt.match(/(?:à|dans|sur)\s+([A-Za-zÀ-ÿ\s]+?)(?:[,.]|$)/i);
    return locationMatch ? locationMatch[1].trim() : '';
  }
}

export const detailedProjectPlanGenerator = new DetailedProjectPlanGenerator();
export { DetailedProjectPlanGenerator };
