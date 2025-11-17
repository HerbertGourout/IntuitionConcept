import { QuoteType, StructuralStudyStatus } from '../types/StructuredQuote';

export interface LegalClause {
  id: string;
  title: string;
  content: string;
  category: 'estimative' | 'definitive' | 'general' | 'responsibility' | 'revision';
  mandatory: boolean;
}

export class LegalClausesService {
  /**
   * Génère la clause pour un devis estimatif
   */
  static generateEstimativeClause(uncertaintyMargin: number, studyStatus: StructuralStudyStatus): LegalClause {
    const content = `
CLAUSE DEVIS ESTIMATIF

Le présent devis est de nature ESTIMATIVE et ne constitue pas un engagement ferme et définitif sur les montants indiqués.

1. NATURE DU DEVIS
   Ce devis a été établi SANS étude structurale complète (béton armé). Les quantités et montants relatifs aux fondations, à la structure porteuse et au ferraillage sont basés sur des ratios standards et l'expérience de projets similaires.

2. MARGE D'INCERTITUDE
   Une marge d'incertitude de ±${uncertaintyMargin}% est appliquée sur l'ensemble du projet. Cette marge reflète l'absence d'étude technique détaillée.

3. STATUT DE L'ÉTUDE STRUCTURALE
   ${this.getStudyStatusText(studyStatus)}

4. CONDITIONS DE RÉVISION
   Le montant définitif sera établi après réalisation de l'étude structurale complète comprenant :
   - Étude géotechnique du sol
   - Calculs de structure (béton armé)
   - Plans d'exécution détaillés
   - Métrés précis des quantités

5. ENGAGEMENT DU CLIENT
   Le Client reconnaît avoir été informé du caractère estimatif de ce devis et accepte que le montant final puisse varier dans la limite de la marge d'incertitude indiquée.

6. TRANSFORMATION EN DEVIS DÉFINITIF
   Ce devis pourra être transformé en devis définitif après :
   - Réalisation complète de l'étude structurale
   - Validation des plans par un ingénieur structure agréé
   - Établissement des métrés définitifs

Date d'établissement : ${new Date().toLocaleDateString('fr-FR')}
Validité : 30 jours à compter de la date d'établissement
    `.trim();

    return {
      id: 'estimative_clause',
      title: 'Clause Devis Estimatif',
      content,
      category: 'estimative',
      mandatory: true
    };
  }

  /**
   * Génère la clause pour un devis définitif
   */
  static generateDefinitiveClause(engineerName?: string, studyDate?: string): LegalClause {
    const content = `
CLAUSE DEVIS DÉFINITIF

Le présent devis est de nature DÉFINITIVE et constitue un engagement ferme sur les montants et quantités indiqués.

1. NATURE DU DEVIS
   Ce devis a été établi sur la base d'une étude structurale complète réalisée par un ingénieur structure qualifié.

2. ÉTUDE STRUCTURALE
   ${engineerName ? `Ingénieur responsable : ${engineerName}` : 'Étude réalisée par un bureau d\'études agréé'}
   ${studyDate ? `Date de l'étude : ${new Date(studyDate).toLocaleDateString('fr-FR')}` : ''}
   
   L'étude comprend :
   - Étude géotechnique du sol avec sondages
   - Calculs de dimensionnement béton armé
   - Plans d'exécution détaillés et cotés
   - Métrés précis des quantités
   - Notes de calcul validées

3. GARANTIE DES MONTANTS
   Les montants indiqués sont fermes et définitifs, sous réserve :
   - Du respect des hypothèses de l'étude structurale
   - De l'absence de modification du projet
   - De conditions de sol conformes à l'étude géotechnique
   - De l'absence de découvertes imprévues en cours de chantier

4. MARGE DE SÉCURITÉ
   Une marge de sécurité technique de ±10% est intégrée pour tenir compte des aléas normaux de chantier.

5. VALIDITÉ
   Ce devis définitif est valable 90 jours à compter de sa date d'établissement.

6. DOCUMENTS ANNEXES
   Les documents suivants font partie intégrante de ce devis :
   - Plans d'exécution structure
   - Note de calcul béton armé
   - Rapport géotechnique
   - Cahier des charges techniques

Date d'établissement : ${new Date().toLocaleDateString('fr-FR')}
    `.trim();

    return {
      id: 'definitive_clause',
      title: 'Clause Devis Définitif',
      content,
      category: 'definitive',
      mandatory: true
    };
  }

  /**
   * Génère la clause de révision de prix
   */
  static generatePriceRevisionClause(indexationType: 'BT01' | 'TP01' | 'fixed' = 'BT01'): LegalClause {
    const indexInfo = {
      'BT01': 'Indice BT01 (Bâtiment tous corps d\'état)',
      'TP01': 'Indice TP01 (Travaux publics)',
      'fixed': 'Prix ferme et non révisable'
    };

    const content = indexationType === 'fixed' ? `
CLAUSE PRIX FERME

1. NATURE DES PRIX
   Les prix du présent devis sont FERMES et NON RÉVISABLES pendant toute la durée du chantier.

2. DURÉE DE VALIDITÉ
   Cette clause de prix ferme s'applique pour une durée maximale de 12 mois à compter de la signature du contrat.

3. DÉPASSEMENT DE DÉLAI
   En cas de dépassement de la durée de 12 mois pour des raisons non imputables à l'Entreprise, une révision de prix pourra être négociée.
    `.trim() : `
CLAUSE DE RÉVISION DE PRIX

1. PRINCIPE
   Les prix du présent devis sont révisables selon la formule de révision basée sur l'indice ${indexInfo[indexationType]}.

2. FORMULE DE RÉVISION
   P = P₀ × (0,15 + 0,85 × In/I₀)
   
   Où :
   - P = Prix révisé
   - P₀ = Prix initial du devis
   - In = Indice du mois n (mois de facturation)
   - I₀ = Indice du mois de signature du contrat
   - 0,15 = Part fixe (15%)
   - 0,85 = Part variable (85%)

3. INDICES DE RÉFÉRENCE
   Les indices utilisés sont ceux publiés par l'Institut National de la Statistique.
   Indice de référence : ${indexationType}

4. APPLICATION
   La révision s'applique à chaque situation de travaux, sur la base des indices connus à la date de facturation.

5. PLAFONNEMENT
   La révision de prix est plafonnée à ±20% du montant initial du contrat.

6. PUBLICATION DES INDICES
   En cas de non-publication des indices, l'indice du dernier mois publié sera utilisé provisoirement.
    `.trim();

    return {
      id: 'price_revision_clause',
      title: 'Clause de Révision de Prix',
      content,
      category: 'revision',
      mandatory: false
    };
  }

  /**
   * Génère la clause de responsabilité
   */
  static generateResponsibilityClause(quoteType: QuoteType): LegalClause {
    const content = `
CLAUSE DE RESPONSABILITÉ

1. RESPONSABILITÉ DE L'ENTREPRISE
   L'Entreprise s'engage à réaliser les travaux dans les règles de l'art et conformément aux normes en vigueur.
   
   ${quoteType === 'definitive' ? `
   L'Entreprise garantit :
   - La conformité des ouvrages aux plans d'exécution validés
   - Le respect des calculs de structure établis
   - La qualité des matériaux et de la mise en œuvre
   - La solidité et la pérennité des ouvrages
   ` : `
   ATTENTION : Ce devis étant de nature estimative, l'Entreprise ne peut garantir les quantités et montants indiqués tant qu'une étude structurale complète n'a pas été réalisée.
   `}

2. RESPONSABILITÉ DU CLIENT
   Le Client s'engage à :
   - Fournir un terrain libre d'accès et viabilisé
   - Obtenir toutes les autorisations administratives nécessaires
   - Respecter le calendrier de paiement convenu
   - Permettre l'accès au chantier dans les conditions normales

3. ASSURANCES
   L'Entreprise dispose des assurances obligatoires :
   - Responsabilité Civile Professionnelle
   - Garantie Décennale (pour les travaux de structure)
   - Assurance Tous Risques Chantier

4. GARANTIES
   ${quoteType === 'definitive' ? `
   - Garantie de parfait achèvement : 1 an
   - Garantie biennale (équipements) : 2 ans
   - Garantie décennale (structure) : 10 ans
   ` : `
   Les garanties légales s'appliqueront après transformation du devis estimatif en devis définitif et réalisation des travaux.
   `}

5. LITIGES
   En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.
   À défaut, les tribunaux compétents seront ceux du lieu d'exécution des travaux.

6. FORCE MAJEURE
   Aucune des parties ne sera tenue responsable en cas de force majeure (catastrophes naturelles, guerres, épidémies, etc.).
    `.trim();

    return {
      id: 'responsibility_clause',
      title: 'Clause de Responsabilité',
      content,
      category: 'responsibility',
      mandatory: true
    };
  }

  /**
   * Génère les clauses générales
   */
  static generateGeneralClauses(): LegalClause {
    const content = `
CLAUSES GÉNÉRALES

1. VALIDITÉ DU DEVIS
   Ce devis est valable 30 jours à compter de sa date d'émission. Au-delà, les prix et conditions devront être revus.

2. CONDITIONS DE PAIEMENT
   Sauf mention contraire, les conditions de paiement sont les suivantes :
   - 30% à la signature du contrat (acompte)
   - 40% à mi-parcours des travaux
   - 30% à la réception des travaux

3. DÉLAIS D'EXÉCUTION
   Les délais indiqués sont donnés à titre indicatif et peuvent être ajustés en fonction :
   - Des conditions météorologiques
   - De la disponibilité des matériaux
   - Des autorisations administratives
   - Des modifications demandées par le Client

4. MODIFICATIONS
   Toute modification du projet en cours d'exécution fera l'objet d'un avenant au présent devis, avec ajustement des prix et délais.

5. RÉCEPTION DES TRAVAUX
   La réception des travaux se fera contradictoirement entre le Client et l'Entreprise.
   Un procès-verbal de réception sera établi, mentionnant les éventuelles réserves.

6. PÉNALITÉS DE RETARD
   En cas de retard imputable à l'Entreprise, des pénalités de 0,1% du montant total par jour de retard pourront être appliquées, plafonnées à 10% du montant total.

7. RÉSILIATION
   En cas de manquement grave de l'une des parties, le contrat pourra être résilié de plein droit après mise en demeure restée sans effet pendant 15 jours.

8. CONFIDENTIALITÉ
   Les parties s'engagent à maintenir la confidentialité sur toutes les informations échangées dans le cadre de ce projet.

9. PROPRIÉTÉ INTELLECTUELLE
   Les plans, études et documents techniques restent la propriété de l'Entreprise et ne peuvent être utilisés pour d'autres projets sans autorisation écrite.

10. DROIT APPLICABLE
    Le présent devis est soumis au droit camerounais. Tout litige relève de la compétence des tribunaux camerounais.
    `.trim();

    return {
      id: 'general_clauses',
      title: 'Clauses Générales',
      content,
      category: 'general',
      mandatory: true
    };
  }

  /**
   * Génère toutes les clauses pour un devis
   */
  static generateAllClauses(
    quoteType: QuoteType,
    uncertaintyMargin: number,
    studyStatus: StructuralStudyStatus,
    engineerName?: string,
    studyDate?: string,
    priceRevisionType: 'BT01' | 'TP01' | 'fixed' = 'fixed'
  ): LegalClause[] {
    const clauses: LegalClause[] = [];

    // Clause principale selon le type de devis
    if (quoteType === 'preliminary') {
      clauses.push(this.generateEstimativeClause(uncertaintyMargin, studyStatus));
    } else {
      clauses.push(this.generateDefinitiveClause(engineerName, studyDate));
    }

    // Clauses communes
    clauses.push(this.generateResponsibilityClause(quoteType));
    clauses.push(this.generatePriceRevisionClause(priceRevisionType));
    clauses.push(this.generateGeneralClauses());

    return clauses;
  }

  /**
   * Texte du statut d'étude pour la clause estimative
   */
  private static getStudyStatusText(status: StructuralStudyStatus): string {
    switch (status) {
      case 'none':
        return 'Aucune étude structurale n\'a été réalisée à ce jour. Les provisions sont basées sur des ratios standards.';
      case 'pending':
        return 'Une étude structurale est prévue mais n\'a pas encore débuté. Les provisions restent estimatives.';
      case 'in_progress':
        return 'Une étude structurale est en cours de réalisation. Les provisions seront affinées à l\'issue de cette étude.';
      case 'completed':
        return 'L\'étude structurale est complétée. Ce devis peut être transformé en devis définitif.';
      default:
        return 'Statut de l\'étude non précisé.';
    }
  }

  /**
   * Formate les clauses pour l'export PDF
   */
  static formatClausesForPDF(clauses: LegalClause[]): string {
    return clauses
      .map(clause => `
═══════════════════════════════════════════════════════════════
${clause.title.toUpperCase()}
═══════════════════════════════════════════════════════════════

${clause.content}

      `)
      .join('\n\n');
  }
}

export default LegalClausesService;
