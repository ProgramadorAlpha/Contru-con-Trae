// Servicio de clasificación automática de documentos
export interface DocumentClassification {
  category: string;
  tags: string[];
  confidence: number;
  projectPhase?: string;
  documentType: 'technical' | 'financial' | 'legal' | 'administrative' | 'visual';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ClassificationRule {
  id: string;
  name: string;
  conditions: {
    filename?: string[];
    extension?: string[];
    content?: string[];
    metadata?: Record<string, any>;
  };
  result: Partial<DocumentClassification>;
  weight: number;
}

export class DocumentClassificationService {
  private rules: ClassificationRule[] = [
    // Technical Documents
    {
      id: 'technical-plans',
      name: 'Planos Técnicos',
      conditions: {
        filename: ['plano', 'drawing', 'blueprint', 'sketch', 'layout', 'elevation', 'section', 'detail'],
        extension: ['dwg', 'dxf', 'pdf']
      },
      result: {
        category: 'Planos',
        tags: ['técnico', 'arquitectura', 'ingeniería', 'diseño'],
        documentType: 'technical',
        priority: 'high'
      },
      weight: 0.9
    },
    {
      id: 'structural-calculations',
      name: 'Cálculos Estructurales',
      conditions: {
        filename: ['cálculo', 'calculation', 'structural', 'cimentación', 'foundation', 'steel'],
        extension: ['xlsx', 'xls', 'pdf']
      },
      result: {
        category: 'Cálculos',
        tags: ['estructura', 'ingeniería', 'cálculo', 'técnico'],
        documentType: 'technical',
        priority: 'critical'
      },
      weight: 0.95
    },
    // Financial Documents
    {
      id: 'invoices',
      name: 'Facturas',
      conditions: {
        filename: ['factura', 'invoice', 'bill', 'payment', 'recibo'],
        extension: ['pdf', 'xlsx', 'xls']
      },
      result: {
        category: 'Facturas',
        tags: ['finanzas', 'pago', 'contabilidad', 'proveedor'],
        documentType: 'financial',
        priority: 'high'
      },
      weight: 0.9
    },
    {
      id: 'budgets',
      name: 'Presupuestos',
      conditions: {
        filename: ['presupuesto', 'budget', 'estimate', 'cost', 'pricing', 'quote'],
        extension: ['xlsx', 'xls', 'pdf']
      },
      result: {
        category: 'Presupuestos',
        tags: ['costos', 'finanzas', 'estimación', 'económico'],
        documentType: 'financial',
        priority: 'critical'
      },
      weight: 0.95
    },
    // Legal Documents
    {
      id: 'contracts',
      name: 'Contratos',
      conditions: {
        filename: ['contrato', 'contract', 'agreement', 'terms', 'conditions'],
        extension: ['pdf', 'docx', 'doc']
      },
      result: {
        category: 'Contratos',
        tags: ['legal', 'acuerdo', 'obligación', 'formal'],
        documentType: 'legal',
        priority: 'critical'
      },
      weight: 0.95
    },
    {
      id: 'permits',
      name: 'Permisos y Licencias',
      conditions: {
        filename: ['permiso', 'license', 'permit', 'autorización', 'approval'],
        extension: ['pdf']
      },
      result: {
        category: 'Permisos',
        tags: ['legal', 'administración', 'regulación', 'oficial'],
        documentType: 'legal',
        priority: 'critical'
      },
      weight: 0.9
    },
    // Administrative Documents
    {
      id: 'reports',
      name: 'Informes',
      conditions: {
        filename: ['informe', 'report', 'summary', 'analysis', 'progress', 'status'],
        extension: ['pdf', 'docx', 'xlsx']
      },
      result: {
        category: 'Informes',
        tags: ['seguimiento', 'progreso', 'administración', 'comunicación'],
        documentType: 'administrative',
        priority: 'medium'
      },
      weight: 0.85
    },
    {
      id: 'minutes',
      name: 'Actas de Reunión',
      conditions: {
        filename: ['acta', 'minutes', 'meeting', 'reunión'],
        extension: ['pdf', 'docx']
      },
      result: {
        category: 'Actas',
        tags: ['reunión', 'decisiones', 'administración', 'comunicación'],
        documentType: 'administrative',
        priority: 'medium'
      },
      weight: 0.9
    },
    // Visual Documents
    {
      id: 'photos',
      name: 'Fotografías',
      conditions: {
        filename: ['foto', 'photo', 'image', 'picture', 'obra', 'construction'],
        extension: ['jpg', 'jpeg', 'png', 'webp']
      },
      result: {
        category: 'Fotos',
        tags: ['visual', 'obra', 'evidencia', 'progreso'],
        documentType: 'visual',
        priority: 'low'
      },
      weight: 0.8
    },
    {
      id: 'videos',
      name: 'Videos',
      conditions: {
        extension: ['mp4', 'avi', 'mov', 'wmv']
      },
      result: {
        category: 'Videos',
        tags: ['visual', 'obra', 'documentación', 'progreso'],
        documentType: 'visual',
        priority: 'low'
      },
      weight: 0.8
    }
  ];

  // Project phase detection
  private projectPhases = [
    { phase: 'Pre-construcción', keywords: ['permiso', 'license', 'approval', 'planning', 'diseño'] },
    { phase: 'Cimentación', keywords: ['cimentación', 'foundation', 'excavation', 'soil'] },
    { phase: 'Estructura', keywords: ['estructura', 'structure', 'steel', 'hormigón', 'concrete'] },
    { phase: 'Acabados', keywords: ['acabado', 'finishing', 'painting', 'flooring', 'tiling'] },
    { phase: 'Entrega', keywords: ['entrega', 'delivery', 'handover', 'final', 'completion'] }
  ];

  classifyDocument(file: File, content?: string): DocumentClassification {
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    let bestMatch: DocumentClassification = {
      category: 'General',
      tags: [],
      confidence: 0.5,
      documentType: 'administrative',
      priority: 'low'
    };

    let maxScore = 0;

    // Apply classification rules
    for (const rule of this.rules) {
      const score = this.calculateRuleScore(rule, fileName, extension, content);
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = {
          ...bestMatch,
          ...rule.result,
          confidence: score
        };
      }
    }

    // Detect project phase
    const phase = this.detectProjectPhase(fileName, content);
    if (phase) {
      bestMatch.projectPhase = phase;
    }

    // Add additional tags based on content analysis
    const additionalTags = this.generateAdditionalTags(fileName, content);
    bestMatch.tags = [...new Set([...bestMatch.tags, ...additionalTags])];

    return bestMatch;
  }

  private calculateRuleScore(rule: ClassificationRule, fileName: string, extension: string, content?: string): number {
    let score = 0;
    let conditionsMet = 0;
    let totalConditions = 0;

    // Check filename conditions
    if (rule.conditions.filename) {
      totalConditions++;
      const filenameMatch = rule.conditions.filename.some(keyword => 
        fileName.includes(keyword.toLowerCase())
      );
      if (filenameMatch) {
        score += 0.6;
        conditionsMet++;
      }
    }

    // Check extension conditions
    if (rule.conditions.extension) {
      totalConditions++;
      const extensionMatch = rule.conditions.extension.some(ext => extension === ext);
      if (extensionMatch) {
        score += 0.4;
        conditionsMet++;
      }
    }

    // Check content conditions
    if (rule.conditions.content && content) {
      totalConditions++;
      const contentMatch = rule.conditions.content.some(keyword =>
        content.toLowerCase().includes(keyword.toLowerCase())
      );
      if (contentMatch) {
        score += 0.8;
        conditionsMet++;
      }
    }

    // Apply rule weight
    score *= rule.weight;

    // Boost score if all conditions are met
    if (totalConditions > 0 && conditionsMet === totalConditions) {
      score *= 1.2;
    }

    return Math.min(score, 1.0);
  }

  private detectProjectPhase(fileName: string, content?: string): string | undefined {
    for (const phase of this.projectPhases) {
      const hasPhaseKeyword = phase.keywords.some(keyword =>
        fileName.includes(keyword.toLowerCase()) ||
        (content && content.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      if (hasPhaseKeyword) {
        return phase.phase;
      }
    }
    return undefined;
  }

  private generateAdditionalTags(fileName: string, content?: string): string[] {
    const tags: string[] = [];
    
    // Priority indicators
    const priorityKeywords = {
      'urgente': 'urgente',
      'urgent': 'urgente',
      'important': 'importante',
      'critical': 'crítico',
      'final': 'final',
      'approved': 'aprobado',
      'revised': 'revisado'
    };

    Object.entries(priorityKeywords).forEach(([keyword, tag]) => {
      if (fileName.includes(keyword) || (content && content.toLowerCase().includes(keyword))) {
        tags.push(tag);
      }
    });

    // Project-specific tags
    const projectKeywords = {
      'residencial': 'residencial',
      'comercial': 'comercial',
      'industrial': 'industrial',
      'infraestructura': 'infraestructura',
      'renovación': 'renovación',
      'nueva': 'nueva-construcción'
    };

    Object.entries(projectKeywords).forEach(([keyword, tag]) => {
      if (fileName.includes(keyword) || (content && content.toLowerCase().includes(keyword))) {
        tags.push(tag);
      }
    });

    return tags;
  }

  // Get classification rules for a specific category
  getRulesForCategory(category: string): ClassificationRule[] {
    return this.rules.filter(rule => rule.result.category === category);
  }

  // Add custom classification rule
  addCustomRule(rule: ClassificationRule): void {
    this.rules.push(rule);
    // Sort by weight (descending)
    this.rules.sort((a, b) => b.weight - a.weight);
  }

  // Get all available categories
  getAvailableCategories(): string[] {
    const categories = [...new Set(this.rules.map(rule => rule.result.category).filter(Boolean))];
    return categories.length > 0 ? categories : ['General', 'Planos', 'Contratos', 'Facturas', 'Presupuestos', 'Informes', 'Fotos'];
  }

  // Get suggested categories for manual classification
  getSuggestions(fileName: string, extension: string, content?: string): Array<{
    category: string;
    confidence: number;
    tags: string[];
  }> {
    const suggestions: Array<{ category: string; confidence: number; tags: string[] }> = [];
    
    for (const rule of this.rules) {
      const score = this.calculateRuleScore(rule, fileName, extension, content);
      if (score > 0.3) { // Minimum confidence threshold
        suggestions.push({
          category: rule.result.category || 'General',
          confidence: score,
          tags: rule.result.tags || []
        });
      }
    }

    // Sort by confidence (descending)
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }
}

// Export singleton instance
export const documentClassificationService = new DocumentClassificationService();