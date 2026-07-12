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
          <h2 className="text-2xl font-extrabold text-slate-900">Fuel Logs</h2>
          <p className="text-slate-500 text-sm mt-1">Record fuel purchases and track fuel efficiency metrics</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition duration-150 gap-2 text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Log Fuel Purchase
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fuel Purchased</span>
            <Fuel className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalLiters.toFixed(1)} Liters</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fuel Expenditure</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600">${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Cost / Liter</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">${stats.avgCostPerLiter.toFixed(2)}</p>
        </div>
      </div>

      {/* Logs Table Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm">Loading fuel logs database...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-600 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Fuel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-555">No fuel records logged</p>
            <p className="text-xs text-slate-400 mt-1">Manual logs and completed trip fuel details will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Liters Purchased</th>
                  <th className="px-6 py-4">Total Cost</th>
                  <th className="px-6 py-4">Price per Liter</th>
                  <th className="px-6 py-4">Linked Trip</th>
                  <th className="px-6 py-4">Logged Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      {log.vehicle ? (
                        <div className="flex flex-col">
                          <span className="font-mono font-semibold text-indigo-650">{log.vehicle.registrationNumber}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{log.vehicle.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Deleted Vehicle</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{log.liters.toFixed(2)} L</td>
                    <td className="px-6 py-4 text-slate-900 font-semibold">${log.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-500">${(log.cost / log.liters).toFixed(2)} / L</td>
                    <td className="px-6 py-4">
                      {log.trip ? (
                        <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-xl">
                          {log.trip.source} → {log.trip.destination}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-450 italic bg-slate-100 px-2.5 py-1 rounded-xl">Manual entry</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-xl relative">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Log Fuel Purchase</h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Vehicle select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                  Assign Vehicle
                </label>
                <select
                  {...register("vehicle")}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="">-- Select Fleet Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} - {v.name}
                    </option>
                  ))}
                </select>
                {errors.vehicle && <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.vehicle.message}</p>}
              </div>

              {/* Liters & Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Liters Purchased
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 45.5"
                    {...register("liters")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.liters && <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.liters.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-550 uppercase tracking-wider pl-1">
                    Total Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 54.6"
                    {...register("cost")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.cost && <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.cost.message}</p>}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                />
                {errors.date && <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.date.message}</p>}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || vehicles.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin text-white" />}
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
