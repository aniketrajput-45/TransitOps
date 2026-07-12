import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import maintenanceService from "../../services/maintenance.service";
import vehicleService from "../../services/vehicle.service";
import {
  Wrench,
  Plus,
  SlidersHorizontal,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  Briefcase,
} from "lucide-react";

// Zod schema for creating maintenance log
const maintenanceSchema = z.object({
  vehicle: z.string().min(1, { message: "Vehicle is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
});

// Zod schema for closing maintenance log
const closeSchema = z.object({
  cost: z.coerce
    .number()
    .min(0, { message: "Cost must be a positive number" }),
});

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Close Modal
  const [closingLog, setClosingLog] = useState(null);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [closeError, setCloseError] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const {
    register: registerLog,
    handleSubmit: handleSubmitLog,
    reset: resetLog,
    formState: { errors: logErrors },
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicle: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  const {
    register: registerClose,
    handleSubmit: handleSubmitClose,
    reset: resetClose,
    formState: { errors: closeErrors },
  } = useForm({
    resolver: zodResolver(closeSchema),
    defaultValues: {
      cost: 0,
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsData, vehiclesData] = await Promise.all([
        maintenanceService.getMaintenanceLogs({ status: statusFilter }),
        vehicleService.getVehicles(),
      ]);

      if (logsData.success) setLogs(logsData.logs);
      if (vehiclesData.success) setVehicles(vehiclesData.vehicles);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch maintenance logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const availableVehicles = vehicles.filter((v) => v.status === "Available");

  const handleOpenCreate = () => {
    setCreateError("");
    resetLog({
      vehicle: availableVehicles[0]?._id || "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
    });
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
  };

  const handleOpenCloseLog = (log) => {
    setClosingLog(log);
    setCloseError("");
    resetClose({
      cost: 0,
    });
    setIsCloseOpen(true);
  };

  const handleCloseCloseLog = () => {
    setIsCloseOpen(false);
    setClosingLog(null);
  };

  const onCreateLog = async (data) => {
    setIsSaving(true);
    setCreateError("");
    try {
      const response = await maintenanceService.createMaintenanceLog(data);
      if (response.success) {
        fetchData();
        handleCloseCreate();
      } else {
        setCreateError(response.message || "Failed to log maintenance.");
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const onCloseLogSubmit = async (data) => {
    setIsClosing(true);
    setCloseError("");
    try {
      const response = await maintenanceService.closeMaintenanceLog(closingLog._id, data);
      if (response.success) {
        fetchData();
        handleCloseCloseLog();
      } else {
        setCloseError(response.message || "Failed to close maintenance log.");
      }
    } catch (err) {
      setCloseError(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsClosing(false);
    }
  };

  // KPIs
  const kpis = {
    total: logs.length,
    active: logs.filter((l) => l.status === "Active").length,
    closed: logs.filter((l) => l.status === "Closed").length,
    totalSpent: logs.filter((l) => l.status === "Closed").reduce((acc, curr) => acc + curr.cost, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Maintenance Workorders</h2>
          <p className="text-slate-400 text-sm mt-1">Track vehicle repairs, maintenance costs, and schedules</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition duration-150 gap-2 text-sm shadow-[0_4px_15px_rgba(6,182,212,0.15)]"
        >
          <Plus className="w-4 h-4" />
          Log Maintenance
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Workorders</span>
            <Wrench className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{kpis.total}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Shop</span>
            <Calendar className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-400">{kpis.active}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Closed Orders</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{kpis.closed}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Spent</span>
            <DollarSign className="w-4 h-4 text-rose-450" />
          </div>
          <p className="text-2xl font-bold text-rose-400">${kpis.totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span>Filters:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Main Table Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading maintenance records...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Wrench className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No maintenance entries logged</p>
            <p className="text-xs text-slate-600 mt-1">Add a vehicle to maintenance log to begin tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-xs">
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">End Date</th>
                  <th className="px-6 py-4 text-right">Cost</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      {log.vehicle ? (
                        <div className="flex flex-col">
                          <span className="font-mono font-semibold text-cyan-400">{log.vehicle.registrationNumber}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{log.vehicle.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">Deleted Vehicle</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{log.description}</td>
                    <td className="px-6 py-4 text-slate-300">{new Date(log.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-450">
                      {log.endDate ? new Date(log.endDate).toLocaleDateString() : "--"}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">
                      {log.status === "Closed" ? `$${log.cost.toLocaleString()}` : "Estimating..."}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          log.status === "Active"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {log.status === "Active" ? (
                        <button
                          onClick={() => handleOpenCloseLog(log)}
                          className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 hover:border-transparent rounded-lg font-semibold text-xs transition"
                        >
                          Close Workorder
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">No Actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Maintenance Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Log Active Maintenance</h3>
              <button
                onClick={handleCloseCreate}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLog(onCreateLog)} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Vehicle Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 flex justify-between">
                  <span>Select Fleet Vehicle</span>
                  {availableVehicles.length === 0 && (
                    <span className="text-[10px] text-rose-400 font-bold lowercase">No available vehicles!</span>
                  )}
                </label>
                <select
                  {...registerLog("vehicle")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition cursor-pointer"
                >
                  <option value="">-- Select Available Vehicle --</option>
                  {availableVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} - {v.name} ({v.type})
                    </option>
                  ))}
                </select>
                {logErrors.vehicle && <p className="text-xs text-rose-400 pl-1 mt-0.5">{logErrors.vehicle.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Issue Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engine Oil filter replacement, Brake adjustment"
                  {...registerLog("description")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                />
                {logErrors.description && <p className="text-xs text-rose-400 pl-1 mt-0.5">{logErrors.description.message}</p>}
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Placed In Shop Date
                </label>
                <input
                  type="date"
                  {...registerLog("startDate")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                />
                {logErrors.startDate && <p className="text-xs text-rose-400 pl-1 mt-0.5">{logErrors.startDate.message}</p>}
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || availableVehicles.length === 0}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Place in Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Maintenance Dialog */}
      {isCloseOpen && closingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Close Maintenance Workorder</h3>
              <button
                onClick={handleCloseCloseLog}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClose(onCloseLogSubmit)} className="p-6 space-y-4">
              {closeError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{closeError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-mono font-bold text-cyan-400">{closingLog.vehicle?.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Description:</span>
                  <span className="text-white font-medium">{closingLog.description}</span>
                </div>
              </div>

              {/* Maintenance Cost */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Final Cost ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 150.00"
                    {...registerClose("cost")}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
                {closeErrors.cost && <p className="text-xs text-rose-400 pl-1 mt-0.5">{closeErrors.cost.message}</p>}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCloseLog}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClosing}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-black font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {isClosing && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                  Close workorder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
