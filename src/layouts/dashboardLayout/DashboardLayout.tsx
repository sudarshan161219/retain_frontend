import { Outlet } from "react-router-dom";
import { DashboardNavbar } from "@/components/dashboardNavbar/DashboardNavbar";
import { WarningModal } from "@/components/modal/WarningModal/WarningModal";

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans">
      {/* The New Clean Navbar */}
      <DashboardNavbar />

      {/* Page Content */}
      <main className="animate-in fade-in duration-500">
        <Outlet />
        <WarningModal />
      </main>
    </div>
  );
};
