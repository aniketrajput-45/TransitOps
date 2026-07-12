import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import tripService from "../../services/trip.service";
import vehicleService from "../../services/vehicle.service";
import driverService from "../../services/driver.service";
import {
  Route,
  Plus,
  SlidersHorizontal,
  Play,
  Check,
  Ban,
  X,
  Loader2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

// Zod validation schema for creating a trip
const tripFormSchema = z.object({
  source: z.string().min(1, { message: "Source location is required" }),
  destination: z.string().min(1, { message: "Destination location is required" }),
  vehicle: z.string().min(1, { message: "Vehicle assignment is required" }),
  driver: z.string().min(1, { message: "Driver assignment is required" }),
  cargoWeight: z.coerce
    .number()
    .min(0, { message: "Cargo weight must be a positive number" }),
  plannedDistance: z.coerce
    .number()
    .min(0, { message: "Planned distance must be a positive number" }),
  revenue: z.coerce
    .number()
    .min(0, { message: "Trip revenue must be a positive number" }),
});

// Zod validation schema for completing a trip
const completionFormSchema = z.object({
  finalOdometer: z.coerce
    .number()
    .min(0, { message: "Final odometer must be a positive number" }),
  fuelConsumedLiters: z.coerce
    .number()
    .min(0, { message: "Fuel consumed must be a positive number" }),
  fuelCost: z.coerce
    .number()
    .min(0, { message: "Fuel cost must be a positive number" }),
  actualDistance: z.coerce
    .number()
    .min(0, { message: "Actual distance must be a positive number" }),
});

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Completion Modal state
  const [completingTrip, setCompletingTrip] = useState(null);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [completionError, setCompletionError] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  // Form hooks
  const {
    register: registerTrip,
    handleSubmit: handleSubmitTrip,
    watch: watchTrip,
    reset: resetTrip,
    formState: { errors: tripErrors },
  } = useForm({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      source: "",
      destination: "",
      vehicle: "",
      driver: "",
      cargoWeight: 0,
      plannedDistance: 0,
      revenue: 0,
    },
  });

  const {
    register: registerCompletion,
    handleSubmit: handleSubmitCompletion,
    reset: resetCompletion,
    setValue: setCompletionValue,
    formState: { errors: completionErrors },
  } = useForm({
    resolver: zodResolver(completionFormSchema),
    defaultValues: {
      finalOdometer: 0,
      fuelConsumedLiters: 0,
      fuelCost: 0,
      actualDistance: 0,
    },
  });

  // Watch selected vehicle to display load limit warnings dynamically
  const selectedVehicleId = watchTrip("vehicle");
  const enteredCargoWeight = watchTrip("cargoWeight") || 0;
  const selectedVehicle = vehicles.find((v) => v._id === selectedVehicleId);
  const isOverloaded = selectedVehicle && enteredCargoWeight > selectedVehicle.maxLoadCapacity;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        tripService.getTrips(),
        vehicleService.getVehicles(),
        driverService.getDrivers(),
      ]);

      if (tripsData.success) setTrips(tripsData.trips);
      if (vehiclesData.success) setVehicles(vehiclesData.vehicles);
      if (driversData.success) setDrivers(driversData.drivers);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter lists of vehicles/drivers to only show "Available" and "Valid License" options
  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  const eligibleDrivers = drivers.filter((d) => {
    const isAvailable = d.status === "Available";
    const hasValidLicense = d.licenseExpiryDate && new Date(d.licenseExpiryDate) >= new Date();
    return isAvailable && hasValidLicense;
  });

  const handleOpenCreate = () => {
    setCreateError("");
    resetTrip({
      source: "",
      destination: "",
      vehicle: availableVehicles[0]?._id || "",
      driver: eligibleDrivers[0]?._id || "",
      cargoWeight: 0,
      plannedDistance: 0,
      revenue: 0,
    });
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
  };

  const onCreateTrip = async (data) => {
    if (isOverloaded) {
      setCreateError("Cannot dispatch: cargo weight exceeds vehicle capacity.");
      return;
    }
    setIsSaving(true);
    setCreateError("");
    try {
      const result = await tripService.createTrip({ ...data, status: "Draft" });
      if (result.success) {
        fetchData();
        handleCloseCreate();
      } else {
        setCreateError(result.message);
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "Error creating trip draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDispatch = async (id) => {
    try {
      const result = await tripService.dispatchTrip(id);
      if (result.success) {
        fetchData();
      }
    } catch (err) {
      alert("Failed to dispatch trip: " + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenComplete = (trip) => {
    setCompletingTrip(trip);
    setCompletionError("");
    resetCompletion({
      finalOdometer: trip.vehicle ? trip.vehicle.odometer + trip.plannedDistance : 0,
      fuelConsumedLiters: Math.round(trip.plannedDistance * 0.3), // initial estimate
      fuelCost: Math.round(trip.plannedDistance * 0.3 * 1.2), // initial estimate
      actualDistance: trip.plannedDistance,
    });
    setIsCompleteOpen(true);
  };

  const handleCloseComplete = () => {
    setIsCompleteOpen(false);
    setCompletingTrip(null);
  };

  const onCompleteTrip = async (data) => {
    setIsCompleting(true);
    setCompletionError("");
    try {
      const result = await tripService.completeTrip(completingTrip._id, data);
      if (result.success) {
        fetchData();
        handleCloseComplete();
      } else {
        setCompletionError(result.message);
      }
    } catch (err) {
      setCompletionError(err.response?.data?.message || "Error completing trip.");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this trip? Vehicle and driver statuses will be reverted to Available.")) {
      try {
        const result = await tripService.cancelTrip(id);
        if (result.success) {
          fetchData();
        }
      } catch (err) {
        alert("Failed to cancel trip: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const tabs = ["All", "Draft", "Dispatched", "Completed", "Cancelled"];
  const filteredTrips = activeTab === "All" ? trips : trips.filter((t) => t.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Trip Management</h2>
          <p className="text-slate-500 text-sm mt-1">Create routing paths, dispatch fleets, and complete logs</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-xl transition duration-150 gap-2 text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Plan New Trip
        </button>
      </div>

      {/* Tab select row */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const count = tab === "All" ? trips.length : trips.filter((t) => t.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap gap-2 flex items-center ${
                isActive
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-550 hover:text-slate-900"
              }`}
            >
              {tab}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? "bg-indigo-50 text-indigo-750" : "bg-slate-100 text-slate-650"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Listing View */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm">Loading dispatch records...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-600 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>{error}</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Route className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-550">No trips listed in this filter</p>
            <p className="text-xs text-slate-450 mt-1">Plan a new routing path to populate this dashboard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
                  <th className="px-6 py-4">Route Path</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4 text-right">Cargo</th>
                  <th className="px-6 py-4 text-right">Distance</th>
                  <th className="px-6 py-4 text-right">Revenue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Transitions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTrips.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition">
                    {/* Route */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                            {t.source}
                          </span>
                          <span className="text-xs text-slate-500 pl-4 mt-0.5">to {t.destination}</span>
                        </div>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="px-6 py-4">
                      {t.vehicle ? (
                        <div className="flex flex-col">
                          <span className="font-mono font-semibold text-indigo-650">{t.vehicle.registrationNumber}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{t.vehicle.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-italic">Unassigned</span>
                      )}
                    </td>

                    {/* Driver */}
                    <td className="px-6 py-4">
                      {t.driver ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{t.driver.name}</span>
                          <span className="text-xs text-slate-500 mt-0.5">Score: {t.driver.safetyScore}/100</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-italic">Unassigned</span>
                      )}
                    </td>

                    {/* Cargo */}
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      {t.cargoWeight.toLocaleString()} kg
                    </td>

                    {/* Distance */}
                    <td className="px-6 py-4 text-right text-slate-700">
                      {t.actualDistance ? `${t.actualDistance.toLocaleString()} km` : `${t.plannedDistance.toLocaleString()} km`}
                      {t.actualDistance && t.actualDistance !== t.plannedDistance && (
                        <span className="block text-[10px] text-slate-400">Planned: {t.plannedDistance}km</span>
                      )}
                    </td>

                    {/* Revenue */}
                    <td className="px-6 py-4 text-right text-emerald-600 font-semibold">
                      ${t.revenue.toLocaleString()}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          t.status === "Draft"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : t.status === "Dispatched"
                            ? "bg-amber-50 text-amber-700 border-amber-255"
                            : t.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-255"
                            : "bg-rose-50 text-rose-700 border-rose-255"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    {/* Actions / transitions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {t.status === "Draft" && (
                          <>
                            <button
                              onClick={() => handleDispatch(t._id)}
                              className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-transparent rounded-lg font-semibold text-xs transition flex items-center gap-1"
                              title="Dispatch Fleet"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Dispatch
                            </button>
                            <button
                              onClick={() => handleCancel(t._id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition"
                              title="Cancel Trip"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {t.status === "Dispatched" && (
                          <>
                            <button
                              onClick={() => handleOpenComplete(t)}
                              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-transparent rounded-lg font-semibold text-xs transition flex items-center gap-1"
                              title="Log Completion"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Complete
                            </button>
                            <button
                              onClick={() => handleCancel(t._id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition"
                              title="Cancel Trip"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {t.status === "Completed" && (
                          <div className="text-xs text-slate-500 italic flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Done {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : ""}</span>
                          </div>
                        )}

                        {t.status === "Cancelled" && (
                          <span className="text-xs text-slate-500 font-medium">Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan Trip Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl overflow-hidden shadow-xl relative">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Plan New Dispatch</h3>
              <button
                onClick={handleCloseCreate}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTrip(onCreateTrip)} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Source & Destination */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Source Terminal
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Depot A"
                    {...registerTrip("source")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {tripErrors.source && <p className="text-xs text-rose-600 pl-1 mt-0.5">{tripErrors.source.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Destination Terminal
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Store 42"
                    {...registerTrip("destination")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {tripErrors.destination && <p className="text-xs text-rose-600 pl-1 mt-0.5">{tripErrors.destination.message}</p>}
                </div>
              </div>

              {/* Vehicle Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1 flex justify-between">
                  <span>Assign Vehicle</span>
                  {availableVehicles.length === 0 && (
                    <span className="text-[10px] text-rose-600 font-bold lowercase">No available vehicles!</span>
                  )}
                </label>
                <select
                  {...registerTrip("vehicle")}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="">-- Select Available Vehicle --</option>
                  {availableVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} - {v.name} ({v.type}, Cap: {v.maxLoadCapacity}kg)
                    </option>
                  ))}
                </select>
                {tripErrors.vehicle && <p className="text-xs text-rose-600 pl-1 mt-0.5">{tripErrors.vehicle.message}</p>}
              </div>

              {/* Driver Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1 flex justify-between">
                  <span>Assign Driver</span>
                  {eligibleDrivers.length === 0 && (
                    <span className="text-[10px] text-rose-600 font-bold lowercase">No eligible drivers!</span>
                  )}
                </label>
                <select
                  {...registerTrip("driver")}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="">-- Select Available Driver --</option>
                  {eligibleDrivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} (Safety Score: {d.safetyScore}/100, Exp: {new Date(d.licenseExpiryDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {tripErrors.driver && <p className="text-xs text-rose-600 pl-1 mt-0.5">{tripErrors.driver.message}</p>}
              </div>

              {/* Cargo weight check warnings */}
              {selectedVehicle && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-xs border transition ${
                  isOverloaded
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}>
                  {isOverloaded ? (
                    <>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      <span>
                        <span className="font-bold">Overload Warning:</span> Cargo exceeds {selectedVehicle.name}'s max load of <span className="font-bold">{selectedVehicle.maxLoadCapacity} kg</span>. Dispatch blocked.
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                      <span>
                        Load verified! Vehicle has remaining payload of <span className="font-bold">{selectedVehicle.maxLoadCapacity - enteredCargoWeight} kg</span>.
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Cargo Weight, Planned Distance, Revenue */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Cargo Weight (kg)
                  </label>
                  <input
                    type="number"
                    {...registerTrip("cargoWeight")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {tripErrors.cargoWeight && <p className="text-xs text-rose-600 pl-1 mt-0.5">{tripErrors.cargoWeight.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    {...registerTrip("plannedDistance")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {tripErrors.plannedDistance && <p className="text-xs text-rose-600 pl-1 mt-0.5">{tripErrors.plannedDistance.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Revenue ($)
                  </label>
                  <input
                    type="number"
                    {...registerTrip("revenue")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {tripErrors.revenue && <p className="text-xs text-rose-600 pl-1 mt-0.5">{tripErrors.revenue.message}</p>}
                </div>
              </div>

              {/* Form Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isOverloaded}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Dialog */}
      {isCompleteOpen && completingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-xl relative">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Log Trip Completion</h3>
              <button
                onClick={handleCloseComplete}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCompletion(onCompleteTrip)} className="p-6 space-y-4">
              {completionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{completionError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs text-slate-650">
                  <span>Assigned Vehicle:</span>
                  <span className="font-mono font-bold text-indigo-605">{completingTrip.vehicle?.registrationNumber}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-650">
                  <span>Current Vehicle Odometer:</span>
                  <span className="font-semibold text-slate-800">{completingTrip.vehicle?.odometer} km</span>
                </div>
              </div>

              {/* Odometer & Actual Distance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Final Odometer (km)
                  </label>
                  <input
                    type="number"
                    {...registerCompletion("finalOdometer")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {completionErrors.finalOdometer && (
                    <p className="text-xs text-rose-600 pl-1 mt-0.5">{completionErrors.finalOdometer.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-550 uppercase tracking-wider pl-1">
                    Actual Distance (km)
                  </label>
                  <input
                    type="number"
                    {...registerCompletion("actualDistance")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {completionErrors.actualDistance && (
                    <p className="text-xs text-rose-600 pl-1 mt-0.5">{completionErrors.actualDistance.message}</p>
                  )}
                </div>
              </div>

              {/* Fuel Liters & Fuel Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
                    Fuel Consumed (Liters)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerCompletion("fuelConsumedLiters")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {completionErrors.fuelConsumedLiters && (
                    <p className="text-xs text-rose-600 pl-1 mt-0.5">{completionErrors.fuelConsumedLiters.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-550 uppercase tracking-wider pl-1">
                    Fuel Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerCompletion("fuelCost")}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {completionErrors.fuelCost && (
                    <p className="text-xs text-rose-600 pl-1 mt-0.5">{completionErrors.fuelCost.message}</p>
                  )}
                </div>
              </div>

              {/* Form Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseComplete}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompleting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {isCompleting && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  Complete Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
