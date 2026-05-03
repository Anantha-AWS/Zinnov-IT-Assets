import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Cpu, Package2, Users, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/hardware', label: 'Hardware Assets', icon: Cpu, end: false },
  { path: '/software', label: 'Software & Licenses', icon: Package2, end: false },
  { path: '/assignments', label: 'Employee Assignments', icon: Users, end: false },
  { path: '/compliance', label: 'SAM Compliance', icon: ShieldCheck, end: false },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col" style={{ backgroundColor: '#1B2A4A' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <div
          className="flex h-8 w-8 items-center justify-center rounded font-bold text-sm text-white"
          style={{ backgroundColor: '#F47920' }}
        >
          Z
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Zinnov IT</p>
          <p className="text-white/50 text-xs">Asset Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white border-l-2 border-[#F47920] pl-[10px]'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs">IT Asset Management v1.0</p>
      </div>
    </aside>
  );
}
