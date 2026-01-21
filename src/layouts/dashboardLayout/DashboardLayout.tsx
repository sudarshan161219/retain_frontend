import { Outlet } from "react-router-dom";
import { DashboardNavbar } from "@/components/dashboardNavbar/DashboardNavbar";
import { ModalManager } from "@/components/modal/modalManager/ModalManager";

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans">
      {/* The New Clean Navbar */}
      <DashboardNavbar />

      {/* Page Content */}
      <main className="animate-in fade-in duration-500">
        <Outlet />
        <ModalManager />
      </main>
    </div>
  );
};
