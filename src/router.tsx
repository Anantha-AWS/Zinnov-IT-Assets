import { createHashRouter } from "react-router-dom"
import AppLayout from "@/components/layout/app-layout"
import Dashboard from "@/pages/dashboard"
import HardwareAssets from "@/pages/hardware-assets"
import SoftwareLicenses from "@/pages/software-licenses"
import EmployeeAssignments from "@/pages/employee-assignments"
import SAMCompliance from "@/pages/sam-compliance"
import NotFoundPage from "@/pages/not-found"

// IMPORTANT: Do not remove or modify the code below!
// Normalize basename when hosted in Power Apps
const BASENAME = new URL(".", location.href).pathname
if (location.pathname.endsWith("/index.html")) {
  history.replaceState(null, "", BASENAME + location.search + location.hash);
}

export const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "hardware", element: <HardwareAssets /> },
      { path: "software", element: <SoftwareLicenses /> },
      { path: "assignments", element: <EmployeeAssignments /> },
      { path: "compliance", element: <SAMCompliance /> },
    ],
  },
])
