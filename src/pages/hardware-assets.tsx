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
import type { HardwareAsset, HardwareType, HardwareStatus } from '@/types';
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

const HARDWARE_TYPES: HardwareType[] = ['Laptop', 'Desktop', 'Monitor', 'Phone', 'Tablet', 'Accessory'];
const HARDWARE_STATUSES: HardwareStatus[] = ['Active', 'In Repair', 'Retired'];

const STATUS_STYLES: Record<HardwareStatus, string> = {
  Active: 'bg-green-100 text-green-700 border-green-200',
  'In Repair': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Retired: 'bg-gray-100 text-gray-600 border-gray-200',
};

type FormData = Omit<HardwareAsset, 'id'>;

const blankForm = (): FormData => ({
  name: '',
  type: 'Laptop',
  brand: '',
  serialNumber: '',
  status: 'Active',
  assignedTo: '',
  location: '',
  purchaseDate: new Date().toISOString().split('T')[0],
});

const col = createColumnHelper<HardwareAsset>();

export default function HardwareAssets() {
  const { hardware, addHardware, updateHardware, deleteHardware } = useAssetStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HardwareAsset | null>(null);
  const [formData, setFormData] = useState<FormData>(blankForm());
  const [editId, setEditId] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      col.accessor('id', { header: 'Asset ID' }),
      col.accessor('name', { header: 'Name' }),
      col.accessor('type', { header: 'Type' }),
      col.accessor('brand', { header: 'Brand' }),
      col.accessor('serialNumber', { header: 'Serial Number' }),
      col.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <Badge variant="outline" className={`text-xs ${STATUS_STYLES[info.getValue()]}`}>
            {info.getValue()}
          </Badge>
        ),
      }),
      col.accessor('assignedTo', {
        header: 'Assigned To',
        cell: (info) => info.getValue() ?? '—',
      }),
      col.accessor('location', { header: 'Location' }),
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
    data: hardware,
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

  function openEdit(asset: HardwareAsset) {
    setFormData({ ...asset });
    setEditId(asset.id);
    setDialogMode('edit');
  }

  function handleSubmit() {
    if (dialogMode === 'add') {
      addHardware(formData);
    } else if (dialogMode === 'edit' && editId) {
      updateHardware(editId, formData);
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
            placeholder="Search assets..."
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
          Add Hardware
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
                  No hardware assets found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50 text-sm">
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
            <DialogTitle>{dialogMode === 'add' ? 'Add Hardware Asset' : 'Edit Hardware Asset'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Asset Name</Label>
              <Input value={formData.name} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => setField('type', v as HardwareType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HARDWARE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Brand</Label>
              <Input value={formData.brand} onChange={(e) => setField('brand', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Serial Number</Label>
              <Input value={formData.serialNumber} onChange={(e) => setField('serialNumber', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setField('status', v as HardwareStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HARDWARE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input value={formData.location} onChange={(e) => setField('location', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Purchase Date</Label>
              <Input type="date" value={formData.purchaseDate} onChange={(e) => setField('purchaseDate', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button
              className="text-white"
              style={{ backgroundColor: '#1B2A4A' }}
              onClick={handleSubmit}
            >
              {dialogMode === 'add' ? 'Add Asset' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
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
                if (deleteTarget) deleteHardware(deleteTarget.id);
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
