import { useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ClipboardPlus,
  FileText,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

function Dashboard({
  user,
  currentPage,
  onNavigate,
  onLogout,
  clinicHistory,
  patients,
  onPatientSelect,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
    profileImage: null,
  };

  const userRole = String(currentUser.role || "").trim().toLowerCase();
  const isAdmin = ["admin", "administrator"].includes(userRole);

  const patientList = Array.isArray(patients) ? patients : [];
  const history = Array.isArray(clinicHistory) ? clinicHistory : [];

  const query = searchQuery.trim().toLowerCase();

  const filteredPatients = patientList.filter((patient) => {
    if (!query) return false;

    return [
      patient.studentNumber,
      patient.patientId,
      patient.name,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  const today = new Date().toLocaleDateString();
  const todaysVisits = history.filter((record) => record.date === today);
  const recentActivity = [...history].reverse().slice(0, 5);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handlePatientClick = (patient) => {
    if (!patient || !onPatientSelect) return;

    onPatientSelect(patient);
    setSearchQuery("");
  };

  const stats = [
    {
      title: "Total Patients",
      value: patientList.length,
      detail: "Registered clinic patients",
      icon: Users,
      iconStyle: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Today's Visits",
      value: todaysVisits.length,
      detail: "Visits recorded today",
      icon: CalendarDays,
      iconStyle: "bg-blue-100 text-blue-800",
    },
    {
      title: "Assessments",
      value: history.length,
      detail: "Recorded clinic visits",
      icon: Activity,
      iconStyle: "bg-violet-100 text-violet-800",
    },
  ];

  const quickLinks = [
    {
      title: "Start a visit",
      description: "Find a patient and record a visit.",
      icon: Stethoscope,
      page: "patients",
    },
    {
      title: "Register patient",
      description: "Add a new patient to the clinic.",
      icon: UserRoundPlus,
      page: "add-patient",
    },
    {
      title: "Assessments",
      description: "Review measurements and clinical notes.",
      icon: ClipboardPlus,
      page: "assessment",
    },
    {
      title: "Clinic records",
      description: "View previous visits and assessments.",
      icon: FileText,
      page: "records",
    },
    {
      title: "Medicine inventory",
      description: "Review available medicines and stock.",
      icon: Package,
      page: "medicine-inventory",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f8f6] text-slate-900">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-9">
          {/* Welcome header */}
          <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span className="text-xs font-semibold tracking-wide text-emerald-900">
                  UDM CLINIC
                </span>
              </div>

              <p className="text-sm font-medium text-slate-500">
                {formattedDate}
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {greeting},{" "}
                {currentUser.name?.trim().split(/\s+/)[0] || "there"}!
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Here's your clinic overview and activity summary.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("add-patient")}
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-green-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 sm:self-center"
            >
              <Plus size={18} />
              Add patient
            </button>
          </header>

          {/* Statistics */}
          <section
            aria-label="Clinic overview"
            className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>

                      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                        {stat.value}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {stat.detail}
                      </p>
                    </div>

                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.iconStyle}`}
                    >
                      <Icon size={22} strokeWidth={1.8} />
                    </span>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Patient search */}
          <section className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <Search size={21} />
              </span>

              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Find a patient
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Search by patient name, student number, or patient ID.
                </p>
              </div>
            </div>

            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Enter a name, student number, or patient ID..."
                aria-label="Search patient records"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear patient search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {query && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Search results
                  </p>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900">
                    {filteredPatients.length}
                  </span>
                </div>

                {filteredPatients.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {filteredPatients.slice(0, 8).map((patient, index) => (
                      <button
                        key={
                          patient.id ??
                          patient.patientId ??
                          patient.studentNumber ??
                          index
                        }
                        type="button"
                        onClick={() => handlePatientClick(patient)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-emerald-50/70 focus:bg-emerald-50 focus:outline-none"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900">
                            <UserRound size={19} />
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {patient.name || "Unnamed patient"}
                            </span>

                            <span className="mt-1 block truncate text-xs text-slate-500">
                              Student No.: {patient.studentNumber || "—"}
                              {" · "}
                              Patient ID: {patient.patientId || "—"}
                            </span>
                          </span>
                        </span>

                        <ChevronRight
                          size={18}
                          className="shrink-0 text-slate-400"
                        />
                      </button>
                    ))}

                    {filteredPatients.length > 8 && (
                      <p className="bg-slate-50 px-4 py-3 text-xs text-slate-500">
                        Showing 8 results. Refine your search to find another
                        patient.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Search
                      size={24}
                      className="mx-auto mb-2 text-slate-300"
                    />

                    <p className="text-sm font-semibold text-slate-700">
                      No matching patient found
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Check the search details and try again.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Recent activity and quick access */}
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    Recent clinic activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest recorded patient visits and assessments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate("records")}
                  className="inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-green-900 transition hover:bg-green-50"
                >
                  View records
                  <ArrowRight size={16} />
                </button>
              </div>

              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <CalendarDays size={23} />
                  </span>

                  <h3 className="text-sm font-bold text-slate-900">
                    No visits recorded yet
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    When clinic visits are recorded, the latest activity will
                    appear here.
                  </p>

                  <button
                    type="button"
                    onClick={() => onNavigate("patients")}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                  >
                    Find a patient
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentActivity.map((record, index) => (
                    <article
                      key={record.id ?? `${record.patientName}-${index}`}
                      className="flex items-center gap-3 p-4 transition hover:bg-slate-50/80 sm:px-6"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                        <Stethoscope size={19} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {record.patientName || record.name || "Patient visit"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {record.reason || "Health assessment"}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium text-slate-700">
                          {record.date || "Date unavailable"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {record.time || ""}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-950">
                  Quick access
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Shortcuts to common clinic tasks.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                {quickLinks.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.page}
                      type="button"
                      onClick={() => onNavigate(item.page)}
                      className={`group flex w-full items-center gap-3 p-4 text-left transition hover:bg-emerald-50/70 focus:bg-emerald-50 focus:outline-none ${
                        index ? "border-t border-slate-100" : ""
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-emerald-100 group-hover:text-emerald-900">
                        <Icon size={19} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900">
                          {item.title}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {item.description}
                        </span>
                      </span>

                      <ChevronRight
                        size={17}
                        className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-800"
                      />
                    </button>
                  );
                })}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onNavigate("admin-panel")}
                    className="group flex w-full items-center gap-3 border-t border-slate-100 p-4 text-left transition hover:bg-emerald-50/70 focus:bg-emerald-50 focus:outline-none"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900">
                      <ShieldCheck size={19} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900">
                        Admin panel
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        Manage staff accounts and access.
                      </span>
                    </span>

                    <ChevronRight
                      size={17}
                      className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-800"
                    />
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="mt-10 border-t border-slate-200 py-5 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} UDM Health Care Monitoring System
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
