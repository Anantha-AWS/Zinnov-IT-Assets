import { useState } from 'react';
import { useAssetStore } from '@/store/asset-store';
import type { Employee, AssetType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Monitor, Package2 } from 'lucide-react';

const DEPT_COLORS: Record<string, string> = {
  Engineering: 'bg-blue-100 text-blue-700',
  Design: 'bg-purple-100 text-purple-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Sales: 'bg-orange-100 text-orange-700',
  HR: 'bg-green-100 text-green-700',
  Finance: 'bg-yellow-100 text-yellow-700',
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function EmployeeAssignments() {
  const { employees, hardware, software, assignments, assignAsset, unassignAsset } = useAssetStore();
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(employees[0] ?? null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assetType, setAssetType] = useState<AssetType>('hardware');
  const [assetId, setAssetId] = useState('');
  const [unassignId, setUnassignId] = useState<string | null>(null);

  const empAssignments = assignments.filter((a) => a.employeeId === selectedEmp?.id);

  const assignedHwIds = new Set(
    assignments.filter((a) => a.assetType === 'hardware').map((a) => a.assetId)
  );

  const availableHardware = hardware.filter(
    (h) => !assignedHwIds.has(h.id) && h.status === 'Active'
  );
  const availableSoftware = software.filter((sw) => sw.status !== 'Expired');

  const availableAssets = assetType === 'hardware' ? availableHardware : availableSoftware;

  function handleAssign() {
    if (!selectedEmp || !assetId) return;
    assignAsset(selectedEmp.id, assetId, assetType);
    setAssetId('');
    setAssignOpen(false);
  }

  function openAssign() {
    setAssetType('hardware');
    setAssetId('');
    setAssignOpen(true);
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Employee List */}
      <div className="w-72 shrink-0 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Employees ({employees.length})
        </p>
        {employees.map((emp) => {
          const count = assignments.filter((a) => a.employeeId === emp.id).length;
          const isSelected = selectedEmp?.id === emp.id;
          return (
            <button
              key={emp.id}
              className={`w-full text-left rounded-lg border p-3 transition-all ${
                isSelected
                  ? 'border-[#1B2A4A] bg-[#EEF1F7] shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedEmp(emp)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: isSelected ? '#1B2A4A' : '#94A3B8' }}
                >
                  {initials(emp.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{emp.name}</p>
                  <p className="text-xs text-gray-400 truncate">{emp.role}</p>
                </div>
                {count > 0 && (
                  <span className="ml-auto shrink-0 text-xs font-semibold text-white rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#F47920' }}>
                    {count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Employee Detail Panel */}
      {selectedEmp ? (
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-white font-bold"
                style={{ backgroundColor: '#1B2A4A' }}
              >
                {initials(selectedEmp.name)}
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">{selectedEmp.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      DEPT_COLORS[selectedEmp.department] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedEmp.department}
                  </span>
                  <span className="text-xs text-gray-400">{selectedEmp.role}</span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-sm text-white"
              style={{ backgroundColor: '#1B2A4A' }}
              onClick={openAssign}
            >
              <Plus size={14} />
              Assign Asset
            </Button>
          </div>

          {empAssignments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center">
              <p className="text-sm text-gray-400">No assets assigned to {selectedEmp.name}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {empAssignments.map((asgn) => {
                const hw = hardware.find((h) => h.id === asgn.assetId);
                const sw = software.find((s) => s.id === asgn.assetId);
                const asset = hw ?? sw;
                if (!asset) return null;
                const isHw = asgn.assetType === 'hardware';
                return (
                  <div
                    key={asgn.id}
                    className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: isHw ? '#EEF1F7' : '#FEF3E8' }}
                    >
                      {isHw ? (
                        <Monitor size={16} style={{ color: '#1B2A4A' }} />
                      ) : (
                        <Package2 size={16} style={{ color: '#F47920' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{asset.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0"
                          style={{ fontSize: '10px' }}
                        >
                          {isHw ? (hw as typeof hw & { type: string })?.type : 'Software'}
                        </Badge>
                        <span className="text-xs text-gray-400">{asgn.assignedDate}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 shrink-0"
                      onClick={() => setUnassignId(asgn.id)}
                    >
                      <X size={13} />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          Select an employee to view their assets.
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Asset to {selectedEmp?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Asset Type</Label>
              <Select value={assetType} onValueChange={(v) => { setAssetType(v as AssetType); setAssetId(''); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="software">Software License</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Select Asset</Label>
              <Select value={assetId} onValueChange={setAssetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an asset..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.length === 0 ? (
                    <SelectItem value="_none" disabled>No available assets</SelectItem>
                  ) : (
                    availableAssets.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button
              disabled={!assetId || assetId === '_none'}
              className="text-white"
              style={{ backgroundColor: '#1B2A4A' }}
              onClick={handleAssign}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Confirmation */}
      <Dialog open={unassignId !== null} onOpenChange={(open) => !open && setUnassignId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Unassign Asset</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Are you sure you want to remove this asset assignment?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnassignId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (unassignId) unassignAsset(unassignId);
                setUnassignId(null);
              }}
            >
              Unassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
