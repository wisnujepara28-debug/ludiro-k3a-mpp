export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatar: string;
  department: string;
}

export type ShipStatus = 'Underway' | 'Berthed' | 'Anchored' | 'Drydock';

export type ShipType =
  | 'Container Ship'
  | 'Oil / Chemical Tanker'
  | 'Bulk Carrier'
  | 'General Cargo'
  | 'Tugboat & Barge Handler'
  | 'Ro-Ro Passenger / Vehicle';

export interface Ship {
  id: string;
  name: string;
  imo: string;
  callSign: string;
  type: ShipType | string;
  flag: string;
  yearBuilt: number;
  dwt: number;
  teuCapacity: number;
  lengthOverall: number;
  beam: number;
  draft: number;
  status: ShipStatus | string;
  currentPort: string;
  destinationPort: string;
  speedKnots: number;
  fuelLevelPct: number;
  masterName: string;
  notes?: string;
}

export type VoyageStatus = 'Scheduled' | 'In Progress' | 'Arrived' | 'Completed' | 'Delayed';

export interface Voyage {
  id: string;
  voyageNumber: string;
  shipId: string;
  shipName: string;
  portOfLoading: string;
  portOfDischarge: string;
  departureTime: string;
  estimatedArrival: string;
  status: VoyageStatus | string;
  capacityUsagePct: number;
  cargoTonnage: number;
  totalTeu: number;
  bunkerFuelMt: number;
  remarks?: string;
}

export type CargoStatus = 'In Warehouse' | 'Loaded' | 'In Transit' | 'Discharged' | 'Delivered';

export interface Cargo {
  id: string;
  blNumber: string;
  voyageId: string;
  voyageNumber: string;
  shipperName: string;
  consigneeName: string;
  commodityType: string;
  containerNumber: string;
  packageCount: number;
  packageUnit: string;
  grossWeightMt: number;
  volumeCbm: number;
  hazardous: boolean;
  customsStatus: string;
  status: CargoStatus | string;
}

export type CertStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export interface Crew {
  id: string;
  seafarerCode: string;
  fullName: string;
  rank: string;
  assignedShipId: string;
  assignedShipName: string;
  stcwCertificate: string;
  certificateExpiry: string;
  certStatus: CertStatus | string;
  contractEndDate: string;
  nationality: string;
  phone: string;
  emergencyContact: string;
}

export interface ActivityLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
  userName: string;
}

export interface SystemStats {
  totalShips: number;
  activeShips: number;
  underwayShips: number;
  drydockShips: number;
  activeVoyages: number;
  scheduledVoyages: number;
  totalCargoTonnage: number;
  totalTeuInTransit: number;
  totalCrew: number;
  expiringCerts: number;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}
