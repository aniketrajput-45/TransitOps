import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import vehicleService from "../../services/vehicle.service";
import {
  Car,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  TrendingUp,
  Wrench,
  Ban,
  CheckCircle,
} from "lucide-react";

// Zod validation schema
const vehicleFormSchema = z.object({
  registrationNumber: z
    .string()
    .min(1, { message: "Registration number is required" })
    .regex(/^[A-Z0-9- ]+$/i, {
      message: "Can only contain alphanumeric characters, spaces, and hyphens",
    }),
  name: z.string().min(1, { message: "Vehicle model name is required" }),
  type: z.string().min(1, { message: "Vehicle type is required" }),
  maxLoadCapacity: z.coerce
    .number()
    .min(0, { message: "Load capacity must be a positive number" }),
  odometer: z.coerce
    .number()
    .min(0, { message: "Odometer must be a positive number" }),
  acquisitionCost: z.coerce
    .number()
    .min(0, { message: "Acquisition cost must be a positive number" }),
  status: z.enum(["Available", "On Trip", "In Shop", "Retired"]),
});

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      registrationNumber: "",
      name: "",
      type: "Truck",
      maxLoadCapacity: 1000,
      odometer: 0,
      acquisitionCost: 15000,
      status: "Available",
    },
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getVehicles({
        search,
        type: typeFilter,
        status: statusFilter,
      });
      if (data.success) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch vehicles list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, typeFilter, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setModalError("");
    reset({
      registrationNumber: "",
      name: "",
      type: "Truck",
      maxLoadCapacity: 1000,
      odometer: 0,
      acquisitionCost: 15000,
      status: "Available",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setModalError("");
    reset({
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      maxLoadCapacity: vehicle.maxLoadCapacity,
      odometer: vehicle.odometer,
      acquisitionCost: vehicle.acquisitionCost,
      status: vehicle.status,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    setModalError("");
    try {
      if (editingVehicle) {
        // Update
        const response = await vehicleService.updateVehicle(editingVehicle._id, data);
        if (response.success) {
          fetchVehicles();
          handleCloseModal();
        } else {
          setModalError(response.message || "Failed to update vehicle.");
        }
      } else {
        // Create
        const response = await vehicleService.createVehicle(data);
        if (response.success) {
          fetchVehicles();
          handleCloseModal();
        } else {
          setModalError(response.message || "Failed to register vehicle.");
        }
      }
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "An error occurred while saving the vehicle.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle from the registry?")) {
      try {
        const response = await vehicleService.deleteVehicle(id);
        if (response.success) {
          fetchVehicles();
        }
      } catch (err) {
        alert("Failed to delete vehicle: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // KPI calculations
  const kpis = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === "Available").length,
    onTrip: vehicles.filter((v) => v.status === "On Trip").length,
    inShop: vehicles.filter((v) => v.status === "In Shop").length,
    retired: vehicles.filter((v) => v.status === "Retired").length,
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Vehicle Registry</h2>
          <p className="text-slate-500 text-sm mt-1">Manage, audit, and track your fleet assets</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition duration-150 gap-2 text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Fleet</span>
            <Car className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.total}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{kpis.available}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">On Trip</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{kpis.onTrip}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Shop</span>
            <Wrench className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{kpis.inShop}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Retired</span>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{kpis.retired}</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by model or plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <SlidersHorizontal className="w-4 h-4 text-indigo-650" />
            <span>Filters:</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm">Loading vehicles database...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-600 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>{error}</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No vehicles registered</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your filters or add a new vehicle asset.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
                  <th className="px-6 py-4">Reg Number</th>
                  <th className="px-6 py-4">Model Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Max Load</th>
                  <th className="px-6 py-4 text-right">Odometer</th>
                  <th className="px-6 py-4 text-right">Acq. Cost</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-semibold text-indigo-650">{v.registrationNumber}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{v.name}</td>
                    <td className="px-6 py-4 text-slate-600">{v.type}</td>
                    <td className="px-6 py-4 text-right text-slate-650">{v.maxLoadCapacity.toLocaleString()} kg</td>
                    <td className="px-6 py-4 text-right text-slate-650">{v.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4 text-right text-slate-650">${v.acquisitionCost.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          v.status === "Available"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-255"
                            : v.status === "On Trip"
                            ? "bg-amber-50 text-amber-700 border-amber-255"
                            : v.status === "In Shop"
                            ? "bg-orange-50 text-orange-700 border-orange-255"
                            : "bg-rose-50 text-rose-700 border-rose-255"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl overflow-hidden shadow-xl relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">
                {editingVehicle ? "Edit Vehicle Asset" : "Register New Vehicle"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Reg Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Registration Plate
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH-12-AB-1234"
                    disabled={!!editingVehicle}
                    {...register("registrationNumber")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
                  />
                  {errors.registrationNumber && (
                    <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.registrationNumber.message}</p>
                  )}
                </div>

                {/* Name / Model */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Vehicle Model Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Volvo FH16"
                    {...register("name")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.name && <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Vehicle Type
                  </label>
                  <select
                    {...register("type")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                  </select>
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Max Load Capacity */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Max Load (kg)
                  </label>
                  <input
                    type="number"
                    {...register("maxLoadCapacity")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.maxLoadCapacity && (
                    <p className="text-xs text-rose-650 pl-1 mt-0.5">{errors.maxLoadCapacity.message}</p>
                  )}
                </div>

                {/* Odometer */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    {...register("odometer")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.odometer && (
                    <p className="text-xs text-rose-650 pl-1 mt-0.5">{errors.odometer.message}</p>
                  )}
                </div>

                {/* Acquisition Cost */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    {...register("acquisitionCost")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.acquisitionCost && (
                    <p className="text-xs text-rose-650 pl-1 mt-0.5">{errors.acquisitionCost.message}</p>
                  )}
                </div>
              </div>

              {/* Form Footer Actions */}
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
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
