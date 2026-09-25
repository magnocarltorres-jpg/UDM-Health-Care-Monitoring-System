import { useState } from "react";

import clinicLogo from "../assets/clinic.jpg";

import {
  Users,
  Calendar,
  Activity,
  Search,
  PlusCircle,
  User,
  ChevronRight,
  Clock,
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

  const filteredPatients = (patients || []).filter((patient) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return false;
    }

    return (
      patient.studentNumber.toLowerCase().includes(query) ||
      patient.patientId.toLowerCase().includes(query) ||
      patient.name.toLowerCase().includes(query)
    );
  });

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
    profileImage: null,
  };

  const history = clinicHistory || [];

  const today = new Date().toLocaleDateString();

  const todaysVisits = history.filter((record) => record.date === today);

  const totalAssessments = history.length;

  const recentActivity = history.slice().reverse().slice(0, 5);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center border-b border-slate-200 bg-white px-8 py-4">
          <img
            src={clinicLogo}
            alt="UDM Clinic Logo"
            className="mr-3 h-10 w-10 rounded-full object-cover"
          />

          <h2 className="text-lg font-bold text-green-900">
            UDM Health Care Monitoring System
          </h2>
        </header>

        <main className="flex-1 space-y-8 overflow-y-auto p-8">
          <section className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-green-900 p-6 text-white shadow-lg md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                Good morning, {currentUser.name}!
              </h1>

              <p className="mt-1 text-sm text-green-100 md:text-base">
                Here's today's clinic overview and activity summary.
              </p>
            </div>

            <div className="flex items-center">
              {currentUser.profileImage ? (
                <img
                  src={currentUser.profileImage}
                  alt={currentUser.name}
                  className="h-20 w-20 rounded-full border-4 border-white/30 object-cover shadow-md"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-green-700 text-2xl font-bold shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-slate-400" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search patient by ID, Student Number, or Name..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {searchQuery.trim() && (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient.patientId}
                      type="button"
                      onClick={() => {
                        onPatientSelect(patient);
                        setSearchQuery("");
                      }}
                      className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left last:border-b-0 hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {patient.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {patient.studentNumber} • {patient.patientId}
                        </p>
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-6 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No patient found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try searching by name, Student Number, or Patient ID.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Total Patients
                </p>

                <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {patients?.length || 0}
              </p>

              <p className="mt-2 text-xs text-slate-400">Registered patients</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Today's Visits
                </p>

                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {todaysVisits.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">Clinic visits today</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Assessments
                </p>

                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                  <Activity className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {totalAssessments}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Recorded assessments
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Quick Actions
            </h3>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate("patients")}
                className="flex items-center gap-2 rounded-xl bg-green-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-green-800 active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />

                <span>New Visit</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("add-patient")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
              >
                <User className="h-4 w-4 text-slate-500" />

                <span>Add Patient</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("assessment")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
              >
                <Activity className="h-4 w-4 text-slate-500" />

                <span>Assessments</span>
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Clinic Activity
                </h3>

                <p className="mt-0.5 text-xs text-slate-400">
                  Recently recorded patient visits
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate("records")}
                className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                <span>View all</span>

                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Clock className="h-6 w-6 text-slate-400" />
                </div>

                <h3 className="text-base font-semibold text-slate-700">
                  No recent activity
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-400">
                  Recent patient visits and clinic activities will appear here
                  once records are added.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivity.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between gap-4 px-6 py-5"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {record.patientName}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Health Assessment
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">
                        {record.date}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {record.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-8 py-3 text-center text-xs text-slate-400">
          © 2026 UDM Health Care Monitoring System
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
