import React, { useState, useEffect } from "react";
import reportService from "../../services/report.service";
import {
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  TrendingUp,
  Fuel,
  Wrench,
  DollarSign,
  BarChart3,
  Scale,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await reportService.getAnalytics();
      if (response.success) {
        setData(response);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate analytics report dataset.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handler to export details grid to CSV file
  const handleExportCSV = () => {
    if (!data || !data.reports || data.reports.length === 0) return;

    const headers = [
      "Registration Number",
      "Model Name",
      "Type",
      "Total Distance (km)",
      "Fuel Consumed (L)",
      "Fuel Efficiency (km/L)",
      "Maintenance Cost ($)",
      "Fuel Cost ($)",
      "Other Expenses ($)",
      "Total Operational Cost ($)",
      "Trip Revenue ($)",
      "Vehicle ROI (%)",
    ];

    const rows = data.reports.map((r) => [
      r.vehicle.registrationNumber,
      r.vehicle.name,
      r.vehicle.type,
      r.totalDistance,
      r.totalFuelLiters,
      r.fuelEfficiency.toFixed(2),
      r.totalMaintenanceCost,
      r.totalFuelCost,
      r.totalOtherCost,
      r.totalOperationalCost,
      r.totalRevenue,
      r.roi.toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_fleet_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pie chart cost data
  const pieData = data && data.summary
    ? [
        { name: "Fuel Cost", value: data.summary.totals.totalFuelCost, color: "#f59e0b" },
        { name: "Maintenance", value: data.summary.totals.totalMaintenanceCost, color: "#f97316" },
        { name: "Other Expenses", value: data.summary.totals.totalOtherCost, color: "#6366f1" },
      ]
    : [];

  // Bar charts data mappings
  const roiData = data
    ? data.reports.map((r) => ({
        name: r.vehicle.registrationNumber,
        ROI: parseFloat(r.roi.toFixed(1)),
      }))
    : [];

  const efficiencyData = data
    ? data.reports.map((r) => ({
        name: r.vehicle.registrationNumber,
        Efficiency: parseFloat(r.fuelEfficiency.toFixed(2)),
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header and Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Reports & Fleet Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">Audit vehicle ROIs, distance logs, and overall operational efficiency</p>
        </div>
        {data && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition duration-150 gap-2 text-sm shadow-[0_4px_15px_rgba(6,182,212,0.15)]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export to CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm">Calculating ROIs and aggregating costs...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center text-rose-400 flex flex-col items-center justify-center gap-2">
          <AlertCircle className="w-8 h-8" />
          <p>{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Fleet Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-450" />
              </div>
              <p className="text-2xl font-bold text-white">${data.summary.totals.totalRevenue.toLocaleString()}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Operational Cost</span>
                <DollarSign className="w-4 h-4 text-rose-450" />
              </div>
              <p className="text-2xl font-bold text-rose-450">${data.summary.totals.totalOperationalCost.toLocaleString()}</p>
              <div className="text-[10px] text-slate-500 mt-1">Fuel + Maintenance + Fees</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Fuel Efficiency</span>
                <Fuel className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white">{data.summary.averages.avgFuelEfficiency.toFixed(2)} km/L</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Vehicle ROI</span>
                <Scale className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">{data.summary.averages.avgROI.toFixed(1)}%</p>
            </div>
          </div>

          {/* Recharts Visualizations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ROI Comparison Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Vehicle ROI Analysis (%)</h3>
              </div>
              <div className="h-64 w-full">
                {roiData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 italic">No ROI data registered</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          color: "#f8fafc",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="ROI" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Expenses breakdown Pie Chart */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-6">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Operating Cost Share</h3>
              </div>
              <div className="h-64 w-full flex flex-col justify-between">
                {totalExpenses === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 italic">No cost shares logged</div>
                ) : (
                  <>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderColor: "#334155",
                              borderRadius: "12px",
                              color: "#f8fafc",
                              fontSize: "12px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* legend */}
                    <div className="grid grid-cols-3 text-[10px] text-slate-400 text-center gap-1.5 mt-3 pt-3 border-t border-slate-800">
                      {pieData.map((e) => (
                        <div key={e.name} className="flex flex-col items-center">
                          <span className="w-2.5 h-2.5 rounded-full mb-1" style={{ backgroundColor: e.color }} />
                          <span className="truncate w-full font-medium">{e.name}</span>
                          <span className="font-bold text-white">${e.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fuel Efficiency Line Chart */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl lg:col-span-3">
              <div className="flex items-center gap-2 mb-6">
                <Fuel className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-white">Fuel Efficiency Metrics (km / L)</h3>
              </div>
              <div className="h-64 w-full">
                {efficiencyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 italic">No fuel logs registered</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={efficiencyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          color: "#f8fafc",
                          fontSize: "12px",
                        }}
                      />
                      <Line type="monotone" dataKey="Efficiency" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Fleet Performance Details</h3>
            </div>
            {data.reports.length === 0 ? (
              <div className="py-12 text-center text-slate-600 italic">No fleet entries in report</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                      <th className="px-6 py-4">Vehicle</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Distance</th>
                      <th className="px-6 py-4 text-right">Fuel Consumed</th>
                      <th className="px-6 py-4 text-right">Fuel Efficiency</th>
                      <th className="px-6 py-4 text-right">Operating Cost</th>
                      <th className="px-6 py-4 text-right">Revenue</th>
                      <th className="px-6 py-4 text-right">Acquisition</th>
                      <th className="px-6 py-4 text-right">Vehicle ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.reports.map((r) => (
                      <tr key={r.vehicle.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-cyan-400">{r.vehicle.registrationNumber}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">{r.vehicle.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-350">{r.vehicle.type}</td>
                        <td className="px-6 py-4 text-right text-slate-300 font-medium">{r.totalDistance.toLocaleString()} km</td>
                        <td className="px-6 py-4 text-right text-slate-300">{r.totalFuelLiters.toFixed(1)} L</td>
                        <td className="px-6 py-4 text-right text-slate-200 font-semibold">{r.fuelEfficiency.toFixed(2)} km/L</td>
                        <td className="px-6 py-4 text-right text-rose-400 font-medium">${r.totalOperationalCost.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-emerald-400 font-medium">${r.totalRevenue.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-slate-400">${r.vehicle.acquisitionCost.toLocaleString()}</td>
                        <td className={`px-6 py-4 text-right font-bold ${r.roi >= 0 ? "text-emerald-450" : "text-rose-400"}`}>
                          {r.roi.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Reports;
