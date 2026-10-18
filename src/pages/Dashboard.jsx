import { useState } from "react";
import clinicLogo from "../assets/clinic.jpg";
import {
  Users,
  CalendarDays,
  Activity,
  Search,
  PlusCircle,
  UserRoundPlus,
  ChevronRight,
  Clock3,
  ShieldCheck,
  Stethoscope,
  ArrowUpRight,
  FileText,
  UserRound,
  ClipboardPlus,
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

  const userRole = String(currentUser.role || "")
    .trim()
    .toLowerCase();

  const isAdmin = ["admin", "administrator"].includes(userRole);

  const query = searchQuery.trim().toLowerCase();

  const patientList = Array.isArray(patients) ? patients : [];
  const history = Array.isArray(clinicHistory) ? clinicHistory : [];

  const filteredPatients = patientList.filter((patient) => {
    if (!query) return false;

    return (
      String(patient.studentNumber || "").toLowerCase().includes(query) ||
      String(patient.patientId || "").toLowerCase().includes(query) ||
      String(patient.name || "").toLowerCase().includes(query)
    );
  });

  const today = new Date().toLocaleDateString();

  const todaysVisits = history.filter((record) => {
    if (!record.date) return false;

    return record.date === today;
  });

  const totalAssessments = history.length;
  const recentActivity = history.slice().reverse().slice(0, 5);

  const formatCurrentDate = () =>
    new Date().toLocaleDateString(undefined, {
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
      description: "Registered patient records",
      icon: Users,
      iconStyle: "bg-green-50 text-green-800",
      accent: "bg-green-600",
    },
    {
      title: "Today's Visits",
      value: todaysVisits.length,
      description: "Visits recorded today",
      icon: CalendarDays,
      iconStyle: "bg-blue-50 text-blue-700",
      accent: "bg-blue-600",
    },
    {
      title: "Assessments",
      value: totalAssessments,
      description: "Recorded assessments",
      icon: Activity,
      iconStyle: "bg-amber-50 text-amber-700",
      accent: "bg-amber-500",
    },
  ];

  const maxStatValue = Math.max(
    1,
    ...stats.map((stat) => Number(stat.value) || 0),
  );

  return (
    <div className="flex min-h-screen bg-[#f6f8f7] font-sans text-gray-800">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-[76px] shrink-0 items-center justify-between gap-4 border-b border-gray-200/80 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={clinicLogo}
              alt="UDM Clinic Logo"
              className="h-11 w-11 shrink-0 rounded-xl border border-gray-100 object-cover"
            />

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-green-950 sm:text-lg">
                UDM Health Care Monitoring System
              </h1>

              <p className="mt-1 hidden text-xs text-gray-500 sm:block">
                University clinic management
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.name}
              </p>

              <p className="mt-0.5 text-xs capitalize text-gray-500">
                {currentUser.role || "Clinic Staff"}
              </p>
            </div>

            {currentUser.profileImage ? (
              <img
                src={currentUser.profileImage}
                alt={`${currentUser.name}'s profile`}
                className="h-10 w-10 rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-900 ring-1 ring-inset ring-green-200">
                {currentUser.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-8 p-4 sm:p-6 lg:p-10">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123b2c] via-[#18513b] to-[#24734c] p-6 text-white shadow-lg shadow-green-950/10 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-4 -top-10 h-52 w-52 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-20 right-40 h-48 w-48 rounded-full bg-white/[0.04]" />
            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                </div>

                <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  Good morning, {currentUser.name}!
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-green-50/80 sm:text-base">
                  Here's today's clinic overview and activity summary.
                </p>

                <p className="mt-5 flex items-center gap-2 text-xs font-medium text-green-100/80 sm:text-sm">
                  <CalendarDays size={16} />
                  {formatCurrentDate()}
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:p-5 md:min-w-[220px] md:flex-col md:items-center md:justify-center md:gap-3">
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt={currentUser.name}
                    className="h-16 w-16 rounded-full border-[3px] border-white/50 object-cover shadow-lg sm:h-20 sm:w-20"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/30 bg-white/15 text-2xl font-bold text-white shadow-lg sm:h-20 sm:w-20">
                    {currentUser.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                <div className="min-w-0 md:text-center">
                  <p className="truncate text-sm font-bold text-white">
                    {currentUser.name}
                  </p>

                  <p className="mt-1 text-xs text-green-100">
                    {currentUser.role || "Clinic Staff"}
                  </p>

                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-300/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-100">
                    <ShieldCheck size={12} />
                    Authorized personnel
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-950">
                Find a patient
              </h2>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search size={19} className="text-gray-400" />
              </div>

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Enter patient name, Student Number, or Patient ID..."
                aria-label="Search patient records"
                className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-4 focus:ring-green-100"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                >
                  Clear
                </button>
              )}
            </div>

            {query && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Search results
                  </p>

                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-900">
                    {filteredPatients.length}
                  </span>
                </div>

                {filteredPatients.length > 0 ? (
                  <div className="divide-y divide-gray-100">
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
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-green-50/60 sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-800">
                            <UserRound size={20} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {patient.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-500">
                              Student No.: {patient.studentNumber || "—"}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-500">
                              Patient ID: {patient.patientId || "—"}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          size={19}
                          className="shrink-0 text-gray-400"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-10 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                      <Search size={22} />
                    </div>

                    <p className="text-sm font-semibold text-gray-800">
                      No patient found
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Check the spelling or try a different Student Number
                      or Patient ID.
                    </p>
                  </div>
                )}

                {filteredPatients.length > 8 && (
                  <p className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-xs text-gray-500">
                    Showing the first 8 matches. Refine your search to find
                    a specific patient.
                  </p>
                )}
              </div>
            )}
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-950">
                Clinic overview
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1 ${stat.accent}`}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {stat.title}
                        </p>

                        <p className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
                          {stat.value}
                        </p>
                      </div>

                      <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
                        <Icon size={23} strokeWidth={1.8} />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />

                      <p className="text-xs text-gray-500">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-green-700">
                  Visual report
                </p>

                <h2 className="text-xl font-bold text-gray-950">
                  Clinic Metrics Chart
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="h-2.5 w-2.5 rounded-full bg-green-700" />
                Current totals
              </div>
            </div>

            <div
              role="img"
              aria-label="Horizontal bar chart comparing total registered patients, today's visits, and recorded assessments"
              className="space-y-7"
            >
              {stats.map((stat) => {
                const value = Math.max(0, Number(stat.value) || 0);
                const percentage = (value / maxStatValue) * 100;

                return (
                  <div key={stat.title}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`h-3 w-3 shrink-0 rounded-sm ${stat.accent}`}
                        />

                        <span className="truncate text-sm font-semibold text-gray-700">
                          {stat.title}
                        </span>
                      </div>

                      <span className="text-base font-bold tabular-nums text-gray-950">
                        {value}
                      </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${stat.accent}`}
                        style={{
                          width: `${percentage}%`,
                          minWidth: value > 0 ? "6px" : "0px",
                        }}
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-gray-400">
                      {value === 0
                        ? "No records counted"
                        : `${percentage.toFixed(0)}% of the highest displayed total`}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-950">
                Quick actions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Access the most frequently used clinic functions.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={() => onNavigate("patients")}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-800 transition group-hover:bg-green-100">
                  <PlusCircle size={24} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    New Visit
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Find a patient and begin a visit.
                  </p>
                </div>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-green-800"
                />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("add-patient")}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-100">
                  <UserRoundPlus size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    Add Patient
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Register a new patient record.
                  </p>
                </div>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-green-800"
                />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("assessment")}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition group-hover:bg-amber-100">
                  <ClipboardPlus size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    Assessments
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Record patient measurements and notes.
                  </p>
                </div>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-green-800"
                />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("records")}
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-100">
                  <FileText size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    Clinic Records
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Browse recorded clinic activity.
                  </p>
                </div>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-green-800"
                />
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onNavigate("admin-panel")}
                  className="group flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50/60 p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-green-50 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-900">
                    <ShieldCheck size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-green-950">
                      Admin Panel
                    </p>

                    <p className="mt-1 text-xs leading-5 text-green-800/70">
                      Manage staff accounts and access.
                    </p>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-green-800"
                  />
                </button>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  Recent clinic activity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Recently recorded patient visits and assessments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate("records")}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-900"
              >
                View records
                <ChevronRight size={16} />
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center sm:py-16">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                  <Clock3 size={25} strokeWidth={1.8} />
                </div>

                <h3 className="text-base font-bold text-gray-900">
                  No recent activity
                </h3>

                <button
                  type="button"
                  onClick={() => onNavigate("patients")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  <PlusCircle size={17} />
                  Start a visit
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentActivity.map((record, index) => (
                  <div
                    key={record.id ?? `${record.patientName}-${index}`}
                    className="flex flex-col gap-3 px-5 py-4 transition hover:bg-gray-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-800">
                        <Stethoscope size={21} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {record.patientName ||
                            record.name ||
                            "Patient visit"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Health assessment
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold text-gray-700">
                          {record.date || "Date unavailable"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {record.time || "Time unavailable"}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                        Recorded
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </section>

          <footer className="border-t border-gray-200 py-5 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} UDM Health Care Monitoring System
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
              University clinic personnel workspace
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;