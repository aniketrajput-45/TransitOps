import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import fuelService from "../../services/fuel.service";
import vehicleService from "../../services/vehicle.service";
import {
  Fuel,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";

// Zod validation schema
const fuelFormSchema = z.object({
  vehicle: z.string().min(1, { message: "Vehicle assignment is required" }),
  liters: z.coerce
    .number()
    .min(0.01, { message: "Liters must be a positive number" }),
  cost: z.coerce
    .number()
    .min(0.01, { message: "Cost must be a positive number" }),
  date: z.string().min(1, { message: "Date is required" }),
});

const FuelLogs = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fuelFormSchema),
    defaultValues: {
      vehicle: "",
      liters: 10,
      cost: 12,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsData, vehiclesData] = await Promise.all([
        fuelService.getFuelLogs(),
        vehicleService.getVehicles(),
      ]);

      if (logsData.success) setLogs(logsData.logs);
      if (vehiclesData.success) setVehicles(vehiclesData.vehicles);
    } catch (err) {
      console.error(err);
      setError("Failed to load fuel purchase records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setModalError("");
    reset({
      vehicle: vehicles[0]?._id || "",
      liters: 10,
      cost: 12,
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    setModalError("");
    try {
      const response = await fuelService.createFuelLog(data);
      if (response.success) {
        fetchData();
        handleCloseModal();
      } else {
        setModalError(response.message || "Failed to log fuel purchase.");
      }
    } catch (err) {
      setModalError(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // KPI Calculations
  const stats = {
    totalLiters: logs.reduce((sum, l) => sum + l.liters, 0),
    totalCost: logs.reduce((sum, l) => sum + l.cost, 0),
    avgCostPerLiter: logs.length > 0
      ? logs.reduce((sum, l) => sum + l.cost, 0) / logs.reduce((sum, l) => sum + l.liters, 0)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Fuel Logs</h2>
          <p className="text-slate-400 text-sm mt-1">Record fuel purchases and track fuel efficiency metrics</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition duration-150 gap-2 text-sm shadow-[0_4px_15px_rgba(6,182,212,0.15)]"
        >
          <Plus className="w-4 h-4" />
          Log Fuel Purchase
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fuel Purchased</span>
            <Fuel className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalLiters.toFixed(1)} Liters</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fuel Expenditure</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white">${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Cost / Liter</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">${stats.avgCostPerLiter.toFixed(2)}</p>
        </div>
      </div>

      {/* Logs Table Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading fuel logs database...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Fuel className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No fuel records logged</p>
            <p className="text-xs text-slate-600 mt-1">Manual logs and completed trip fuel details will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-xs">
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Liters Purchased</th>
                  <th className="px-6 py-4">Total Cost</th>
                  <th className="px-6 py-4">Price per Liter</th>
                  <th className="px-6 py-4">Linked Trip</th>
                  <th className="px-6 py-4">Logged Date</th>
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
                    <td className="px-6 py-4 text-white font-medium">{log.liters.toFixed(2)} L</td>
                    <td className="px-6 py-4 text-slate-200 font-semibold">${log.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-400">${(log.cost / log.liters).toFixed(2)} / L</td>
                    <td className="px-6 py-4">
                      {log.trip ? (
                        <span className="text-xs text-cyan-400 font-medium">
                          {log.trip.source} → {log.trip.destination}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Manual entry</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-350">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Entry Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Log Fuel Purchase</h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Vehicle select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Assign Vehicle
                </label>
                <select
                  {...register("vehicle")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition cursor-pointer"
                >
                  <option value="">-- Select Fleet Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} - {v.name}
                    </option>
                  ))}
                </select>
                {errors.vehicle && <p className="text-xs text-rose-400 pl-1 mt-0.5">{errors.vehicle.message}</p>}
              </div>

              {/* Liters & Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    Liters Purchased
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 45.5"
                    {...register("liters")}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                  />
                  {errors.liters && <p className="text-xs text-rose-400 pl-1 mt-0.5">{errors.liters.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    Total Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 54.6"
                    {...register("cost")}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                  />
                  {errors.cost && <p className="text-xs text-rose-400 pl-1 mt-0.5">{errors.cost.message}</p>}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                />
                {errors.date && <p className="text-xs text-rose-400 pl-1 mt-0.5">{errors.date.message}</p>}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-3 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || vehicles.length === 0}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelLogs;
