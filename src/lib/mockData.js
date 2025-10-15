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
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    fullName: 'Carlos Rodriguez',
    name: 'Carlos Rodriguez', // backward compatibility
    documentId: '12345678A',
    birthDate: '1985-03-15',
    avatar: 'CR',
    email: 'carlos@constructpro.com',
    phone: '+351 912 345 678',
    address: 'Rua das Flores, 123, Lisboa',
    emergencyContact: {
      name: 'Maria Rodriguez',
      phone: '+351 912 345 679',
      relationship: 'Esposa'
    },
    employeeNumber: 'EMP001',
    role: 'Director de Proyecto',
    department: 'Gestión de Proyectos',
    departmentId: 'dept-1',
    hireDate: '2020-01-15',
    salary: 65000,
    status: 'Activo',
    skills: ['Gestión de Proyectos', 'Liderazgo', 'AutoCAD', 'MS Project'],
    certifications: [
      {
        id: 'cert-1',
        name: 'PMP - Project Management Professional',
        issuer: 'PMI',
        issueDate: '2021-06-15',
        expiryDate: '2024-06-15',
        certificateNumber: 'PMP123456',
        status: 'Válido'
      }
    ],
    availability: 85,
    performance: 92,
    projects: ['proj-1', 'proj-2'],
    createdAt: '2020-01-15T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z'
  },
  {
    id: 'team-2',
    firstName: 'Ana',
    lastName: 'Silva',
    fullName: 'Ana Silva',
    name: 'Ana Silva', // backward compatibility
    documentId: '87654321B',
    birthDate: '1990-07-22',
    avatar: 'AS',
    email: 'ana@constructpro.com',
    phone: '+351 923 456 789',
    address: 'Avenida da Liberdade, 456, Lisboa',
    emergencyContact: {
      name: 'Pedro Silva',
      phone: '+351 923 456 790',
      relationship: 'Hermano'
    },
    employeeNumber: 'EMP002',
    role: 'Arquitecta Senior',
    department: 'Arquitectura',
    departmentId: 'dept-2',
    hireDate: '2019-09-01',
    salary: 55000,
    status: 'Activo',
    skills: ['AutoCAD', 'Revit', 'SketchUp', 'Diseño Sostenible'],
    certifications: [
      {
        id: 'cert-2',
        name: 'Arquitecto Colegiado',
        issuer: 'Ordem dos Arquitectos',
        issueDate: '2018-12-01',
        certificateNumber: 'ARQ789',
        status: 'Válido'
      }
    ],
    availability: 90,
    performance: 88,
    projects: ['proj-1', 'proj-3'],
    createdAt: '2019-09-01T10:00:00Z',
    updatedAt: '2024-03-18T14:20:00Z'
  },
  {
    id: 'team-3',
    firstName: 'João',
    lastName: 'Santos',
    fullName: 'João Santos',
    name: 'João Santos', // backward compatibility
    documentId: '11223344C',
    birthDate: '1987-11-10',
    avatar: 'JS',
    email: 'joao@constructpro.com',
    phone: '+351 934 567 890',
    address: 'Rua do Comércio, 789, Porto',
    emergencyContact: {
      name: 'Isabel Santos',
      phone: '+351 934 567 891',
      relationship: 'Madre'
    },
    employeeNumber: 'EMP003',
    role: 'Ingeniero Civil',
    department: 'Ingeniería',
    departmentId: 'dept-3',
    hireDate: '2021-03-10',
    salary: 48000,
    status: 'Activo',
    skills: ['Cálculo Estructural', 'SAP2000', 'AutoCAD', 'Gestión de Obra'],
    certifications: [
      {
        id: 'cert-3',
        name: 'Ingeniero Civil Colegiado',
        issuer: 'Ordem dos Engenheiros',
        issueDate: '2020-05-15',
        certificateNumber: 'ENG456',
        status: 'Válido'
      }
    ],
    availability: 95,
    performance: 85,
    projects: ['proj-2', 'proj-4'],
    createdAt: '2021-03-10T10:00:00Z',
    updatedAt: '2024-03-19T11:45:00Z'
  },
  {
    id: 'team-4',
    firstName: 'Maria',
    lastName: 'García',
    fullName: 'Maria García',
    name: 'Maria García',
    documentId: '55667788D',
    birthDate: '1992-05-18',
    avatar: 'MG',
    email: 'maria@constructpro.com',
    phone: '+351 945 678 901',
    address: 'Praça do Rossio, 321, Lisboa',
    emergencyContact: {
      name: 'Luis García',
      phone: '+351 945 678 902',
      relationship: 'Padre'
    },
    employeeNumber: 'EMP004',
    role: 'Ingeniera Civil Junior',
    department: 'Ingeniería',
    departmentId: 'dept-3',
    hireDate: '2023-01-15',
    salary: 35000,
    status: 'Activo',
    skills: ['AutoCAD', 'Revit', 'Cálculo Básico', 'Topografía'],
    certifications: [],
    availability: 100,
    performance: 78,
    projects: ['proj-3'],
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-03-20T09:15:00Z'
  },
  {
    id: 'team-5',
    firstName: 'Roberto',
    lastName: 'Hernández',
    fullName: 'Roberto Hernández',
    name: 'Roberto Hernández',
    documentId: '99887766E',
    birthDate: '1980-12-03',
    avatar: 'RH',
    email: 'roberto@constructpro.com',
    phone: '+351 956 789 012',
    address: 'Rua Augusta, 654, Lisboa',
    emergencyContact: {
      name: 'Carmen Hernández',
      phone: '+351 956 789 013',
      relationship: 'Esposa'
    },
    employeeNumber: 'EMP005',
    role: 'Maestro de Obra',
    department: 'Construcción',
    departmentId: 'dept-4',
    hireDate: '2018-06-20',
    salary: 42000,
    status: 'Activo',
    skills: ['Supervisión de Obra', 'Seguridad Laboral', 'Lectura de Planos', 'Gestión de Equipos'],
    certifications: [
      {
        id: 'cert-4',
        name: 'Técnico en Prevención de Riesgos',
        issuer: 'IEFP',
        issueDate: '2019-03-10',
        expiryDate: '2025-03-10',
        certificateNumber: 'TPR789',
        status: 'Válido'
      }
    ],
    availability: 80,
    performance: 93,
    projects: ['proj-1', 'proj-2'],
    createdAt: '2018-06-20T10:00:00Z',
    updatedAt: '2024-03-21T16:00:00Z'
  },
  {
    id: 'team-6',
    firstName: 'Ana',
    lastName: 'López',
    fullName: 'Ana López',
    name: 'Ana López',
    documentId: '44556677F',
    birthDate: '1988-09-25',
    avatar: 'AL',
    email: 'ana.lopez@constructpro.com',
    phone: '+351 967 890 123',
    address: 'Alameda dos Oceanos, 987, Lisboa',
    emergencyContact: {
      name: 'Miguel López',
      phone: '+351 967 890 124',
      relationship: 'Hermano'
    },
    employeeNumber: 'EMP006',
    role: 'Coordinadora de Proyectos',
    department: 'Gestión de Proyectos',
    departmentId: 'dept-1',
    hireDate: '2020-11-05',
    salary: 52000,
    status: 'Vacaciones',
    skills: ['Coordinación', 'MS Project', 'Comunicación', 'Planificación'],
    certifications: [],
    availability: 0,
    performance: 87,
    projects: ['proj-4', 'proj-5'],
    createdAt: '2020-11-05T10:00:00Z',
    updatedAt: '2024-03-15T12:30:00Z'
  },
  {
    id: 'team-7',
    firstName: 'Diego',
    lastName: 'Ramírez',
    fullName: 'Diego Ramírez',
    name: 'Diego Ramírez',
    documentId: '33445566G',
    birthDate: '1995-02-14',
    avatar: 'DR',
    email: 'diego@constructpro.com',
    phone: '+351 978 901 234',
    address: 'Rua da Prata, 147, Porto',
    emergencyContact: {
      name: 'Sofia Ramírez',
      phone: '+351 978 901 235',
      relationship: 'Madre'
    },
    employeeNumber: 'EMP007',
    role: 'Operario Especializado',
    department: 'Construcción',
    departmentId: 'dept-4',
    hireDate: '2022-08-01',
    salary: 28000,
    status: 'Activo',
    skills: ['Soldadura', 'Carpintería', 'Albañilería', 'Electricidad Básica'],
    certifications: [
      {
        id: 'cert-5',
        name: 'Soldador Certificado',
        issuer: 'IEFP',
        issueDate: '2021-11-20',
        expiryDate: '2026-11-20',
        certificateNumber: 'SOLD123',
        status: 'Válido'
      }
    ],
    availability: 100,
    performance: 82,
    projects: ['proj-2', 'proj-3'],
    createdAt: '2022-08-01T10:00:00Z',
    updatedAt: '2024-03-22T08:45:00Z'
  },
  {
    id: 'team-8',
    firstName: 'Lucía',
    lastName: 'Torres',
    fullName: 'Lucía Torres',
    name: 'Lucía Torres',
    documentId: '22334455H',
    birthDate: '1991-06-08',
    avatar: 'LT',
    email: 'lucia@constructpro.com',
    phone: '+351 989 012 345',
    address: 'Avenida 24 de Julho, 258, Lisboa',
    emergencyContact: {
      name: 'Carlos Torres',
      phone: '+351 989 012 346',
      relationship: 'Esposo'
    },
    employeeNumber: 'EMP008',
    role: 'Diseñadora de Interiores',
    department: 'Arquitectura',
    departmentId: 'dept-2',
    hireDate: '2021-10-12',
    salary: 38000,
    status: 'Activo',
    skills: ['Diseño Interior', 'SketchUp', 'Photoshop', 'Selección de Materiales'],
    certifications: [],
    availability: 85,
    performance: 90,
    projects: ['proj-1', 'proj-4'],
    createdAt: '2021-10-12T10:00:00Z',
    updatedAt: '2024-03-20T13:20:00Z'
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

export const mockToolCategories = [
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

export const mockToolTypes = [
  { id: 'type-1', categoryId: 'cat-1', name: 'Excavadoras' },
  { id: 'type-2', categoryId: 'cat-1', name: 'Grúas' },
  { id: 'type-3', categoryId: 'cat-1', name: 'Compactadoras' },
  { id: 'type-4', categoryId: 'cat-2', name: 'Generadores' },
  { id: 'type-5', categoryId: 'cat-3', name: 'Iluminación' }
]

export const mockToolAssignments = [
  {
    id: 'assign-1',
    toolId: 'equip-2',
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
    toolId: 'equip-5',
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

export const mockToolMaintenance = [
  {
    id: 'maint-1',
    toolId: 'equip-3',
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
    toolId: 'equip-1',
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

// Datos de departamentos
export const mockDepartments = [
  {
    id: 'dept-1',
    name: 'Gestión de Proyectos',
    description: 'Departamento encargado de la planificación y coordinación de proyectos',
    managerId: 'team-1',
    managerName: 'Carlos Rodriguez',
    employeeCount: 2,
    budget: 150000,
    status: 'Activo',
    createdAt: '2020-01-01T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z'
  },
  {
    id: 'dept-2',
    name: 'Arquitectura',
    description: 'Departamento de diseño arquitectónico y planificación espacial',
    managerId: 'team-2',
    managerName: 'Ana Silva',
    employeeCount: 2,
    budget: 120000,
    status: 'Activo',
    createdAt: '2019-06-01T10:00:00Z',
    updatedAt: '2024-03-18T14:20:00Z'
  },
  {
    id: 'dept-3',
    name: 'Ingeniería',
    description: 'Departamento de ingeniería civil y cálculos estructurales',
    managerId: 'team-3',
    managerName: 'João Santos',
    employeeCount: 2,
    budget: 100000,
    status: 'Activo',
    createdAt: '2020-03-01T10:00:00Z',
    updatedAt: '2024-03-19T11:45:00Z'
  },
  {
    id: 'dept-4',
    name: 'Construcción',
    description: 'Departamento de ejecución y supervisión de obras',
    managerId: 'team-5',
    managerName: 'Roberto Hernández',
    employeeCount: 2,
    budget: 80000,
    status: 'Activo',
    createdAt: '2018-01-01T10:00:00Z',
    updatedAt: '2024-03-21T16:00:00Z'
  }
]

// Datos de asignaciones de empleados a proyectos
export const mockAssignments = [
  {
    id: 'assign-1',
    employeeId: 'team-1',
    employeeName: 'Carlos Rodriguez',
    projectId: 'proj-1',
    projectName: 'Proyecto Girassol',
    role: 'Director de Proyecto',
    startDate: '2024-01-15',
    endDate: '2025-06-30',
    dedication: 60,
    status: 'Activa',
    notes: 'Responsable principal del proyecto',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'assign-2',
    employeeId: 'team-1',
    employeeName: 'Carlos Rodriguez',
    projectId: 'proj-2',
    projectName: 'Edificio Aurora',
    role: 'Supervisor',
    startDate: '2024-03-01',
    endDate: '2025-09-15',
    dedication: 25,
    status: 'Activa',
    notes: 'Supervisión y apoyo técnico',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  },
  {
    id: 'assign-3',
    employeeId: 'team-2',
    employeeName: 'Ana Silva',
    projectId: 'proj-1',
    projectName: 'Proyecto Girassol',
    role: 'Arquitecta Principal',
    startDate: '2024-01-15',
    endDate: '2025-06-30',
    dedication: 50,
    status: 'Activa',
    notes: 'Diseño arquitectónico y supervisión',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'assign-4',
    employeeId: 'team-2',
    employeeName: 'Ana Silva',
    projectId: 'proj-3',
    projectName: 'Complejo Verde',
    role: 'Consultora de Diseño',
    startDate: '2024-02-10',
    endDate: '2025-08-20',
    dedication: 40,
    status: 'Activa',
    notes: 'Consultoría en diseño sostenible',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z'
  },
  {
    id: 'assign-5',
    employeeId: 'team-3',
    employeeName: 'João Santos',
    projectId: 'proj-2',
    projectName: 'Edificio Aurora',
    role: 'Ingeniero Estructural',
    startDate: '2024-03-01',
    endDate: '2025-09-15',
    dedication: 70,
    status: 'Activa',
    notes: 'Cálculos estructurales y supervisión técnica',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  },
  {
    id: 'assign-6',
    employeeId: 'team-4',
    employeeName: 'Maria García',
    projectId: 'proj-3',
    projectName: 'Complejo Verde',
    role: 'Ingeniera de Apoyo',
    startDate: '2024-02-10',
    endDate: '2025-08-20',
    dedication: 100,
    status: 'Activa',
    notes: 'Apoyo en cálculos y seguimiento de obra',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z'
  }
]

// Datos de asistencia
export const mockAttendance = [
  // Marzo 2024 - Semana del 18-22
  {
    id: 'att-1',
    employeeId: 'team-1',
    employeeName: 'Carlos Rodriguez',
    date: '2024-03-18',
    status: 'Presente',
    checkIn: '08:30',
    checkOut: '17:30',
    hoursWorked: 8,
    notes: ''
  },
  {
    id: 'att-2',
    employeeId: 'team-1',
    employeeName: 'Carlos Rodriguez',
    date: '2024-03-19',
    status: 'Presente',
    checkIn: '08:45',
    checkOut: '17:45',
    hoursWorked: 8,
    notes: ''
  },
  {
    id: 'att-3',
    employeeId: 'team-1',
    employeeName: 'Carlos Rodriguez',
    date: '2024-03-20',
    status: 'Presente',
    checkIn: '08:30',
    checkOut: '17:30',
    hoursWorked: 8,
    notes: ''
  },
  {
    id: 'att-4',
    employeeId: 'team-1',
    employeeName: 'Carlos Rodriguez',
    date: '2024-03-21',
    status: 'Presente',
    checkIn: '08:30',
    checkOut: '17:30',
    hoursWorked: 8,
    notes: ''
  },
  {
    id: 'att-5',
    employeeId: 'team-1',
    employeeName: 'Carlos Rodriguez',
    date: '2024-03-22',
    status: 'Presente',
    checkIn: '08:30',
    checkOut: '17:30',
    hoursWorked: 8,
    notes: ''
  },
  {
    id: 'att-6',
    employeeId: 'team-2',
    employeeName: 'Ana Silva',
    date: '2024-03-18',
    status: 'Presente',
    checkIn: '09:00',
    checkOut: '18:00',
    hoursWorked: 8,
    notes: ''
  },
  {
    id: 'att-7',
    employeeId: 'team-2',
    employeeName: 'Ana Silva',
    date: '2024-03-19',
    status: 'Presente',
    checkIn: '09:00',
    checkOut: '18:00',
    hoursWorked: 8,
    notes: ''
  },
  {
    id: 'att-8',
    employeeId: 'team-2',
    employeeName: 'Ana Silva',
    date: '2024-03-20',
    status: 'Tardanza',
    checkIn: '09:30',
    checkOut: '18:30',
    hoursWorked: 8,
    notes: 'Retraso por tráfico'
  },
  {
    id: 'att-9',
    employeeId: 'team-3',
    employeeName: 'João Santos',
    date: '2024-03-18',
    status: 'Presente',
    checkIn: '08:00',
    checkOut: '17:00',
    hoursWorked: 8,
    notes: ''
  },
  {
    id: 'att-10',
    employeeId: 'team-3',
    employeeName: 'João Santos',
    date: '2024-03-19',
    status: 'Ausente',
    checkIn: '',
    checkOut: '',
    hoursWorked: 0,
    notes: 'Cita médica',
    justification: 'Consulta médica programada'
  },
  {
    id: 'att-11',
    employeeId: 'team-6',
    employeeName: 'Ana López',
    date: '2024-03-18',
    status: 'Vacaciones',
    checkIn: '',
    checkOut: '',
    hoursWorked: 0,
    notes: 'Vacaciones anuales'
  },
  {
    id: 'att-12',
    employeeId: 'team-6',
    employeeName: 'Ana López',
    date: '2024-03-19',
    status: 'Vacaciones',
    checkIn: '',
    checkOut: '',
    hoursWorked: 0,
    notes: 'Vacaciones anuales'
  }
]

// Estadísticas de herramientas para el dashboard
export const mockToolStats = {
  totalTools: 5,
  availableTools: 2,
  inUseTools: 2,
  inMaintenanceTools: 1,
  retiredTools: 0,
  totalValue: 1000000,
  upcomingMaintenance: 2,
  overdueMaintenance: 0
}

// Aliases de compatibilidad para nomenclatura antigua de equipos
export { mockToolCategories as mockEquipmentCategories };
export { mockToolTypes as mockEquipmentTypes };
export { mockToolAssignments as mockEquipmentAssignments };
export { mockToolMaintenance as mockEquipmentMaintenance };
export { mockToolStats as mockEquipmentStats };