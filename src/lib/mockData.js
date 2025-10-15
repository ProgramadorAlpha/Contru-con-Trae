// Datos simulados para ConstructPro
export const mockProjects = [
  {
    id: 'proj-1',
    name: 'Proyecto Girassol',
    location: 'Lisboa',
    budget: 2850000,
    spent: 1985000,
    status: 'En Progreso',
    startDate: '2024-01-15',
    endDate: '2025-06-30',
    progress: 65,
    description: 'Residencial de lujo con 45 apartamentos',
    client: 'Inmobiliaria Lisboa Norte',
    architect: 'Arq. Maria Silva',
    contractor: 'Construtora Central'
  },
  {
    id: 'proj-2',
    name: 'Edificio Aurora',
    location: 'Porto',
    budget: 4200000,
    spent: 3150000,
    status: 'En Progreso',
    startDate: '2024-03-01',
    endDate: '2025-09-15',
    progress: 75,
    description: 'Edificio comercial y residencial de 18 pisos',
    client: 'Aurora Developments',
    architect: 'Arq. João Santos',
    contractor: 'Obras Modernas SA'
  },
  {
    id: 'proj-3',
    name: 'Complejo Verde',
    location: 'Braga',
    budget: 3750000,
    spent: 2250000,
    status: 'En Progreso',
    startDate: '2024-02-10',
    endDate: '2025-08-20',
    progress: 60,
    description: 'Complejo residencial sostenible con 60 viviendas',
    client: 'Green Living Solutions',
    architect: 'Arq. Ana Costa',
    contractor: 'EcoConstrutores Lda'
  },
  {
    id: 'proj-4',
    name: 'Marina Atlântico',
    location: 'Cascais',
    budget: 5500000,
    spent: 1650000,
    status: 'Planificación',
    startDate: '2024-08-01',
    endDate: '2026-12-31',
    progress: 30,
    description: 'Desarrollo turístico frente al mar',
    client: 'Marina Resorts Group',
    architect: 'Arq. Pedro Oliveira',
    contractor: 'Mar Construções'
  },
  {
    id: 'proj-5',
    name: 'Campus Universitario',
    location: 'Coimbra',
    budget: 6800000,
    spent: 1360000,
    status: 'Planificación',
    startDate: '2024-10-01',
    endDate: '2027-03-30',
    progress: 20,
    description: 'Nuevo campus universitario con laboratorios y aulas',
    client: 'Universidad de Coimbra',
    architect: 'Arq. Carlos Mendes',
    contractor: 'Educação Infraestruturas'
  },
  {
    id: 'proj-6',
    name: 'Parque Industrial Norte',
    location: 'Aveiro',
    budget: 8200000,
    spent: 820000,
    status: 'Planificación',
    startDate: '2025-01-15',
    endDate: '2027-12-31',
    progress: 10,
    description: 'Parque industrial logístico de 50.000m²',
    client: 'Norte Logística SA',
    architect: 'Arq. Rita Ferreira',
    contractor: 'Industrial Works'
  }
]

export const mockBudgetItems = [
  {
    id: 'budget-1',
    projectId: 'proj-1',
    category: 'Estructura',
    item: 'Hormigón armado',
    quantity: 1200,
    unit: 'm³',
    unitPrice: 85,
    total: 102000,
    actual: 98000,
    status: 'Completado'
  },
  {
    id: 'budget-2',
    projectId: 'proj-1',
    category: 'Albañilería',
    item: 'Ladrillo cerámico',
    quantity: 2500,
    unit: 'm²',
    unitPrice: 25,
    total: 62500,
    actual: 58000,
    status: 'En Progreso'
  },
  {
    id: 'budget-3',
    projectId: 'proj-1',
    category: 'Carpintería',
    item: 'Ventanas de aluminio',
    quantity: 180,
    unit: 'unidad',
    unitPrice: 450,
    total: 81000,
    actual: 0,
    status: 'Pendiente'
  }
]

export const mockTeamMembers = [
  {
    id: 'team-1',
    name: 'Carlos Rodriguez',
    role: 'Director de Proyecto',
    email: 'carlos@constructpro.com',
    phone: '+351 912 345 678',
    avatar: 'CR',
    status: 'Activo',
    projects: ['proj-1', 'proj-2']
  },
  {
    id: 'team-2',
    name: 'Ana Silva',
    role: 'Arquitecta',
    email: 'ana@constructpro.com',
    phone: '+351 923 456 789',
    avatar: 'AS',
    status: 'Activo',
    projects: ['proj-1', 'proj-3']
  },
  {
    id: 'team-3',
    name: 'João Santos',
    role: 'Ingeniero Civil',
    email: 'joao@constructpro.com',
    phone: '+351 934 567 890',
    avatar: 'JS',
    status: 'Activo',
    projects: ['proj-2', 'proj-4']
  }
]

export const mockDocuments = [
  {
    id: 'doc-1',
    name: 'Plano Arquitectónico - Proyecto Girassol',
    type: 'PDF',
    size: '2.5 MB',
    uploadDate: '2024-01-20',
    projectId: 'proj-1',
    category: 'Planos'
  },
  {
    id: 'doc-2',
    name: 'Presupuesto Detallado - Edificio Aurora',
    type: 'XLSX',
    size: '1.8 MB',
    uploadDate: '2024-03-15',
    projectId: 'proj-2',
    category: 'Presupuestos'
  },
  {
    id: 'doc-3',
    name: 'Contrato Principal - Complejo Verde',
    type: 'PDF',
    size: '3.2 MB',
    uploadDate: '2024-02-10',
    projectId: 'proj-3',
    category: 'Contratos'
  },
  {
    id: 'doc-4',
    name: 'Factura Materiales - Estructura Hormigón',
    type: 'PDF',
    size: '1.5 MB',
    uploadDate: '2024-03-20',
    projectId: 'proj-1',
    category: 'Facturas'
  }
]

// Datos de equipos
export const mockEquipment = [
  {
    id: 'equip-1',
    name: 'Excavadora CAT 320D',
    description: 'Excavadora hidráulica de cadenas con cucharón de 1.2m³',
    category: 'Maquinaria Pesada',
    type: 'Excavadoras',
    brand: 'Caterpillar',
    model: '320D',
    serialNumber: 'CAT320D-2024-001',
    purchaseDate: '2024-01-15',
    purchasePrice: 285000,
    currentValue: 265000,
    status: 'available',
    location: 'Depósito Central',
    specifications: {
      weight: '21500 kg',
      enginePower: '140 kW',
      bucketCapacity: '1.2 m³',
      maxDiggingDepth: '6.7 m'
    },
    maintenanceSchedule: {
      intervalType: 'hours',
      intervalValue: 250
    },
    images: [],
    documents: ['doc-1'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'equip-2',
    name: 'Grúa Móvil Liebherr LTM 1030',
    description: 'Grúa móvil todo terreno de 30 toneladas',
    category: 'Maquinaria Pesada',
    type: 'Grúas',
    brand: 'Liebherr',
    model: 'LTM 1030',
    serialNumber: 'LTM1030-2024-002',
    purchaseDate: '2024-02-01',
    purchasePrice: 420000,
    currentValue: 395000,
    status: 'in_use',
    location: 'Proyecto Girassol',
    specifications: {
      maxLoad: '30 t',
      boomLength: '30 m',
      maxHeight: '40 m',
      weight: '24000 kg'
    },
    maintenanceSchedule: {
      intervalType: 'months',
      intervalValue: 6
    },
    images: [],
    documents: ['doc-2'],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  },
  {
    id: 'equip-3',
    name: 'Compactadora Dynapac CC234',
    description: 'Compactadora de rodillos dobles para asfalto',
    category: 'Maquinaria Pesada',
    type: 'Compactadoras',
    brand: 'Dynapac',
    model: 'CC234',
    serialNumber: 'CC234-2024-003',
    purchaseDate: '2024-01-20',
    purchasePrice: 180000,
    currentValue: 170000,
    status: 'maintenance',
    location: 'Taller de Mantenimiento',
    specifications: {
      weight: '8500 kg',
      drumWidth: '1.38 m',
      vibrationFrequency: '42 Hz',
      enginePower: '55 kW'
    },
    maintenanceSchedule: {
      intervalType: 'hours',
      intervalValue: 500
    },
    images: [],
    documents: ['doc-3'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'equip-4',
    name: 'Generador CAT C15',
    description: 'Generador diésel de 500 kVA',
    category: 'Equipos Eléctricos',
    type: 'Generadores',
    brand: 'Caterpillar',
    model: 'C15',
    serialNumber: 'CATC15-2024-004',
    purchaseDate: '2024-03-01',
    purchasePrice: 95000,
    currentValue: 92000,
    status: 'available',
    location: 'Depósito Central',
    specifications: {
      power: '500 kVA',
      voltage: '400/230 V',
      frequency: '50 Hz',
      fuelConsumption: '120 L/h'
    },
    maintenanceSchedule: {
      intervalType: 'hours',
      intervalValue: 200
    },
    images: [],
    documents: ['doc-4'],
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  },
  {
    id: 'equip-5',
    name: 'Torre de Iluminación',
    description: 'Torre de iluminación móvil con 4 reflectores LED',
    category: 'Equipos de Seguridad',
    type: 'Iluminación',
    brand: 'Atlas Copco',
    model: 'HiLight V5+',
    serialNumber: 'HLV5-2024-005',
    purchaseDate: '2024-02-15',
    purchasePrice: 25000,
    currentValue: 24000,
    status: 'in_use',
    location: 'Proyecto Aurora',
    specifications: {
      height: '9 m',
      coverage: '5000 m²',
      power: '350 W',
      runtime: '45 h'
    },
    maintenanceSchedule: {
      intervalType: 'months',
      intervalValue: 3
    },
    images: [],
    documents: [],
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z'
  }
]

export const mockEquipmentCategories = [
  {
    id: 'cat-1',
    name: 'Maquinaria Pesada',
    description: 'Equipos pesados para excavación, carga y movimiento de tierras',
    icon: '🚜',
    subcategories: ['Excavadoras', 'Grúas', 'Bulldozers', 'Compactadoras', 'Cargadoras']
  },
  {
    id: 'cat-2',
    name: 'Equipos Eléctricos',
    description: 'Generadores, transformadores y equipos eléctricos',
    icon: '⚡',
    subcategories: ['Generadores', 'Transformadores', 'Cables', 'Paneles']
  },
  {
    id: 'cat-3',
    name: 'Equipos de Seguridad',
    description: 'Equipos para seguridad en obra y protección',
    icon: '🛡️',
    subcategories: ['Iluminación', 'Señalización', 'EPP', 'Sistemas de Vigilancia']
  },
  {
    id: 'cat-4',
    name: 'Herramientas',
    description: 'Herramientas manuales y eléctricas',
    icon: '🔧',
    subcategories: ['Herramientas Manuales', 'Herramientas Eléctricas', 'Equipos de Medición']
  }
]

export const mockEquipmentTypes = [
  { id: 'type-1', categoryId: 'cat-1', name: 'Excavadoras' },
  { id: 'type-2', categoryId: 'cat-1', name: 'Grúas' },
  { id: 'type-3', categoryId: 'cat-1', name: 'Compactadoras' },
  { id: 'type-4', categoryId: 'cat-2', name: 'Generadores' },
  { id: 'type-5', categoryId: 'cat-3', name: 'Iluminación' }
]

export const mockEquipmentAssignments = [
  {
    id: 'assign-1',
    equipmentId: 'equip-2',
    projectId: 'proj-1',
    assignedTo: 'team-1',
    assignedBy: 'team-1',
    startDate: '2024-03-01',
    endDate: null,
    status: 'active',
    notes: 'Asignada para montaje de estructura',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  },
  {
    id: 'assign-2',
    equipmentId: 'equip-5',
    projectId: 'proj-2',
    assignedTo: 'team-2',
    assignedBy: 'team-1',
    startDate: '2024-03-15',
    endDate: null,
    status: 'active',
    notes: 'Iluminación para trabajos nocturnos',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z'
  }
]

export const mockEquipmentMaintenance = [
  {
    id: 'maint-1',
    equipmentId: 'equip-3',
    type: 'preventive',
    description: 'Mantenimiento preventivo programado',
    scheduledDate: '2024-03-20',
    completedDate: null,
    status: 'scheduled',
    cost: 2500,
    technician: 'Mecánico Especializado',
    notes: 'Revisión completa del sistema hidráulico',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z'
  },
  {
    id: 'maint-2',
    equipmentId: 'equip-1',
    type: 'corrective',
    description: 'Reparación de cucharón',
    scheduledDate: '2024-02-15',
    completedDate: '2024-02-16',
    status: 'completed',
    cost: 1800,
    technician: 'Soldador Certificado',
    notes: 'Reparación de desgaste en cucharón',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-16T15:00:00Z'
  }
]
    projectId: 'proj-1',
    category: 'Facturas'
  },
  {
    id: 'doc-5',
    name: 'Planos Eléctricos - Edificio Aurora',
    type: 'DWG',
    size: '4.8 MB',
    uploadDate: '2024-03-25',
    projectId: 'proj-2',
    category: 'Planos'
  },
  {
    id: 'doc-6',
    name: 'Informe de Avance - Marzo 2024',
    type: 'DOCX',
    size: '2.1 MB',
    uploadDate: '2024-04-01',
    projectId: 'proj-1',
    category: 'Informes'
  },
  {
    id: 'doc-7',
    name: 'Fotos de Obra - Semana 12',
    type: 'ZIP',
    size: '15.6 MB',
    uploadDate: '2024-03-28',
    projectId: 'proj-2',
    category: 'General'
  },
  {
    id: 'doc-8',
    name: 'Certificado de Calidad - Acero',
    type: 'PDF',
    size: '890 KB',
    uploadDate: '2024-02-15',
    projectId: 'proj-3',
    category: 'General'
  }
]

export const mockReports = [
  {
    id: 'report-1',
    title: 'Resumen Financiero - Enero 2024',
    type: 'Resumen Financiero',
    date: '2024-02-01',
    projectId: 'all',
    data: {
      totalBudget: 31150000,
      totalSpent: 11070000,
      totalProjects: 6,
      activeProjects: 3
    }
  },
  {
    id: 'report-2',
    title: 'Análisis de Progreso - Q1 2024',
    type: 'Análisis de Progreso',
    date: '2024-04-01',
    projectId: 'all',
    data: {
      averageProgress: 43,
      onTimeProjects: 4,
      delayedProjects: 2
    }
  }
]

// Nuevos datos simulados para operaciones rápidas del Dashboard
export const mockIncomes = [
  // { id, projectId, amount, date, description, category }
]

export const mockExpenses = [
  // { id, projectId, amount, date, description, category }
]

export const mockVisits = [
  // { id, projectId, date, time, visitor, purpose, notes }
]

// Estadísticas de equipos para el dashboard
export const mockEquipmentStats = {
  totalEquipment: 5,
  availableEquipment: 2,
  inUseEquipment: 2,
  inMaintenanceEquipment: 1,
  retiredEquipment: 0,
  totalValue: 1000000,
  upcomingMaintenance: 2,
  overdueMaintenance: 0
}