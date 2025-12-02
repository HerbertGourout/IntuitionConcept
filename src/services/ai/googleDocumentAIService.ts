// Service Google Document AI - OCR Premium pour documents BTP

// Types pour les réponses Google Document AI
interface DocumentAIEntity {
  type: string;
  confidence: number;
  mentionText?: string;
  textAnchor?: {
    textSegments: Array<{
      startIndex: string;
      endIndex: string;
    }>;
  };
}

interface DocumentAITable {
  bodyRows?: Array<{
    cells: Array<{
      layout?: {
        textAnchor?: {
          textSegments: Array<{
            startIndex: string;
            endIndex: string;
          }>;
        };
      };
    }>;
  }>;
}

interface DocumentAIDocument {
  text?: string;
  entities?: DocumentAIEntity[];
  pages?: Array<{
    tables?: DocumentAITable[];
  }>;
}

export interface InvoiceData {
  supplierName: string;
  supplierAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  currency: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  confidence: number;
}

export interface ContractData {
  contractType: string;
  parties: Array<{
    name: string;
    role: string;
    address: string;
  }>;
  contractDate: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  keyTerms: string[];
  deliverables: string[];
  paymentTerms: string;
  confidence: number;
}

export interface PlanData {
  planType: string;
  scale: string;
  dimensions: {
    length: number;
    width: number;
    area: number;
  };
  rooms: Array<{
    name: string;
    area: number;
    dimensions: string;
  }>;
  materials: string[];
  annotations: string[];
  confidence: number;
}

// Type générique pour les données extraites
export type ExtractedData = InvoiceData | ContractData | PlanData | Record<string, unknown>;

export interface DocumentAIResponse {
  content: string;
  model: string;
  usage: {
    pages_processed: number;
    processing_time: number;
  };
  cost: number;
  confidence: number;
  extractedData?: ExtractedData;
}

export class GoogleDocumentAIService {
  private apiKey: string;
  private projectId: string;
  private location = 'us'; // ou 'eu' selon votre région
  private baseUrl: string;

  // IDs des processeurs spécialisés (à configurer dans Google Cloud)
  private processors = {
    invoice: 'projects/{PROJECT_ID}/locations/us/processors/{INVOICE_PROCESSOR_ID}',
    contract: 'projects/{PROJECT_ID}/locations/us/processors/{CONTRACT_PROCESSOR_ID}',
    form: 'projects/{PROJECT_ID}/locations/us/processors/{FORM_PROCESSOR_ID}'
  };

  constructor() {
    // Configuration depuis les variables d'environnement
    this.apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || '';
    this.projectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || '';
    this.baseUrl = `https://documentai.googleapis.com/v1`;
    
    this.validateConfiguration();
  }

  /**
   * Validation de la configuration du service
   */
  private validateConfiguration(): void {
    const missingConfig: string[] = [];
    
    if (!this.apiKey) {
      missingConfig.push('VITE_GOOGLE_CLOUD_API_KEY');
    }
    
    if (!this.projectId) {
      missingConfig.push('VITE_GOOGLE_CLOUD_PROJECT_ID');
    }
    
    if (missingConfig.length > 0) {
      console.info(
        `ℹ️ Google Document AI: Service désactivé (clés manquantes: ${missingConfig.join(', ')})`
      );
    } else {
      console.log('✅ Google Document AI: Configuration valide');
    }
  }

  /**
   * Extraction de données de facture avec processeur spécialisé
   */
  async extractInvoiceData(base64Content: string): Promise<DocumentAIResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Google Cloud requise');
    }

    const processorName = this.processors.invoice.replace('{PROJECT_ID}', this.projectId);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.baseUrl}/${processorName}:process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rawDocument: {
            content: base64Content,
            mimeType: 'application/pdf'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Document AI: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;
      
      // Extraction des entités spécifiques aux factures
      const invoiceData = this.parseInvoiceEntities(data.document);
      
      return {
        content: JSON.stringify(invoiceData),
        model: 'document-ai-invoice-processor',
        usage: {
          pages_processed: data.document?.pages?.length || 1,
          processing_time: processingTime
        },
        cost: this.calculateCost(data.document?.pages?.length || 1, 'invoice'),
        confidence: invoiceData.confidence,
        extractedData: invoiceData
      };

    } catch (error) {
      console.error('Erreur extraction facture:', error);
      throw error;
    }
  }

  /**
   * Analyse de contrat avec processeur spécialisé
   */
  async analyzeContract(base64Content: string): Promise<DocumentAIResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Google Cloud requise');
    }

    const processorName = this.processors.contract.replace('{PROJECT_ID}', this.projectId);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.baseUrl}/${processorName}:process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rawDocument: {
            content: base64Content,
            mimeType: 'application/pdf'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Document AI: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;
      
      const contractData = this.parseContractEntities(data.document);
      
      return {
        content: JSON.stringify(contractData),
        model: 'document-ai-contract-processor',
        usage: {
          pages_processed: data.document?.pages?.length || 1,
          processing_time: processingTime
        },
        cost: this.calculateCost(data.document?.pages?.length || 1, 'contract'),
        confidence: contractData.confidence,
        extractedData: contractData
      };

    } catch (error) {
      console.error('Erreur analyse contrat:', error);
      throw error;
    }
  }

  /**
   * Lecture de plan technique avec OCR générique haute précision
   */
  async readTechnicalPlan(base64Content: string): Promise<DocumentAIResponse> {
    if (!this.apiKey) {
      throw new Error('Clé API Google Cloud requise');
    }

    const processorName = this.processors.form.replace('{PROJECT_ID}', this.projectId);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.baseUrl}/${processorName}:process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rawDocument: {
            content: base64Content,
            mimeType: 'image/jpeg'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur Document AI: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;
      
      const planData = this.parsePlanEntities(data.document);
      
      return {
        content: JSON.stringify(planData),
        model: 'document-ai-form-processor',
        usage: {
          pages_processed: data.document?.pages?.length || 1,
          processing_time: processingTime
        },
        cost: this.calculateCost(data.document?.pages?.length || 1, 'form'),
        confidence: planData.confidence,
        extractedData: planData
      };

    } catch (error) {
      console.error('Erreur lecture plan:', error);
      throw error;
    }
  }

  /**
   * OCR générique haute précision
   */
  async performOCR(base64Content: string, mimeType: string): Promise<DocumentAIResponse> {
    console.log(`🔍 OCR Document AI - Type: ${mimeType}`);
    
    // Choisir le processeur selon le type de fichier
    if (mimeType.includes('pdf')) {
      // Pour les PDFs, utiliser le processeur de formulaire
      console.log('📄 Utilisation du processeur PDF optimisé');
      return await this.readTechnicalPlan(base64Content);
    } else if (mimeType.includes('image/')) {
      // Pour les images, utiliser le processeur de formulaire
      console.log('🖼️ Utilisation du processeur d\'image optimisé');
      return await this.readTechnicalPlan(base64Content);
    } else {
      // Fallback pour autres types
      console.warn(`⚠️ Type MIME non optimisé: ${mimeType}, utilisation du processeur par défaut`);
      return await this.readTechnicalPlan(base64Content);
    }
  }

  /**
   * Parsing des entités de facture
   */
  private parseInvoiceEntities(document: DocumentAIDocument): InvoiceData {
    const entities = document.entities || [];
    const text = document.text || '';
    
    const invoiceData: InvoiceData = {
      supplierName: '',
      supplierAddress: '',
      invoiceNumber: '',
      invoiceDate: '',
      dueDate: '',
      totalAmount: 0,
      taxAmount: 0,
      netAmount: 0,
      currency: 'EUR',
      lineItems: [],
      confidence: 0
    };

    let totalConfidence = 0;
    let entityCount = 0;

    entities.forEach((entity: DocumentAIEntity) => {
      const value = this.extractTextValue(entity, text);
      const confidence = entity.confidence || 0;
      
      totalConfidence += confidence;
      entityCount++;

      switch (entity.type) {
        case 'supplier_name':
          invoiceData.supplierName = value;
          break;
        case 'supplier_address':
          invoiceData.supplierAddress = value;
          break;
        case 'invoice_id':
          invoiceData.invoiceNumber = value;
          break;
        case 'invoice_date':
          invoiceData.invoiceDate = value;
          break;
        case 'due_date':
          invoiceData.dueDate = value;
          break;
        case 'total_amount':
          invoiceData.totalAmount = this.parseAmount(value);
          break;
        case 'tax_amount':
          invoiceData.taxAmount = this.parseAmount(value);
          break;
        case 'net_amount':
          invoiceData.netAmount = this.parseAmount(value);
          break;
        case 'currency':
          invoiceData.currency = value;
          break;
      }
    });

    // Extraction des lignes d'articles
    const tables = document.pages?.[0]?.tables || [];
    tables.forEach((table: DocumentAITable) => {
      const rows = table.bodyRows || [];
      rows.forEach((row) => {
        const cells = row.cells || [];
        if (cells.length >= 4) {
          // Extraction simplifiée pour éviter les erreurs de type
          const descriptions = cells.map(cell => 
            cell.layout?.textAnchor?.textSegments?.[0] ? 
            text.substring(
              parseInt(cell.layout.textAnchor.textSegments[0].startIndex) || 0,
              parseInt(cell.layout.textAnchor.textSegments[0].endIndex) || 0
            ).trim() : ''
          );
          
          invoiceData.lineItems.push({
            description: descriptions[0] || '',
            quantity: parseFloat(descriptions[1]) || 1,
            unitPrice: this.parseAmount(descriptions[2]),
            totalPrice: this.parseAmount(descriptions[3])
          });
        }
      });
    });

    invoiceData.confidence = entityCount > 0 ? (totalConfidence / entityCount) * 100 : 50;
    
    return invoiceData;
  }

  /**
   * Parsing des entités de contrat
   */
  private parseContractEntities(document: DocumentAIDocument): ContractData {
    const entities = document.entities || [];
    const text = document.text || '';
    
    const contractData: ContractData = {
      contractType: '',
      parties: [],
      contractDate: '',
      startDate: '',
      endDate: '',
      totalValue: 0,
      keyTerms: [],
      deliverables: [],
      paymentTerms: '',
      confidence: 0
    };

    let totalConfidence = 0;
    let entityCount = 0;

    entities.forEach((entity: DocumentAIEntity) => {
      const value = this.extractTextValue(entity, text);
      const confidence = entity.confidence || 0;
      
      totalConfidence += confidence;
      entityCount++;

      switch (entity.type) {
        case 'contract_type':
          contractData.contractType = value;
          break;
        case 'contract_date':
          contractData.contractDate = value;
          break;
        case 'start_date':
          contractData.startDate = value;
          break;
        case 'end_date':
          contractData.endDate = value;
          break;
        case 'total_value':
          contractData.totalValue = this.parseAmount(value);
          break;
        case 'payment_terms':
          contractData.paymentTerms = value;
          break;
      }
    });

    contractData.confidence = entityCount > 0 ? (totalConfidence / entityCount) * 100 : 50;
    
    return contractData;
  }

  /**
   * Parsing des entités de plan
   */
  private parsePlanEntities(document: DocumentAIDocument): PlanData {
    const text = document.text || '';
    
    const planData: PlanData = {
      planType: 'floor_plan',
      scale: '',
      dimensions: {
        length: 0,
        width: 0,
        area: 0
      },
      rooms: [],
      materials: [],
      annotations: [],
      confidence: 85 // Document AI est très précis sur l'OCR
    };

    // Extraction des dimensions
    const dimensionRegex = /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/g;
    let match;
    while ((match = dimensionRegex.exec(text)) !== null) {
      const length = parseFloat(match[1].replace(',', '.'));
      const width = parseFloat(match[2].replace(',', '.'));
      if (length > planData.dimensions.length) {
        planData.dimensions.length = length;
        planData.dimensions.width = width;
        planData.dimensions.area = length * width;
      }
    }

    // Extraction des surfaces
    const areaRegex = /(\d+(?:[.,]\d+)?)\s*m[²2]/g;
    const areas: number[] = [];
    while ((match = areaRegex.exec(text)) !== null) {
      areas.push(parseFloat(match[1].replace(',', '.')));
    }

    // Extraction des pièces
    const roomKeywords = [
      'chambre', 'salon', 'cuisine', 'salle de bain', 'wc', 'bureau',
      'garage', 'cave', 'cellier', 'hall', 'couloir', 'entrée'
    ];

    const lines = text.split('\n');
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      roomKeywords.forEach(keyword => {
        if (lowerLine.includes(keyword)) {
          const areaMatch = line.match(/(\d+(?:[.,]\d+)?)\s*m[²2]/);
          if (areaMatch) {
            planData.rooms.push({
              name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
              area: parseFloat(areaMatch[1].replace(',', '.')),
              dimensions: this.extractDimensionsFromLine(line)
            });
          }
        }
      });
    });

    // Extraction de l'échelle
    const scaleMatch = text.match(/1[/:](\d+)/);
    if (scaleMatch) {
      planData.scale = `1/${scaleMatch[1]}`;
    }

    return planData;
  }

  /**
   * Extraction de valeur textuelle depuis une entité
   */
  private extractTextValue(entity: DocumentAIEntity, fullText: string): string {
    if (entity.textAnchor?.textSegments) {
      const segment = entity.textAnchor.textSegments[0];
      const startIndex = parseInt(segment.startIndex) || 0;
      const endIndex = parseInt(segment.endIndex) || startIndex;
      return fullText.substring(startIndex, endIndex).trim();
    }
    return entity.mentionText || '';
  }

  /**
   * Parsing des montants monétaires
   */
  private parseAmount(value: string): number {
    const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  }

  /**
   * Extraction des dimensions depuis une ligne
   */
  private extractDimensionsFromLine(line: string): string {
    const dimMatch = line.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/);
    return dimMatch ? `${dimMatch[1]}x${dimMatch[2]}` : '';
  }

  /**
   * Calcul du coût basé sur le type de processeur et nombre de pages
   */
  private calculateCost(pages: number, processorType: string): number {
    const costs = {
      invoice: 0.50, // $0.50 per page pour processeur facture
      contract: 1.00, // $1.00 per page pour processeur contrat
      form: 0.30     // $0.30 per page pour processeur formulaire
    };
    
    return pages * (costs[processorType as keyof typeof costs] || 0.50);
  }

  /**
   * Vérification de santé du service
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey || !this.projectId) {
      console.warn('🔧 Google Document AI: Configuration manquante');
      return false;
    }

    try {
      // Test simple avec un petit document
      const testDoc = btoa('Test document'); // Base64 simple
      console.log('🔍 Test de connectivité Google Document AI...');
      await this.performOCR(testDoc, 'text/plain');
      console.log('✅ Google Document AI: Service opérationnel');
      return true;
    } catch (error) {
      console.error('❌ Google Document AI: Service indisponible', error);
      return false;
    }
  }
}

export const googleDocumentAIService = new GoogleDocumentAIService();
export default googleDocumentAIService;
