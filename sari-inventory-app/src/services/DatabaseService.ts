// Database service that simulates PostgreSQL functionality
// This works on both web and mobile platforms

import { Sari, MovementLog, Customer, Supplier, DashboardStats } from '../types';

class DatabaseService {
  private static instance: DatabaseService | null = null;
  private saris: Sari[] = [];
  private movementLogs: MovementLog[] = [];
  private customers: Customer[] = [];
  private suppliers: Supplier[] = [];

  private constructor() {
    this.initializeSampleData();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeSampleData() {
    // Initialize with sample data that matches your PostgreSQL database structure
    this.saris = [
      {
        id: '1',
        serialNumber: 'SARI001',
        designCode: 'DESIGN001',
        currentProcess: 'Kora',
        currentLocation: 'Production Unit A',
        currentCode: 'KORA001',
        isRejected: false,
        entryDate: '2024-01-15',
        status: 'active',
        description: 'Traditional Silk Sari with intricate embroidery',
        price: 2500,
      },
      {
        id: '2',
        serialNumber: 'SARI002',
        designCode: 'DESIGN002',
        currentProcess: 'White',
        currentLocation: 'Production Unit B',
        currentCode: 'WHITE002',
        isRejected: false,
        entryDate: '2024-01-16',
        status: 'active',
        description: 'Cotton Blend Sari with modern design',
        price: 1800,
      },
      {
        id: '3',
        serialNumber: 'SARI003',
        designCode: 'DESIGN003',
        currentProcess: 'Self',
        currentLocation: 'Production Unit C',
        currentCode: 'SELF003',
        isRejected: false,
        entryDate: '2024-01-17',
        status: 'active',
        description: 'Designer Sari with unique patterns',
        price: 3200,
      },
      {
        id: '4',
        serialNumber: 'SARI004',
        designCode: 'DESIGN004',
        currentProcess: 'Contrast',
        currentLocation: 'Production Unit D',
        currentCode: 'CONTRAST004',
        isRejected: false,
        entryDate: '2024-01-18',
        status: 'active',
        description: 'Wedding Sari with premium materials',
        price: 4500,
      },
      {
        id: '5',
        serialNumber: 'SARI005',
        designCode: 'DESIGN005',
        currentProcess: 'Completed',
        currentLocation: 'Warehouse',
        currentCode: 'COMPLETED005',
        isRejected: false,
        entryDate: '2024-01-10',
        status: 'completed',
        description: 'Party Wear Sari ready for sale',
        price: 2800,
      },
    ];

    this.movementLogs = [
      {
        id: '1',
        serialNumber: 'SARI001',
        fromProcess: 'Raw Material',
        toProcess: 'Kora',
        location: 'Production Unit A',
        movementDate: new Date().toISOString(),
        operator: 'John Doe',
        notes: 'Started Kora process - initial quality check passed',
      },
      {
        id: '2',
        serialNumber: 'SARI001',
        fromProcess: 'Kora',
        toProcess: 'White',
        location: 'Production Unit B',
        movementDate: new Date(Date.now() - 86400000).toISOString(),
        operator: 'Jane Smith',
        notes: 'Kora process completed successfully, moving to White process',
      },
      {
        id: '3',
        serialNumber: 'SARI002',
        fromProcess: 'White',
        toProcess: 'Self',
        location: 'Production Unit C',
        movementDate: new Date(Date.now() - 172800000).toISOString(),
        operator: 'Mike Johnson',
        notes: 'White process completed, quality standards met',
      },
      {
        id: '4',
        serialNumber: 'SARI003',
        fromProcess: 'Self',
        toProcess: 'Contrast',
        location: 'Production Unit D',
        movementDate: new Date(Date.now() - 259200000).toISOString(),
        operator: 'Sarah Wilson',
        notes: 'Self process finished, ready for contrast application',
      },
      {
        id: '5',
        serialNumber: 'SARI004',
        fromProcess: 'Contrast',
        toProcess: 'Completed',
        location: 'Warehouse',
        movementDate: new Date(Date.now() - 345600000).toISOString(),
        operator: 'David Brown',
        notes: 'Final process completed, product ready for inventory',
      },
    ];

    this.customers = [
      {
        id: '1',
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91 98765 43210',
        address: '123 Fashion Street, Mumbai, Maharashtra',
        totalOrders: 15,
        totalSpent: 45000,
      },
      {
        id: '2',
        name: 'Rajesh Patel',
        email: 'rajesh.patel@email.com',
        phone: '+91 87654 32109',
        address: '456 Designer Lane, Delhi, NCR',
        totalOrders: 8,
        totalSpent: 28000,
      },
      {
        id: '3',
        name: 'Anjali Singh',
        email: 'anjali.singh@email.com',
        phone: '+91 76543 21098',
        address: '789 Sari Road, Bangalore, Karnataka',
        totalOrders: 22,
        totalSpent: 75000,
      },
    ];

    this.suppliers = [
      {
        id: '1',
        name: 'Silk Paradise Ltd.',
        email: 'info@silkparadise.com',
        phone: '+91 65432 10987',
        address: '321 Silk Street, Varanasi, UP',
        materials: ['Raw Silk', 'Embroidery Thread', 'Zari Work'],
        rating: 4.8,
      },
      {
        id: '2',
        name: 'Cotton World',
        email: 'contact@cottonworld.com',
        phone: '+91 54321 09876',
        address: '654 Cotton Avenue, Coimbatore, TN',
        materials: ['Cotton Fabric', 'Natural Dyes', 'Cotton Thread'],
        rating: 4.6,
      },
      {
        id: '3',
        name: 'Designer Materials Co.',
        email: 'sales@designermaterials.com',
        phone: '+91 43210 98765',
        address: '987 Design Street, Jaipur, Rajasthan',
        materials: ['Designer Fabric', 'Beads', 'Sequins'],
        rating: 4.9,
      },
    ];
  }

  // Sari operations
  async getAllSaris(): Promise<Sari[]> {
    return this.saris;
  }

  async getSariById(id: string): Promise<Sari | null> {
    return this.saris.find(sari => sari.id === id) || null;
  }

  async addSari(sari: Omit<Sari, 'id'>): Promise<Sari> {
    const newSari = { ...sari, id: Date.now().toString() };
    this.saris.push(newSari);
    return newSari;
  }

  async updateSari(id: string, updates: Partial<Sari>): Promise<Sari | null> {
    const index = this.saris.findIndex(sari => sari.id === id);
    if (index === -1) return null;
    
    this.saris[index] = { ...this.saris[index], ...updates };
    return this.saris[index];
  }

  async deleteSari(id: string): Promise<boolean> {
    const index = this.saris.findIndex(sari => sari.id === id);
    if (index === -1) return false;
    
    this.saris.splice(index, 1);
    return true;
  }

  // Movement log operations
  async getAllMovementLogs(): Promise<MovementLog[]> {
    return this.movementLogs;
  }

  async addMovementLog(movement: Omit<MovementLog, 'id'>): Promise<MovementLog> {
    const newMovement = { ...movement, id: Date.now().toString() };
    this.movementLogs.push(newMovement);
    
    // Simulate the PostgreSQL trigger functionality - update the sari's current process
    const sari = this.saris.find(s => s.serialNumber === movement.serialNumber);
    if (sari) {
      sari.currentProcess = movement.toProcess;
      sari.currentLocation = movement.location;
      
      // Update current code based on process (simulating your PostgreSQL trigger)
      if (movement.toProcess === 'Kora') sari.currentCode = 'KORA001';
      else if (movement.toProcess === 'White') sari.currentCode = 'WHITE002';
      else if (movement.toProcess === 'Self') sari.currentCode = 'SELF003';
      else if (movement.toProcess === 'Contrast') sari.currentCode = 'CONTRAST004';
      else if (movement.toProcess === 'Completed') sari.currentCode = 'COMPLETED005';
      
      // Update status if completed
      if (movement.toProcess === 'Completed') {
        sari.status = 'completed';
      }
    }
    
    return newMovement;
  }

  // Customer operations
  async getAllCustomers(): Promise<Customer[]> {
    return this.customers;
  }

  async addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const newCustomer = { ...customer, id: Date.now().toString() };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  // Supplier operations
  async getAllSuppliers(): Promise<Supplier[]> {
    return this.suppliers;
  }

  async addSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    const newSupplier = { ...supplier, id: Date.now().toString() };
    this.suppliers.push(newSupplier);
    return newSupplier;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const activeSaris = this.saris.filter(s => s.status === 'active').length;
    const completedSaris = this.saris.filter(s => s.status === 'completed').length;
    const rejectedSaris = this.saris.filter(s => s.isRejected).length;

    return {
      totalSaris: this.saris.length,
      activeSaris,
      completedSaris,
      rejectedSaris,
      totalMovements: this.movementLogs.length,
      totalCustomers: this.customers.length,
      totalSuppliers: this.suppliers.length,
      recentMovements: this.movementLogs.slice(0, 5),
      recentSaris: this.saris.slice(0, 5),
    };
  }

  // Search functionality
  async searchSaris(query: string): Promise<Sari[]> {
    const lowerQuery = query.toLowerCase();
    return this.saris.filter(
      sari =>
        sari.serialNumber.toLowerCase().includes(lowerQuery) ||
        sari.designCode.toLowerCase().includes(lowerQuery) ||
        sari.currentProcess.toLowerCase().includes(lowerQuery) ||
        sari.description?.toLowerCase().includes(lowerQuery) ||
        sari.currentLocation.toLowerCase().includes(lowerQuery)
    );
  }

  // Get sari movement history
  async getSariMovementHistory(serialNumber: string): Promise<MovementLog[]> {
    return this.movementLogs
      .filter(movement => movement.serialNumber === serialNumber)
      .sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime());
  }

  // Database connection status
  async getConnectionStatus(): Promise<{ connected: boolean; message: string }> {
    return {
      connected: true,
      message: 'Connected to Sari Inventory Database (Simulated)',
    };
  }
}

export default DatabaseService;
