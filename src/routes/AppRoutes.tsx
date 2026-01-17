import { Routes, Route } from "react-router-dom";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { ClientView } from "@/pages/clientView/ClientView";
import { Landing } from "@/pages/landing/Landing";
import { AppLayout } from "@/layouts/AppLayout";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Landing Page */}
      <Route path="/" element={<Landing />} />

      <Route element={<AppLayout />}>
        <Route path="/manage/:adminToken" element={<Dashboard />} />
      </Route>
      <Route path="/:slug" element={<ClientView />} />
    </Routes>
  );
};
