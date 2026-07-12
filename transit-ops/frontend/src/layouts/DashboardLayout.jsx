import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Car,
  Users,
  Route,
  Wrench,
  Fuel,
  DollarSign,
  BarChart3,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst", "Dispatch Officer"],
    },
    {
      name: "Vehicles",
      href: "/vehicles",
      icon: Car,
      roles: ["Fleet Manager", "Safety Officer", "Driver", "Financial Analyst", "Dispatch Officer"], // Accessible by all, but write permissions may vary
    },
    {
      name: "Drivers",
      href: "/drivers",
      icon: Users,
      roles: ["Fleet Manager", "Safety Officer", "Driver", "Financial Analyst", "Dispatch Officer"],
    },
    {
      name: "Trip Management",
      href: "/trips",
      icon: Route,
      roles: ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst", "Dispatch Officer"],
    },
    {
      name: "Maintenance",
      href: "/maintenance",
      icon: Wrench,
      roles: ["Fleet Manager", "Safety Officer", "Financial Analyst"],
    },
    {
      name: "Fuel Logs",
      href: "/fuel-logs",
      icon: Fuel,
      roles: ["Fleet Manager", "Financial Analyst", "Driver"],
    },
    {
      name: "Expenses",
      href: "/expenses",
      icon: DollarSign,
      roles: ["Fleet Manager", "Financial Analyst"],
    },
    {
      name: "Reports & Analytics",
      href: "/reports",
      icon: BarChart3,
      roles: ["Fleet Manager", "Financial Analyst", "Safety Officer"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <span className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            🚀 TransitOps
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition duration-150 gap-3 ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400 pl-3"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-100"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        {user && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-cyan-400 font-medium truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="relative flex flex-col w-64 max-w-xs bg-slate-900 border-r border-slate-800 animate-slide-in">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
              <span className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                🚀 TransitOps
              </span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition gap-3 ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400 pl-3"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            {user && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                    <p className="text-xs text-cyan-400 font-medium">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800">
          <button
            type="button"
            className="md:hidden p-2 -ml-2 rounded-md text-slate-400 hover:text-slate-100 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 md:flex-none">
            <h1 className="text-lg font-semibold text-slate-200">
              {navigation.find((item) => item.href === location.pathname)?.name || "TransitOps"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {user?.role}
            </span>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
