import React, { useState, useEffect } from "react";
import dashboardService from "../../services/dashboard.service";
import {
  Car,
  CheckCircle,
  Wrench,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Percent,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getStats({
        type: typeFilter,
        status: statusFilter,
        region: regionFilter,
      });
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [typeFilter, statusFilter, regionFilter]);

  // Construct chart data based on loaded stats
  const chartData = stats
    ? [
        { name: "Available", value: stats.available, color: "#10b981" },
        { name: "On Trip", value: stats.activeVehicles, color: "#f59e0b" },
        { name: "In Shop", value: stats.inShop, color: "#f97316" },
        { name: "Retired", value: stats.retired, color: "#ef4444" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time status monitor and operational analytics</p>
        </div>
      </div>

      {/* Dynamic Filters Row */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold">Filter Dashboard:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Type Select */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Vehicle Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          {/* Region Select */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Regions</option>
            <option value="North">North Region</option>
            <option value="South">South Region</option>
            <option value="East">East Region</option>
            <option value="West">West Region</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-650 animate-spin" />
          <p className="text-slate-500 text-sm">Aggregating real-time stats...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center text-rose-600 flex flex-col items-center justify-center gap-2">
          <AlertCircle className="w-8 h-8" />
          <p>{error}</p>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Fleet */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition duration-200">
              <div className="flex justify-between items-center text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Fleet size</span>
                <Car className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stats.totalFleet}</p>
              <div className="text-[10px] text-slate-500 mt-1">Filtered database records</div>
            </div>

            {/* Available Vehicles */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition duration-200">
              <div className="flex justify-between items-center text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Available Fleet</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-600">{stats.available}</p>
              <div className="text-[10px] text-slate-500 mt-1">Ready for dispatcher schedule</div>
            </div>

            {/* Vehicles in Shop */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition duration-200">
              <div className="flex justify-between items-center text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">In Shop (Repair)</span>
                <Wrench className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-3xl font-extrabold text-orange-650">{stats.inShop}</p>
              <div className="text-[10px] text-slate-500 mt-1">Placed under active maintenance</div>
            </div>

            {/* Active Trips */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition duration-200">
              <div className="flex justify-between items-center text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Dispatched Trips</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-3xl font-extrabold text-amber-600">{stats.activeTrips}</p>
              <div className="text-[10px] text-slate-500 mt-1">Active transit operations</div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pending Dispatches */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition duration-200">
              <div className="flex justify-between items-center text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Draft Trips</span>
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-800">{stats.pendingTrips}</p>
              <div className="text-[10px] text-slate-500 mt-1">Awaiting dispatcher release</div>
            </div>

            {/* Drivers On Duty */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition duration-200">
              <div className="flex justify-between items-center text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Drivers on Duty</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-800">{stats.driversOnDuty}</p>
              <div className="text-[10px] text-slate-500 mt-1">Currently operating vehicles</div>
            </div>

            {/* Utilization Rate */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition duration-200 col-span-2 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-50/50 rounded-full blur-2xl -z-10"></div>
              <div>
                <div className="flex justify-between items-center text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Fleet Utilization</span>
                  <Percent className="w-4 h-4 text-indigo-700" />
                </div>
                <p className="text-3xl font-black text-indigo-600">{stats.utilizationRate.toFixed(1)}%</p>
              </div>

              {/* utilization progress bar */}
              <div className="mt-3.5 space-y-1.5">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.utilizationRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>0% Idle</span>
                  <span>Active Capacity</span>
                  <span>100% Load</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6">Fleet Allocation Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#cbd5e1",
                      borderRadius: "12px",
                      color: "#0f172a",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    cursor={{ fill: "rgba(0, 0, 0, 0.02)" }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
