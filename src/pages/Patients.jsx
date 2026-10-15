import { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  User,
  ChevronRight,
  Users,
  GraduationCap,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

function Patients({
  user,
  currentPage,
  patients = [],
  onNavigate,
  onPatientSelect,
  onAddPatient,
  onLogout,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const safePatients = Array.isArray(patients) ? patients : [];

  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return safePatients;
    }

    return safePatients.filter((patient) => {
      const studentNumber = String(patient.studentNumber || "").toLowerCase();
      const patientId = String(patient.patientId || "").toLowerCase();
      const name = String(patient.name || "").toLowerCase();

      return (
        studentNumber.includes(query) ||
        patientId.includes(query) ||
        name.includes(query)
      );
    });
  }, [safePatients, searchQuery]);

  const clearSearch = () => setSearchQuery("");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold text-green-800">
                UDM Health Care Monitoring System
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Patients
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Search and manage UDM clinic patient records.
              </p>
            </div>

            <button
              type="button"
              onClick={onAddPatient}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 sm:w-auto"
            >
              <UserPlus size={19} />
              Add Patient
            </button>
          </header>

          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-900">
                <Users size={24} />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Patients
                </p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">
                  {safePatients.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-900">
                <Search size={23} />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Matching Records
                </p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">
                  {filteredPatients.length}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <label
              htmlFor="patient-search"
              className="mb-3 block text-sm font-bold text-gray-800"
            >
              Find a Patient
            </label>

            <div className="relative">
              <Search
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="patient-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by Student Number, Patient ID, or Name..."
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-12 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-100 sm:text-base"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear patient search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-gray-500 sm:text-sm">
              Search using the patient's name, student number, or patient ID.
            </p>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Patient Records
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Select a patient to view their record.
                </p>
              </div>

              <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-900">
                {filteredPatients.length}{" "}
                {filteredPatients.length === 1 ? "Patient" : "Patients"}
              </span>
            </div>

            {filteredPatients.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredPatients.map((patient, index) => (
                  <button
                    key={patient.patientId || patient.studentNumber || index}
                    type="button"
                    onClick={() => onPatientSelect(patient)}
                    className="group flex w-full min-w-0 items-start gap-3 px-4 py-5 text-left transition hover:bg-green-50 focus:bg-green-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-700 sm:items-center sm:gap-4 sm:px-6"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-900 transition group-hover:bg-green-900 group-hover:text-white sm:h-12 sm:w-12">
                      <User size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words font-bold text-gray-900">
                        {patient.name || "Unnamed Patient"}
                      </p>

                      <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs text-gray-500 sm:grid-cols-2 sm:text-sm">
                        <p className="break-words">
                          <span className="font-semibold text-gray-700">
                            Student Number:
                          </span>{" "}
                          {patient.studentNumber || "Not provided"}
                        </p>

                        <p className="break-words">
                          <span className="font-semibold text-gray-700">
                            Patient ID:
                          </span>{" "}
                          {patient.patientId || "Not provided"}
                        </p>

                        <p className="flex items-center gap-1.5 break-words">
                          <GraduationCap
                            size={15}
                            className="shrink-0 text-green-800"
                          />
                          {[
                            patient.course,
                            patient.yearLevel,
                          ]
                            .filter(Boolean)
                            .join(" • ") || "Academic details unavailable"}
                        </p>

                        <p>
                          <span className="font-semibold text-gray-700">
                            Age:
                          </span>{" "}
                          {patient.age ?? "Not provided"}
                        </p>

                        <p>
                          <span className="font-semibold text-gray-700">
                            Sex:
                          </span>{" "}
                          {patient.sex || "Not provided"}
                        </p>

                        <p className="break-words sm:col-span-2">
                          <span className="font-semibold text-gray-700">
                            Address:
                          </span>{" "}
                          {patient.address || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={21}
                      className="mt-2 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-800 sm:mt-0"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-800">
                  {searchQuery ? (
                    <Search size={28} />
                  ) : (
                    <Users size={28} />
                  )}
                </div>

                <h3 className="font-bold text-gray-900">
                  {searchQuery
                    ? "No patient found"
                    : "No patient records yet"}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  {searchQuery
                    ? "No patient record matches your search. Try another student number, patient ID, or name."
                    : "Patient records will appear here when they are available."}
                </p>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-50"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Patients;