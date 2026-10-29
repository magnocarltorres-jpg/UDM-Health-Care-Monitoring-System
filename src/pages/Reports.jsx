import { apiFetch } from "../utils/api";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ClipboardList,
  Package,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { formatClinicDate, getClinicDateKey } from "../utils/dateTime";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://udm-health-care-api.onrender.com"
).replace(/\/+$/, "");

function getDefaultRange() {
  const to = getClinicDateKey();
  const fromDate = new Date(`${to}T00:00:00+08:00`);
  fromDate.setDate(fromDate.getDate() - 29);

  return {
    from: getClinicDateKey(fromDate),
    to,
  };
}

function Reports({ user, currentPage, onNavigate, onLogout }) {
  const [range, setRange] = useState(getDefaultRange);
  const [report, setReport] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("udm_authenticated");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    const headers = {};
    const query = new URLSearchParams(range);

    try {
      const [reportResponse, auditResponse] = await Promise.all([
        apiFetch(`${API_URL}/api/reports?${query}`, { headers }),
        apiFetch(`${API_URL}/api/audit-logs?${query}`, { headers }),
      ]);
      const [reportResult, auditResult] = await Promise.all([
        reportResponse.json().catch(() => ({})),
        auditResponse.json().catch(() => ({})),
      ]);

      if (!reportResponse.ok || !auditResponse.ok) {
        throw new Error(
          reportResult.message ||
            auditResult.message ||
            "Unable to load clinic reports.",
        );
      }

      setReport(reportResult);
      setEvents(Array.isArray(auditResult.events) ? auditResult.events : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load clinic reports.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active) loadData();
    });

    return () => {
      active = false;
    };
  }, [loadData]);

  const updateRange = (event) => {
    const { name, value } = event.target;
    setRange((current) => ({ ...current, [name]: value }));
  };

  const summary = report
    ? [
        {
          title: "Clinic visits",
          value: report.visits ?? 0,
          icon: Activity,
          color: "text-blue-700 bg-blue-50",
        },
        {
          title: "New patients",
          value: report.newPatients ?? 0,
          icon: ClipboardList,
          color: "text-green-800 bg-green-50",
        },
        {
          title: "Units dispensed",
          value: report.dispensedUnits ?? 0,
          icon: Package,
          color: "text-violet-700 bg-violet-50",
        },
        {
          title: "Inventory alerts",
          value: report.inventoryAlerts?.length ?? 0,
          icon: ShieldAlert,
          color: "text-amber-700 bg-amber-50",
        },
      ]
    : [];

  const visitsByDay = Array.isArray(report?.visitsByDay)
    ? report.visitsByDay
    : [];
  const maxVisits = Math.max(1, ...visitsByDay.map((day) => day.count || 0));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-green-800">
                Clinic operations
              </p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Reports & Activity
              </h1>
              <p className="mt-1 text-slate-500">
                Aggregate clinic activity, inventory alerts, and recent audit events.
              </p>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                loadData();
              }}
              className="flex flex-wrap items-end gap-3"
            >
              <label className="text-xs font-semibold text-slate-600">
                From
                <input
                  type="date"
                  name="from"
                  value={range.from}
                  onChange={updateRange}
                  required
                  className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                To
                <input
                  type="date"
                  name="to"
                  value={range.to}
                  onChange={updateRange}
                  required
                  className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-green-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </form>
          </header>

          {error && (
            <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
              {error}
            </p>
          )}

          {loading && !report ? (
            <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading clinic reports...
            </p>
          ) : (
            <>
              <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summary.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`rounded-xl p-3 ${item.color}`}>
                          <Icon size={20} />
                        </span>
                        <span className="text-3xl font-bold text-slate-900">
                          {item.value}
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-600">
                        {item.title}
                      </p>
                    </article>
                  );
                })}
              </section>

              <div className="mb-6 grid gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-bold text-slate-900">Visits by day</h2>
                  {visitsByDay.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">No visits in this period.</p>
                  ) : (
                    <div className="mt-5 max-h-80 space-y-3 overflow-y-auto pr-2">
                      {visitsByDay.map((day) => (
                        <div
                          key={day.date}
                          className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-xs"
                        >
                          <span className="text-slate-500">
                            {formatClinicDate(day.date)}
                          </span>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-green-700"
                              style={{
                                width: `${Math.max(3, (day.count / maxVisits) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-right font-semibold text-slate-700">
                            {day.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-bold text-slate-900">Most dispensed</h2>
                  {report?.topMedicines?.length ? (
                    <div className="mt-4 divide-y divide-slate-100">
                      {report.topMedicines.map((medicine) => (
                        <div
                          key={medicine.name}
                          className="flex items-center justify-between gap-4 py-3"
                        >
                          <span className="text-sm text-slate-700">{medicine.name}</span>
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-900">
                            {medicine.units} units
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      No dispensing activity in this period.
                    </p>
                  )}
                </section>
              </div>

              <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-bold text-slate-900">Inventory alerts</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Low stock is defined as 10 units or fewer.
                  </p>
                </div>
                {!report?.inventoryAlerts?.length ? (
                  <p className="p-5 text-sm text-slate-500">No current inventory alerts.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {report.inventoryAlerts.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Batch {item.batchNumber} · Stock {item.stockQuantity} · Expires{" "}
                            {formatClinicDate(item.expirationDate)}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-800">
                          {String(item.status).replaceAll("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="font-bold text-slate-900">Audit activity</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Records actions and changed field names, never patient values.
                  </p>
                </div>
                {!events.length ? (
                  <p className="p-5 text-sm text-slate-500">No activity recorded in this period.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-5 py-3">When</th>
                          <th className="px-5 py-3">Staff</th>
                          <th className="px-5 py-3">Action</th>
                          <th className="px-5 py-3">Record</th>
                          <th className="px-5 py-3">Fields</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {events.map((event) => (
                          <tr key={event.id}>
                            <td className="px-5 py-3 text-slate-600">
                              {formatClinicDate(event.created_at, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-5 py-3 text-slate-700">
                              {event.staff_accounts?.name || "Former staff"}
                            </td>
                            <td className="px-5 py-3 font-medium text-slate-800">
                              {event.action.replaceAll(".", " ")}
                            </td>
                            <td className="px-5 py-3 text-slate-600">
                              {event.entity_type} #{event.entity_id || "—"}
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-500">
                              {event.changed_fields?.join(", ") || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Reports;
