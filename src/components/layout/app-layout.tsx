import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/hardware': 'Hardware Assets',
  '/software': 'Software & Licenses',
  '/assignments': 'Employee Assignments',
  '/compliance': 'SAM Compliance',
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'IT Asset Console';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 items-center border-b bg-white px-6 shrink-0">
          <h1 className="text-base font-semibold text-gray-800">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              Mock Data Mode
            </span>
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold"
              style={{ backgroundColor: '#F47920' }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
