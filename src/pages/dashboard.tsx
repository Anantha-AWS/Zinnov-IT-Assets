import { useMemo } from 'react';
import { useAssetStore } from '@/store/asset-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Package, Monitor, ShieldCheck, Users, AlertTriangle, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  'In Repair': 'bg-yellow-100 text-yellow-700',
  Retired: 'bg-gray-100 text-gray-600',
};

export default function Dashboard() {
  const { hardware, software, assignments } = useAssetStore();
  const compliance = useAssetStore((s) => s.getComplianceData());

  const stats = useMemo(() => {
    const compliantCount = compliance.filter((c) => c.complianceStatus === 'Compliant').length;
    const compliancePct =
      compliance.length > 0 ? Math.round((compliantCount / compliance.length) * 100) : 100;
    const uniqueEmployees = new Set(assignments.map((a) => a.employeeId)).size;
    const expiring = software.filter((s) => s.status === 'Expiring').length;
    return { compliancePct, uniqueEmployees, expiring };
  }, [compliance, assignments, software]);

  const hwByType = useMemo(() => {
    const counts: Record<string, number> = {};
    hardware.forEach((h) => {
      counts[h.type] = (counts[h.type] ?? 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [hardware]);

  const recentHardware = useMemo(
    () => [...hardware].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)).slice(0, 5),
    [hardware]
  );

  const summaryCards = [
    {
      title: 'Total Assets',
      value: hardware.length + software.length,
      icon: Package,
      color: '#1B2A4A',
      bg: '#EEF1F7',
    },
    {
      title: 'Hardware Count',
      value: hardware.length,
      icon: Cpu,
      color: '#1B2A4A',
      bg: '#EEF1F7',
    },
    {
      title: 'Software Licenses',
      value: software.length,
      icon: Monitor,
      color: '#1B2A4A',
      bg: '#EEF1F7',
    },
    {
      title: 'Assets Assigned',
      value: stats.uniqueEmployees,
      icon: Users,
      color: '#F47920',
      bg: '#FEF3E8',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiring,
      icon: AlertTriangle,
      color: '#D97706',
      bg: '#FEF9C3',
    },
    {
      title: 'Compliance %',
      value: `${stats.compliancePct}%`,
      icon: ShieldCheck,
      color: '#16A34A',
      bg: '#DCFCE7',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <Card key={card.title} className="border shadow-sm">
            <CardContent className="p-4">
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: card.bg }}
              >
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Hardware by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hwByType} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 6 }}
                  cursor={{ fill: '#F3F4F6' }}
                />
                <Bar dataKey="count" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Software License Status */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              License Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {software.map((sw) => {
                const pct = Math.min(100, Math.round((sw.usedSeats / sw.totalSeats) * 100));
                return (
                  <div key={sw.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700 font-medium truncate max-w-[60%]">
                        {sw.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {sw.usedSeats}/{sw.totalSeats}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            sw.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : sw.status === 'Expiring'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {sw.status}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            pct > 100 ? '#EF4444' : pct > 85 ? '#F47920' : '#1B2A4A',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Hardware */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Recent Hardware</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-gray-500">Name</th>
                  <th className="pb-2 font-medium text-gray-500">Type</th>
                  <th className="pb-2 font-medium text-gray-500">Brand</th>
                  <th className="pb-2 font-medium text-gray-500">Assigned To</th>
                  <th className="pb-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentHardware.map((hw) => (
                  <tr key={hw.id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium text-gray-800">{hw.name}</td>
                    <td className="py-2.5 text-gray-600">{hw.type}</td>
                    <td className="py-2.5 text-gray-600">{hw.brand}</td>
                    <td className="py-2.5 text-gray-600">{hw.assignedTo ?? '—'}</td>
                    <td className="py-2.5">
                      <Badge
                        variant="outline"
                        className={`text-xs ${STATUS_COLORS[hw.status] ?? ''}`}
                      >
                        {hw.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
