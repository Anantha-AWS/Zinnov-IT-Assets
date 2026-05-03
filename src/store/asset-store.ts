import { create } from 'zustand';
import type { HardwareAsset, SoftwareLicense, Employee, Assignment, ComplianceData, AssetType } from '@/types';
import { mockHardware, mockSoftware, mockEmployees, mockAssignments } from '@/data/mock-data';

interface AssetStore {
  hardware: HardwareAsset[];
  software: SoftwareLicense[];
  employees: Employee[];
  assignments: Assignment[];

  addHardware: (asset: Omit<HardwareAsset, 'id'>) => void;
  updateHardware: (id: string, asset: Partial<HardwareAsset>) => void;
  deleteHardware: (id: string) => void;

  addSoftware: (license: Omit<SoftwareLicense, 'id'>) => void;
  updateSoftware: (id: string, license: Partial<SoftwareLicense>) => void;
  deleteSoftware: (id: string) => void;

  assignAsset: (employeeId: string, assetId: string, assetType: AssetType) => void;
  unassignAsset: (assignmentId: string) => void;

  getEmployeeAssignments: (employeeId: string) => Assignment[];
  getComplianceData: () => ComplianceData[];
}

const genId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const useAssetStore = create<AssetStore>((set, get) => ({
  hardware: mockHardware,
  software: mockSoftware,
  employees: mockEmployees,
  assignments: mockAssignments,

  addHardware: (asset) =>
    set((s) => ({ hardware: [...s.hardware, { ...asset, id: genId('hw') }] })),

  updateHardware: (id, asset) =>
    set((s) => ({ hardware: s.hardware.map((h) => (h.id === id ? { ...h, ...asset } : h)) })),

  deleteHardware: (id) =>
    set((s) => ({
      hardware: s.hardware.filter((h) => h.id !== id),
      assignments: s.assignments.filter((a) => a.assetId !== id),
    })),

  addSoftware: (license) =>
    set((s) => ({ software: [...s.software, { ...license, id: genId('sw') }] })),

  updateSoftware: (id, license) =>
    set((s) => ({ software: s.software.map((sw) => (sw.id === id ? { ...sw, ...license } : sw)) })),

  deleteSoftware: (id) =>
    set((s) => ({
      software: s.software.filter((sw) => sw.id !== id),
      assignments: s.assignments.filter((a) => a.assetId !== id),
    })),

  assignAsset: (employeeId, assetId, assetType) => {
    const newAsgn: Assignment = {
      id: genId('asgn'),
      employeeId,
      assetId,
      assetType,
      assignedDate: new Date().toISOString().split('T')[0],
    };
    set((s) => {
      const emp = s.employees.find((e) => e.id === employeeId);
      return {
        assignments: [...s.assignments, newAsgn],
        hardware:
          assetType === 'hardware'
            ? s.hardware.map((h) =>
                h.id === assetId ? { ...h, assignedTo: emp?.name, employeeId } : h
              )
            : s.hardware,
        software:
          assetType === 'software'
            ? s.software.map((sw) =>
                sw.id === assetId ? { ...sw, usedSeats: sw.usedSeats + 1 } : sw
              )
            : s.software,
      };
    });
  },

  unassignAsset: (assignmentId) => {
    const asgn = get().assignments.find((a) => a.id === assignmentId);
    if (!asgn) return;
    set((s) => ({
      assignments: s.assignments.filter((a) => a.id !== assignmentId),
      hardware:
        asgn.assetType === 'hardware'
          ? s.hardware.map((h) =>
              h.id === asgn.assetId ? { ...h, assignedTo: undefined, employeeId: undefined } : h
            )
          : s.hardware,
      software:
        asgn.assetType === 'software'
          ? s.software.map((sw) =>
              sw.id === asgn.assetId ? { ...sw, usedSeats: Math.max(0, sw.usedSeats - 1) } : sw
            )
          : s.software,
    }));
  },

  getEmployeeAssignments: (employeeId) =>
    get().assignments.filter((a) => a.employeeId === employeeId),

  getComplianceData: () =>
    get().software.map((sw) => {
      const pct = Math.round((sw.usedSeats / sw.totalSeats) * 100);
      let complianceStatus: ComplianceData['complianceStatus'];
      let riskLevel: ComplianceData['riskLevel'];
      let recommendation: string;

      if (sw.usedSeats > sw.totalSeats) {
        complianceStatus = 'Under-licensed';
        const over = sw.usedSeats - sw.totalSeats;
        riskLevel = over / sw.totalSeats > 0.2 ? 'High' : 'Medium';
        recommendation = `Purchase ${over} additional seat(s) immediately`;
      } else if (pct < 70) {
        complianceStatus = 'Over-licensed';
        const unused = sw.totalSeats - sw.usedSeats;
        riskLevel = unused / sw.totalSeats > 0.3 ? 'High' : 'Medium';
        recommendation = `Reduce by ${unused} seat(s) at next renewal`;
      } else {
        complianceStatus = 'Compliant';
        riskLevel = 'Low';
        recommendation = 'No action needed';
      }

      return {
        licenseId: sw.id,
        name: sw.name,
        vendor: sw.vendor,
        totalSeats: sw.totalSeats,
        usedSeats: sw.usedSeats,
        utilizationPct: pct,
        complianceStatus,
        riskLevel,
        recommendation,
      };
    }),
}));
