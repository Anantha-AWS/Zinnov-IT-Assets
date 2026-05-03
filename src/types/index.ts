export type HardwareType = 'Laptop' | 'Desktop' | 'Monitor' | 'Phone' | 'Tablet' | 'Accessory';
export type HardwareStatus = 'Active' | 'In Repair' | 'Retired';
export type LicenseType = 'Perpetual' | 'Subscription' | 'Per Seat' | 'Enterprise';
export type SoftwareStatus = 'Active' | 'Expiring' | 'Expired';
export type AssetType = 'hardware' | 'software';

export interface HardwareAsset {
  id: string;
  name: string;
  type: HardwareType;
  brand: string;
  serialNumber: string;
  status: HardwareStatus;
  assignedTo?: string;
  employeeId?: string;
  location: string;
  purchaseDate: string;
}

export interface SoftwareLicense {
  id: string;
  name: string;
  vendor: string;
  licenseType: LicenseType;
  totalSeats: number;
  usedSeats: number;
  expiryDate: string;
  status: SoftwareStatus;
  cost?: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

export interface Assignment {
  id: string;
  employeeId: string;
  assetId: string;
  assetType: AssetType;
  assignedDate: string;
}

export interface ComplianceData {
  licenseId: string;
  name: string;
  vendor: string;
  totalSeats: number;
  usedSeats: number;
  utilizationPct: number;
  complianceStatus: 'Compliant' | 'Over-licensed' | 'Under-licensed';
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: string;
}
