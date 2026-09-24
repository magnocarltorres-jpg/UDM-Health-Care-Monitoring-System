import Sidebar from "../components/Sidebar";

import { ArrowLeft, Edit, Plus, Trash2, User } from "lucide-react";

import { useState } from "react";

function PatientProfile({
  user,
  currentPage,
  patient,
  clinicHistory,
  onNavigate,
  onDeletePatient,
  onLogout,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const patientHistory = (clinicHistory || []).filter(
    (record) => record.patientId === patient?.patientId,
  );

  if (!patient) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          user={currentUser}
          currentPage={currentPage}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />

        <main className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800">
              No Patient Selected
            </h1>

            <p className="mt-2 text-slate-500">
              Please search for a patient first.
            </p>

            <button
              type="button"
              onClick={() => onNavigate("patients")}
              className="mt-5 rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
            >
              Back to Patients
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => onNavigate("patients")}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-700"
          >
            <ArrowLeft size={18} />
            Back to Patients
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Patient Profile
              </h1>

              <p className="mt-1 text-slate-500">
                View and manage patient information and clinic history.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate("edit-patient")}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                <Edit size={18} />
                Edit Patient
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 rounded-lg border border-red-700 px-4 py-3 font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} />
                Delete Patient
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
              <User size={42} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {patient.name}
              </h2>

              <p className="mt-1 text-slate-500">
                Student Number: {patient.studentNumber}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {patient.course} • {patient.yearLevel}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Patient Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Basic information about the patient.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Student Number</p>

              <p className="mt-1 font-medium text-slate-800">
                {patient.studentNumber}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Patient ID</p>

              <p className="mt-1 font-medium text-slate-800">
                {patient.patientId}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Full Name</p>

              <p className="mt-1 font-medium text-slate-800">{patient.name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Course</p>

              <p className="mt-1 font-medium text-slate-800">
                {patient.course}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Year Level</p>

              <p className="mt-1 font-medium text-slate-800">
                {patient.yearLevel}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Age</p>

              <p className="mt-1 font-medium text-slate-800">
                {patient.age || "--"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Sex</p>

              <p className="mt-1 font-medium text-slate-800">
                {patient.sex || "--"}
              </p>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-slate-500">Address</p>

              <p className="mt-1 font-medium text-slate-800">
                {patient.address || "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Clinic History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Previous visits and health assessments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("assessment")}
              className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 font-medium text-white hover:bg-green-800"
            >
              <Plus size={18} />
              New Visit
            </button>
          </div>

          {patientHistory.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <User size={26} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No clinic history yet
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                This patient has no recorded clinic visits or assessments yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {patientHistory
                .slice()
                .reverse()
                .map((record) => (
                  <div key={record.id} className="p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          Health Assessment
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {record.date} • {record.time}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-sm text-slate-500">Blood Pressure</p>

                        <p className="mt-1 font-medium text-slate-800">
                          {record.bloodPressure || "--"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Temperature</p>

                        <p className="mt-1 font-medium text-slate-800">
                          {record.temperature || "--"} °C
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Heart Rate</p>

                        <p className="mt-1 font-medium text-slate-800">
                          {record.heartRate || "--"} bpm
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">SpO2</p>

                        <p className="mt-1 font-medium text-slate-800">
                          {record.spo2 || "--"} %
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Height</p>

                        <p className="mt-1 font-medium text-slate-800">
                          {record.height || "--"} cm
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Weight</p>

                        <p className="mt-1 font-medium text-slate-800">
                          {record.weight || "--"} kg
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">BMI</p>

                        <p className="mt-1 font-medium text-slate-800">
                          {record.bmi !== null && record.bmi !== undefined
                            ? Number(record.bmi).toFixed(2)
                            : "--"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">BMI Status</p>

                        <p className="mt-1 font-medium text-slate-800">
                          {record.bmiStatus || "--"}
                        </p>
                      </div>
                    </div>

                    {record.reason && (
                      <div className="mt-6 border-t border-slate-200 pt-5">
                        <p className="text-sm text-slate-500">
                          Reason for Visit
                        </p>

                        <p className="mt-2 font-medium text-slate-800">
                          {record.reason}
                        </p>
                      </div>
                    )}

                    {record.notes && (
                      <div className="mt-5">
                        <p className="text-sm text-slate-500">
                          Additional Notes
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {record.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800">
                Delete Patient
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Are you sure you want to delete this patient? This action cannot
                be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onDeletePatient}
                  className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700"
                >
                  Delete Patient
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PatientProfile;
