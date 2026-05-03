import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { useAssetStore } from '@/store/asset-store';
import type { SoftwareLicense, LicenseType, SoftwareStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const LICENSE_TYPES: LicenseType[] = ['Perpetual', 'Subscription', 'Per Seat', 'Enterprise'];
const SOFTWARE_STATUSES: SoftwareStatus[] = ['Active', 'Expiring', 'Expired'];

const STATUS_STYLES: Record<SoftwareStatus, string> = {
  Active: 'bg-green-100 text-green-700 border-green-200',
  Expiring: 'bg-orange-100 text-orange-700 border-orange-200',
  Expired: 'bg-red-100 text-red-700 border-red-200',
};

type FormData = Omit<SoftwareLicense, 'id'>;

const blankForm = (): FormData => ({
  name: '',
  vendor: '',
  licenseType: 'Subscription',
  totalSeats: 10,
  usedSeats: 0,
  expiryDate: '',
  status: 'Active',
  cost: undefined,
});

const col = createColumnHelper<SoftwareLicense>();

export default function SoftwareLicenses() {
  const { software, addSoftware, updateSoftware, deleteSoftware } = useAssetStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SoftwareLicense | null>(null);
  const [formData, setFormData] = useState<FormData>(blankForm());
  const [editId, setEditId] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      col.accessor('name', { header: 'Software Name' }),
      col.accessor('vendor', { header: 'Vendor' }),
      col.accessor('licenseType', { header: 'License Type' }),
      col.accessor('totalSeats', { header: 'Total Seats' }),
      col.accessor('usedSeats', { header: 'Used Seats' }),
      col.display({
        id: 'utilization',
        header: 'Utilization',
        cell: ({ row }) => {
          const pct = Math.min(100, Math.round((row.original.usedSeats / row.original.totalSeats) * 100));
          const over = row.original.usedSeats > row.original.totalSeats;
          return (
            <div className="flex items-center gap-2 min-w-[100px]">
              <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: over ? '#EF4444' : pct > 85 ? '#F47920' : '#1B2A4A',
                  }}
                />
              </div>
              <span className={`text-xs tabular-nums ${over ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                {pct}%
              </span>
            </div>
          );
        },
      }),
      col.accessor('expiryDate', {
        header: 'Expiry Date',
        cell: (info) => {
          const val = info.getValue();
          const isExpiring = info.row.original.status !== 'Active';
          return (
            <span className={isExpiring ? 'text-orange-600 font-medium' : ''}>{val}</span>
          );
        },
      }),
      col.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <Badge variant="outline" className={`text-xs ${STATUS_STYLES[info.getValue()]}`}>
            {info.getValue()}
          </Badge>
        ),
      }),
      col.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
              onClick={() => openEdit(row.original)}
            >
              <Pencil size={13} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({
    data: software,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  function openAdd() {
    setFormData(blankForm());
    setEditId(null);
    setDialogMode('add');
  }

  function openEdit(lic: SoftwareLicense) {
    setFormData({ ...lic });
    setEditId(lic.id);
    setDialogMode('edit');
  }

  function handleSubmit() {
    if (dialogMode === 'add') {
      addSoftware(formData);
    } else if (dialogMode === 'edit' && editId) {
      updateSoftware(editId, formData);
    }
    setDialogMode(null);
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Search licenses..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-sm text-white"
          style={{ backgroundColor: '#1B2A4A' }}
          onClick={openAdd}
        >
          <Plus size={14} />
          Add License
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-gray-50">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-semibold text-gray-500 py-2.5 cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc'
                      ? ' ↑'
                      : header.column.getIsSorted() === 'desc'
                      ? ' ↓'
                      : ''}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-sm text-gray-400 py-10">
                  No licenses found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`text-sm hover:bg-gray-50 ${
                    row.original.status === 'Expiring'
                      ? 'bg-orange-50/50'
                      : row.original.status === 'Expired'
                      ? 'bg-red-50/50'
                      : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add Software License' : 'Edit Software License'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Software Name</Label>
              <Input value={formData.name} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Vendor</Label>
              <Input value={formData.vendor} onChange={(e) => setField('vendor', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>License Type</Label>
              <Select value={formData.licenseType} onValueChange={(v) => setField('licenseType', v as LicenseType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LICENSE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Total Seats</Label>
              <Input
                type="number"
                value={formData.totalSeats}
                onChange={(e) => setField('totalSeats', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Used Seats</Label>
              <Input
                type="number"
                value={formData.usedSeats}
                onChange={(e) => setField('usedSeats', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Expiry Date</Label>
              <Input type="date" value={formData.expiryDate} onChange={(e) => setField('expiryDate', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setField('status', v as SoftwareStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOFTWARE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Annual Cost (USD)</Label>
              <Input
                type="number"
                value={formData.cost ?? ''}
                onChange={(e) => setField('cost', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button
              className="text-white"
              style={{ backgroundColor: '#1B2A4A' }}
              onClick={handleSubmit}
            >
              {dialogMode === 'add' ? 'Add License' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete License</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-medium">{deleteTarget?.name}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) deleteSoftware(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
