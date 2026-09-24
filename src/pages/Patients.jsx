import { useState } from "react";

import { Search, UserPlus, User, ChevronRight } from "lucide-react";

import Sidebar from "../components/Sidebar";

function Patients({
  user,
  currentPage,
  patients,
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

  const filteredPatients = patients.filter((patient) => {
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Patients</h1>

            <p className="mt-1 text-slate-500">
              Search and manage UDM clinic patient records.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddPatient}
            className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
          >
            <UserPlus size={20} />
            Add Patient
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by Student Number, Patient ID, or Name..."
              className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-800">
              Patient Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredPatients.length} Patient
              {filteredPatients.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <button
                  key={patient.patientId}
                  type="button"
                  onClick={() => onPatientSelect(patient)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <User size={24} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {patient.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Student Number: {patient.studentNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Patient ID: {patient.patientId}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {patient.course} • {patient.yearLevel}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Age: {patient.age}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Sex: {patient.sex}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Address: {patient.address}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={22} className="text-slate-400" />
                </button>
              ))
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search size={26} />
                </div>

                <h3 className="font-semibold text-slate-800">
                  {searchQuery ? "No patient found" : "Search for a patient"}
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  {searchQuery
                    ? "No patient record matches your search. Try another Student Number, Patient ID, or name."
                    : "Enter a Student Number, Patient ID, or patient name to find a record."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Patients;
