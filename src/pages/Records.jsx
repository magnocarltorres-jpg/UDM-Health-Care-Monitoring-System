import Sidebar from "../components/Sidebar";

import { Search, FileText, Eye } from "lucide-react";

import { useState } from "react";

function Records({
  user,
  currentPage,
  clinicHistory,
  onNavigate,
  onViewRecord,
  onLogout,
}) {
  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const [searchQuery, setSearchQuery] = useState("");

  const history = clinicHistory || [];

  const filteredRecords = history.filter((record) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      record.patientName?.toLowerCase().includes(query) ||
      record.studentNumber?.toLowerCase().includes(query) ||
      record.patientId?.toLowerCase().includes(query) ||
      record.reason?.toLowerCase().includes(query)
    );
  });

  const sortedRecords = filteredRecords.slice().reverse();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Clinic Records</h1>

          <p className="mt-1 text-slate-500">
            View all patient visits and health assessments.
          </p>
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
              placeholder="Search by patient name, Student Number, Patient ID, or reason..."
              className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                <FileText size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  All Clinic Records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredRecords.length} Record
                  {filteredRecords.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileText size={26} />
              </div>

              <h3 className="font-semibold text-slate-800">
                {searchQuery.trim()
                  ? "No matching records"
                  : "No clinic records yet"}
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {searchQuery.trim()
                  ? "Try searching using the patient's name, Student Number, Patient ID, or reason for visit."
                  : "Saved patient assessments will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Patient
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Student Number
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Visit
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Blood Pressure
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      BMI
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sortedRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="font-medium text-slate-800">
                          {record.patientName}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {record.patientId}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {record.studentNumber}
                      </td>

                      <td className="px-6 py-5">
                        <div className="text-sm text-slate-700">
                          {record.date}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {record.time}
                        </div>

                        <div className="mt-2 max-w-40 truncate text-xs font-medium text-slate-500">
                          {record.reason || "No reason provided"}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {record.bloodPressure || "--"}
                      </td>

                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-slate-700">
                          {record.bmi !== null && record.bmi !== undefined
                            ? Number(record.bmi).toFixed(2)
                            : "--"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {record.bmiStatus || "--"}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => onViewRecord(record)}
                          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Records;
