import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import driverService from "../../services/driver.service";
import {
  Users,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Shield,
  Phone,
  Calendar,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

// Zod validation schema
const driverFormSchema = z.object({
  name: z.string().min(1, { message: "Driver name is required" }),
  licenseNumber: z
    .string()
    .min(1, { message: "License number is required" })
    .regex(/^[A-Z0-9- ]+$/i, {
      message: "License number must be alphanumeric",
    }),
  licenseCategory: z.string().min(1, { message: "License category is required" }),
  licenseExpiryDate: z.string().min(1, { message: "License expiry date is required" }),
  contactNumber: z
    .string()
    .min(1, { message: "Contact number is required" })
    .regex(/^\+?[0-9-\s]+$/, { message: "Invalid contact number format" }),
  safetyScore: z.coerce
    .number()
    .min(0, { message: "Safety score cannot be less than 0" })
    .max(100, { message: "Safety score cannot be more than 100" }),
  status: z.enum(["Available", "On Trip", "Off Duty", "Suspended"]),
});

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: "",
      licenseNumber: "",
      licenseCategory: "Class A CDL",
      licenseExpiryDate: "",
      contactNumber: "",
      safetyScore: 100,
      status: "Available",
    },
  });

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await driverService.getDrivers({
        search,
        status: statusFilter,
      });
      if (data.success) {
        setDrivers(data.drivers);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load drivers registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [search, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingDriver(null);
    setModalError("");
    reset({
      name: "",
      licenseNumber: "",
      licenseCategory: "Class A CDL",
      licenseExpiryDate: "",
      contactNumber: "",
      safetyScore: 100,
      status: "Available",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver) => {
    setEditingDriver(driver);
    setModalError("");
    // format date to YYYY-MM-DD for standard html inputs
    const formattedDate = driver.licenseExpiryDate
      ? new Date(driver.licenseExpiryDate).toISOString().split("T")[0]
      : "";
    reset({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiryDate: formattedDate,
      contactNumber: driver.contactNumber,
      safetyScore: driver.safetyScore,
      status: driver.status,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    setModalError("");
    try {
      if (editingDriver) {
        // Update
        const response = await driverService.updateDriver(editingDriver._id, data);
        if (response.success) {
          fetchDrivers();
          handleCloseModal();
        } else {
          setModalError(response.message || "Failed to update driver profile.");
        }
      } else {
        // Create
        const response = await driverService.createDriver(data);
        if (response.success) {
          fetchDrivers();
          handleCloseModal();
        } else {
          setModalError(response.message || "Failed to create driver profile.");
        }
      }
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "An error occurred while saving driver profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this driver profile from the registry?")) {
      try {
        const response = await driverService.deleteDriver(id);
        if (response.success) {
          fetchDrivers();
        }
      } catch (err) {
        alert("Failed to delete driver: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Check license expiration status
  const getLicenseStatus = (expiryDateString) => {
    if (!expiryDateString) return { status: "unknown", text: "Unknown", color: "text-slate-450" };
    const expiry = new Date(expiryDateString);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "expired", text: "Expired", color: "text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg inline-block text-[10px]", isWarning: true };
    } else if (diffDays <= 30) {
      return { status: "expiring", text: `Expiring soon (${diffDays} days)`, color: "text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg inline-block text-[10px]", isWarning: true };
    }
    return { status: "valid", text: "Valid", color: "text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg inline-block text-[10px]" };
  };

  // KPIs
  const kpis = {
    total: drivers.length,
    available: drivers.filter((d) => d.status === "Available").length,
    onTrip: drivers.filter((d) => d.status === "On Trip").length,
    offDuty: drivers.filter((d) => d.status === "Off Duty").length,
    suspended: drivers.filter((d) => d.status === "Suspended").length,
    expiredLicenses: drivers.filter((d) => getLicenseStatus(d.licenseExpiryDate).isWarning).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Driver Management</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor driver compliance, metrics, and logs</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition duration-150 gap-2 text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Expiry / Warning Banner */}
      {kpis.expiredLicenses > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <span className="font-bold">Attention Required:</span> There are <span className="underline font-semibold">{kpis.expiredLicenses} driver(s)</span> with expired or expiring commercial licenses. They cannot be assigned to trips.
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Drivers</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{kpis.total}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{kpis.available}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">On Trip</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{kpis.onTrip}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Off Duty</span>
            <Calendar className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-700">{kpis.offDuty}</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Suspended</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{kpis.suspended}</p>
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
            placeholder="Search by name or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <SlidersHorizontal className="w-4 h-4 text-indigo-650" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Drivers List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm">Loading drivers records...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-600 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>{error}</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No drivers profiles registered</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your filters or add a new driver.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
                  <th className="px-6 py-4">Driver Name</th>
                  <th className="px-6 py-4">License Number</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">License Expiry</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-center">Safety Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {drivers.map((d) => {
                  const licenseExp = getLicenseStatus(d.licenseExpiryDate);
                  return (
                    <tr key={d._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">{d.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-700">{d.licenseNumber}</td>
                      <td className="px-6 py-4 text-slate-650">{d.licenseCategory}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-slate-800">{new Date(d.licenseExpiryDate).toLocaleDateString()}</span>
                          <span className={licenseExp.color}>
                            {licenseExp.text}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{d.contactNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1">
                          <Shield className={`w-3.5 h-3.5 ${
                            d.safetyScore >= 85 ? "text-emerald-600" : d.safetyScore >= 70 ? "text-amber-600" : "text-rose-600"
                          }`} />
                          <span className="font-semibold text-slate-800">{d.safetyScore}/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            d.status === "Available"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-255"
                              : d.status === "On Trip"
                              ? "bg-amber-50 text-amber-700 border-amber-255"
                              : d.status === "Off Duty"
                              ? "bg-slate-100 text-slate-700 border-slate-200"
                              : "bg-rose-50 text-rose-700 border-rose-255"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(d)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(d._id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl overflow-hidden shadow-xl relative">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">
                {editingDriver ? "Edit Driver Profile" : "Register Driver"}
              </h3>
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

              <div className="grid grid-cols-2 gap-4">
                {/* Driver Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    {...register("name")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.name && <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.name.message}</p>}
                </div>

                {/* License Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL-1234567"
                    {...register("licenseNumber")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.licenseNumber && (
                    <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.licenseNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* License Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    License Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Class A CDL"
                    {...register("licenseCategory")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.licenseCategory && (
                    <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.licenseCategory.message}</p>
                  )}
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    {...register("licenseExpiryDate")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.licenseExpiryDate && (
                    <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.licenseExpiryDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Contact Number */}
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0199"
                    {...register("contactNumber")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.contactNumber && (
                    <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.contactNumber.message}</p>
                  )}
                </div>

                {/* Safety Score */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Safety Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    {...register("safetyScore")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.safetyScore && (
                    <p className="text-xs text-rose-600 pl-1 mt-0.5">{errors.safetyScore.message}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                  Driver Duty Status
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              {/* Submit / Cancel Actions */}
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
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
