import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import expenseService from "../../services/expense.service";
import vehicleService from "../../services/vehicle.service";
import {
  DollarSign,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Tag,
  Receipt,
  SlidersHorizontal,
} from "lucide-react";

// Zod validation schema
const expenseFormSchema = z.object({
  vehicle: z.string().min(1, { message: "Vehicle assignment is required" }),
  type: z.enum(["Toll", "Permit", "Fine", "Insurance", "Other"], {
    errorMap: () => ({ message: "Please select a valid expense category" }),
  }),
  cost: z.coerce
    .number()
    .min(0.01, { message: "Cost must be a positive number" }),
  description: z.string().optional(),
  date: z.string().min(1, { message: "Date is required" }),
});

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

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
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      vehicle: "",
      type: "Toll",
      cost: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesData, vehiclesData] = await Promise.all([
        expenseService.getExpenses({ type: typeFilter }),
        vehicleService.getVehicles(),
      ]);

      if (expensesData.success) setExpenses(expensesData.expenses);
      if (vehiclesData.success) setVehicles(vehiclesData.vehicles);
    } catch (err) {
      console.error(err);
      setError("Failed to load operational expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const handleOpenModal = () => {
    setModalError("");
    reset({
      vehicle: vehicles[0]?._id || "",
      type: "Toll",
      cost: 15,
      description: "",
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
      const response = await expenseService.createExpense(data);
      if (response.success) {
        fetchData();
        handleCloseModal();
      } else {
        setModalError(response.message || "Failed to log expense.");
      }
    } catch (err) {
      setModalError(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.cost, 0);
  const breakdown = {
    Toll: expenses.filter((e) => e.type === "Toll").reduce((s, e) => s + e.cost, 0),
    Permit: expenses.filter((e) => e.type === "Permit").reduce((s, e) => s + e.cost, 0),
    Fine: expenses.filter((e) => e.type === "Fine").reduce((s, e) => s + e.cost, 0),
    Insurance: expenses.filter((e) => e.type === "Insurance").reduce((s, e) => s + e.cost, 0),
    Other: expenses.filter((e) => e.type === "Other").reduce((s, e) => s + e.cost, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">General Expenses</h2>
          <p className="text-slate-400 text-sm mt-1">Audit tolls, permits, fines, and other operational expenditures</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition duration-150 gap-2 text-sm shadow-[0_4px_15px_rgba(6,182,212,0.15)]"
        >
          <Plus className="w-4 h-4" />
          Log Expense
        </button>
      </div>

      {/* KPI summaries */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl col-span-2">
          <div className="flex justify-between items-center text-slate-500 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Expenditures</span>
            <DollarSign className="w-4 h-4 text-cyan-450" />
          </div>
          <p className="text-2xl font-black text-white">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Tolls</div>
          <p className="text-lg font-bold text-slate-200">${breakdown.Toll.toFixed(0)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Permits</div>
          <p className="text-lg font-bold text-slate-200">${breakdown.Permit.toFixed(0)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Insurance</div>
          <p className="text-lg font-bold text-slate-200">${breakdown.Insurance.toFixed(0)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Fines & Fess</div>
          <p className="text-lg font-bold text-rose-400">${breakdown.Fine.toFixed(0)}</p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span>Category Filter:</span>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400 transition cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="Toll">Toll</option>
          <option value="Permit">Permit</option>
          <option value="Fine">Fine</option>
          <option value="Insurance">Insurance</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Expense Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading expense records...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>{error}</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Receipt className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No expense records logged</p>
            <p className="text-xs text-slate-600 mt-1">Log tolls or operational fees to see entries here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-xs">
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Expense Type</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Cost</th>
                  <th className="px-6 py-4">Logged Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      {exp.vehicle ? (
                        <div className="flex flex-col">
                          <span className="font-mono font-semibold text-cyan-400">{exp.vehicle.registrationNumber}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{exp.vehicle.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">Deleted Vehicle</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-white font-medium">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" />
                        {exp.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 italic">
                      {exp.description || "--"}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-200 font-semibold">${exp.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-350">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(exp.date).toLocaleDateString()}</span>
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
              <h3 className="font-bold text-lg text-white">Log Fleet Expense</h3>
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

              {/* Vehicle Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Fleet Vehicle
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

              <div className="grid grid-cols-2 gap-4">
                {/* Expense Type Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    Expense Category
                  </label>
                  <select
                    {...register("type")}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition cursor-pointer"
                  >
                    <option value="Toll">Toll</option>
                    <option value="Permit">Permit</option>
                    <option value="Fine">Fine</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.type && <p className="text-xs text-rose-400 pl-1 mt-0.5">{errors.type.message}</p>}
                </div>

                {/* Cost */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    Expense Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 24.50"
                    {...register("cost")}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                  />
                  {errors.cost && <p className="text-xs text-rose-400 pl-1 mt-0.5">{errors.cost.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Toll booth route MH-04, Permit processing"
                  {...register("description")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                  Log Date
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

export default Expenses;
