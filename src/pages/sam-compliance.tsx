import { useAssetStore } from '@/store/asset-store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShieldCheck, ShieldAlert, AlertTriangle, TrendingDown } from 'lucide-react';
import type { ComplianceData } from '@/types';

const COMPLIANCE_STYLES: Record<ComplianceData['complianceStatus'], string> = {
  Compliant: 'bg-green-100 text-green-700 border-green-200',
  'Over-licensed': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Under-licensed': 'bg-red-100 text-red-700 border-red-200',
};

const RISK_STYLES: Record<ComplianceData['riskLevel'], string> = {
  Low: 'bg-green-50 text-green-600',
  Medium: 'bg-yellow-50 text-yellow-700',
  High: 'bg-red-50 text-red-700 font-semibold',
};

const ROW_HIGHLIGHT: Record<ComplianceData['complianceStatus'], string> = {
  Compliant: '',
  'Over-licensed': 'bg-yellow-50/40',
  'Under-licensed': 'bg-red-50/40',
};

export default function SAMCompliance() {
  const compliance = useAssetStore((s) => s.getComplianceData());

  const compliantCount = compliance.filter((c) => c.complianceStatus === 'Compliant').length;
  const overCount = compliance.filter((c) => c.complianceStatus === 'Over-licensed').length;
  const underCount = compliance.filter((c) => c.complianceStatus === 'Under-licensed').length;
  const highRiskCount = compliance.filter((c) => c.riskLevel === 'High').length;

  const summaryCards = [
    {
      label: 'Compliant',
      value: compliantCount,
      icon: ShieldCheck,
      color: '#16A34A',
      bg: '#DCFCE7',
    },
    {
      label: 'Over-licensed',
      value: overCount,
      icon: TrendingDown,
      color: '#D97706',
      bg: '#FEF9C3',
    },
    {
      label: 'Under-licensed',
      value: underCount,
      icon: ShieldAlert,
      color: '#DC2626',
      bg: '#FEE2E2',
    },
    {
      label: 'High Risk Items',
      value: highRiskCount,
      icon: AlertTriangle,
      color: '#DC2626',
      bg: '#FEE2E2',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border shadow-sm">
            <CardContent className="p-4">
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: card.bg }}
              >
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="font-medium text-gray-700">Legend:</span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-200" />
          Compliant (70–100% utilization)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-100 border border-yellow-200" />
          Over-licensed (&lt;70% utilization)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-200" />
          Under-licensed (&gt;100% utilization)
        </span>
      </div>

      {/* Compliance Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500 py-2.5">Software</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-2.5">Vendor</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-2.5">Total Seats</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-2.5">Used Seats</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-2.5">Utilization</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-2.5">Compliance Status</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-2.5">Risk</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 py-2.5">Recommendation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compliance.map((item) => (
              <TableRow
                key={item.licenseId}
                className={`text-sm ${ROW_HIGHLIGHT[item.complianceStatus]}`}
              >
                <TableCell className="py-2.5 font-medium text-gray-800">{item.name}</TableCell>
                <TableCell className="py-2.5 text-gray-600">{item.vendor}</TableCell>
                <TableCell className="py-2.5 text-gray-600">{item.totalSeats}</TableCell>
                <TableCell className={`py-2.5 font-medium ${item.usedSeats > item.totalSeats ? 'text-red-600' : 'text-gray-800'}`}>
                  {item.usedSeats}
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2 min-w-[90px]">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, item.utilizationPct)}%`,
                          backgroundColor:
                            item.utilizationPct > 100
                              ? '#EF4444'
                              : item.utilizationPct >= 70
                              ? '#16A34A'
                              : '#D97706',
                        }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-gray-500">{item.utilizationPct}%</span>
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge
                    variant="outline"
                    className={`text-xs ${COMPLIANCE_STYLES[item.complianceStatus]}`}
                  >
                    {item.complianceStatus}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded ${RISK_STYLES[item.riskLevel]}`}>
                    {item.riskLevel}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 text-xs text-gray-600 max-w-[200px]">
                  {item.recommendation}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
