import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";

// Import Pages
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Vehicles from "../pages/Vehicles/Vehicles";
import Drivers from "../pages/Drivers/Drivers";
import Trips from "../pages/Trips/Trips";
import Maintenance from "../pages/Maintenance/Maintenance";
import FuelLogs from "../pages/FuelLogs/FuelLogs";
import Expenses from "../pages/Expenses/Expenses";
import Reports from "../pages/Reports/Reports";

// Beautiful Fullscreen Loading Spinner
const LoadingSpinner = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin"></div>
    <p className="text-cyan-400 font-semibold text-sm tracking-wider">Loading TransitOps...</p>
  </div>
);

// ProtectedRoute checks if user is logged in and has appropriate role permissions
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <DashboardLayout>
        <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Access Denied</h3>
          <p className="text-slate-400 text-sm">
            Your current role (<span className="text-cyan-400 font-semibold">{user?.role}</span>) does not have permission to view this section.
          </p>
          <div className="pt-2">
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// PublicRoute prevents logged-in users from visiting login/register screens
const PublicRoute = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes with Dashboard Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute allowedRoles={["Fleet Manager", "Safety Officer", "Driver", "Financial Analyst", "Dispatch Officer"]}>
            <Vehicles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/drivers"
        element={
          <ProtectedRoute allowedRoles={["Fleet Manager", "Safety Officer", "Driver", "Financial Analyst", "Dispatch Officer"]}>
            <Drivers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips"
        element={
          <ProtectedRoute allowedRoles={["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst", "Dispatch Officer"]}>
            <Trips />
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute allowedRoles={["Fleet Manager", "Safety Officer", "Financial Analyst"]}>
            <Maintenance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fuel-logs"
        element={
          <ProtectedRoute allowedRoles={["Fleet Manager", "Financial Analyst", "Driver"]}>
            <FuelLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={["Fleet Manager", "Financial Analyst"]}>
            <Expenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["Fleet Manager", "Financial Analyst", "Safety Officer"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Fallback routing */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
