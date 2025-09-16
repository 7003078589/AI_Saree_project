export interface Sari {
  id: string;
  serialNumber: string;
  designCode: string;
  currentProcess: string;
  currentLocation: string;
  currentCode: string;
  isRejected: boolean;
  entryDate: string;
  description?: string;
  price?: number;
  status: 'active' | 'completed' | 'rejected';
}

export interface MovementLog {
  id: string;
  serialNumber: string;
  fromProcess: string;
  toProcess: string;
  location: string;
  movementDate: string;
  notes?: string;
  operator?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  materials: string[];
  rating: number;
}

export interface DashboardStats {
  totalSaris: number;
  activeSaris: number;
  completedSaris: number;
  rejectedSaris: number;
  totalMovements: number;
  totalCustomers: number;
  totalSuppliers: number;
  recentMovements: MovementLog[];
  recentSaris: Sari[];
}

export type RootStackParamList = {
  MainTabs: undefined;
  AddSari: undefined;
  AddMovement: undefined;
  SariDetail: { sari: Sari };
};

export type TabParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  MovementLogs: undefined;
  LiveProcess: undefined;
  Customers: undefined;
  Suppliers: undefined;
  Settings: undefined;
};
