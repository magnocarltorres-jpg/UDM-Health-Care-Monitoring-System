import Sidebar from "../components/Sidebar";
import {
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  User,
  CalendarDays,
  HeartPulse,
  Thermometer,
  Activity,
  Ruler,
  Weight,
  ClipboardList,
  X,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://udm-health-care-api.onrender.com"
).replace(/\/+$/, "");

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
  const [drugTests, setDrugTests] = useState([]);
  const [drugTestsLoading, setDrugTestsLoading] = useState(false);
  const [drugTestError, setDrugTestError] = useState("");
  const [testingDate, setTestingDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [drugTestStatus, setDrugTestStatus] = useState("");
  const [drugTestRemarks, setDrugTestRemarks] = useState("");
  const [savingDrugTest, setSavingDrugTest] = useState(false);

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const patientHistory = (clinicHistory || [])
    .filter((record) => record.patientId === patient?.patientId)
    .slice()
    .reverse();

  const detailItems = [
    { label: "Student Number", value: patient?.studentNumber },
    { label: "Patient ID", value: patient?.patientId },
    { label: "Full Name", value: patient?.name },
    { label: "Course", value: patient?.course },
    { label: "Year Level", value: patient?.yearLevel },
    { label: "Age", value: patient?.age },
    { label: "Sex", value: patient?.sex },
    { label: "Address", value: patient?.address, fullWidth: true },
    { label: "Guardian Name", value: patient?.guardianName },
    { label: "Guardian Relationship", value: patient?.guardianRelationship },
    {
      label: "Guardian Contact Number",
      value: patient?.guardianContactNumber,
    },
  ];

  useEffect(() => {
    if (!patient?.id) return undefined;

    let cancelled = false;

    async function loadDrugTests() {
      setDrugTestsLoading(true);
      setDrugTestError("");

      try {
        const token = localStorage.getItem("udm_auth_token");
        if (!token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const response = await fetch(
          `${API_URL}/api/patients/${encodeURIComponent(patient.id)}/drug-tests`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.message || "Unable to load drug test results.");
        }

        if (!cancelled) {
          setDrugTests(Array.isArray(result.drugTests) ? result.drugTests : []);
        }
      } catch (error) {
        if (!cancelled) {
          setDrugTestError(error.message || "Unable to load drug test results.");
        }
      } finally {
        if (!cancelled) setDrugTestsLoading(false);
      }
    }

    loadDrugTests();
    return () => {
      cancelled = true;
    };
  }, [patient?.id]);

  const handleDrugTestSubmit = async (event) => {
    event.preventDefault();
    if (!patient?.id || savingDrugTest) return;
    setSavingDrugTest(true);
    setDrugTestError("");

    try {
      const token = localStorage.getItem("udm_auth_token");
      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/api/patients/${encodeURIComponent(patient.id)}/drug-tests`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testingDate,
            status: drugTestStatus,
            remarks: drugTestRemarks.trim(),
          }),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Unable to save the drug test result.");
      }

      setDrugTests((previous) => [result.drugTest, ...previous]);
      setDrugTestStatus("");
      setDrugTestRemarks("");
    } catch (error) {
      setDrugTestError(error.message || "Unable to save the drug test result.");
    } finally {
      setSavingDrugTest(false);
    }
  };

  const vitalItems = [
    {
      label: "Blood Pressure",
      value: (record) => record.bloodPressure,
      unit: "",
      icon: HeartPulse,
    },
    {
      label: "Temperature",
      value: (record) => record.temperature,
      unit: "°C",
      icon: Thermometer,
    },
    {
      label: "Heart Rate",
      value: (record) => record.heartRate,
      unit: "bpm",
      icon: Activity,
    },
    {
      label: "SpO2",
      value: (record) => record.spo2,
      unit: "%",
      icon: HeartPulse,
    },
    {
      label: "Height",
      value: (record) => record.height,
      unit: "cm",
      icon: Ruler,
    },
    {
      label: "Weight",
      value: (record) => record.weight,
      unit: "kg",
      icon: Weight,
    },
    {
      label: "BMI",
      value: (record) =>
        record.bmi !== null && record.bmi !== undefined && record.bmi !== ""
          ? Number(record.bmi).toFixed(2)
          : null,
      unit: "",
      icon: Activity,
    },
    {
      label: "BMI Status",
      value: (record) => record.bmiStatus,
      unit: "",
      icon: ShieldCheck,
    },
  ];

  const displayValue = (value) =>
    value !== null && value !== undefined && value !== ""
      ? value
      : "--";

  if (!patient) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          user={currentUser}
          currentPage={currentPage}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />

        <main className="flex min-w-0 flex-1 items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-900">
              <User size={30} />
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900">
              No Patient Selected
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Please return to the Patients page and select a patient record.
            </p>

            <button
              type="button"
              onClick={() => onNavigate("patients")}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-900 px-5 py-3 font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              <ArrowLeft size={18} />
              Back to Patients
            </button>
          </div>
        </main>
      </div>
    );
  }

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
          <button
            type="button"
            onClick={() => onNavigate("patients")}
            className="mb-5 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-gray-500 transition hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-4"
          >
            <ArrowLeft size={18} />
            Back to Patients
          </button>

          <header className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold text-green-800">
                UDM Health Care Monitoring System
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Patient Profile
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                View patient information and previous clinic visits.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onNavigate("edit-patient")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-900 transition hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-100"
              >
                <Edit size={17} />
                Edit Patient
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
              >
                <Trash2 size={17} />
                Delete Patient
              </button>
            </div>
          </header>

          <section className="mb-6 overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
            <div className="h-2 bg-green-900" />

            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-900 sm:h-24 sm:w-24">
                <User size={42} />
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-900">
                  <ShieldCheck size={14} />
                  Patient Record
                </span>

                <h2 className="mt-3 break-words text-xl font-extrabold text-gray-900 sm:text-2xl">
                  {displayValue(patient.name)}
                </h2>

                <div className="mt-2 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:gap-x-5">
                  <span>
                    Student Number:{" "}
                    <strong className="font-semibold text-gray-700">
                      {displayValue(patient.studentNumber)}
                    </strong>
                  </span>

                  <span>
                    Patient ID:{" "}
                    <strong className="font-semibold text-gray-700">
                      {displayValue(patient.patientId)}
                    </strong>
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <GraduationCap size={17} className="text-green-800" />
                  <span>
                    {[patient.course, patient.yearLevel]
                      .filter(Boolean)
                      .join(" • ") || "Academic details unavailable"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-bold text-gray-900">
                Patient Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Basic details associated with this patient.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:grid-cols-3">
              {detailItems.map((item) => (
                <div
                  key={item.label}
                  className={item.fullWidth ? "sm:col-span-2 lg:col-span-3" : ""}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {item.label}
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold text-gray-800 sm:text-base">
                    {displayValue(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-bold text-gray-900">
                Drug Test Results
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Results are saved directly to this patient's record.
              </p>
            </div>

            <form
              onSubmit={handleDrugTestSubmit}
              className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"
            >
              <div>
                <label htmlFor="testingDate" className="mb-2 block text-sm font-semibold text-gray-700">
                  Testing Date
                </label>
                <input
                  id="testingDate"
                  type="date"
                  value={testingDate}
                  onChange={(event) => setTestingDate(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100"
                />
              </div>
              <div>
                <label htmlFor="drugTestStatus" className="mb-2 block text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  id="drugTestStatus"
                  value={drugTestStatus}
                  onChange={(event) => setDrugTestStatus(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100"
                >
                  <option value="">Select result</option>
                  <option value="Negative">Negative</option>
                  <option value="Positive">Positive</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="drugTestRemarks" className="mb-2 block text-sm font-semibold text-gray-700">
                  Remarks
                </label>
                <textarea
                  id="drugTestRemarks"
                  value={drugTestRemarks}
                  onChange={(event) => setDrugTestRemarks(event.target.value)}
                  rows={2}
                  className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100"
                />
              </div>
              {drugTestError && (
                <p role="alert" className="sm:col-span-2 text-sm text-red-700">
                  {drugTestError}
                </p>
              )}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={savingDrugTest}
                  className="rounded-xl bg-green-900 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingDrugTest ? "Saving..." : "Save Drug Test"}
                </button>
              </div>
            </form>

            <div className="border-t border-gray-100">
              {drugTestsLoading ? (
                <p className="p-5 text-sm text-gray-500">Loading drug tests...</p>
              ) : drugTests.length === 0 ? (
                <p className="p-5 text-sm text-gray-500">
                  No drug test results recorded for this patient.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {drugTests.map((test) => (
                    <article
                      key={test.id}
                      className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {test.testing_date}
                        </p>
                        {test.remarks && (
                          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                            {test.remarks}
                          </p>
                        )}
                      </div>
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                          test.status === "Positive"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {test.status}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <ClipboardList size={21} className="text-green-900" />
                  Clinic History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Previous visits and health assessments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate("assessment")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 sm:w-auto"
              >
                <Plus size={18} />
                New Visit
              </button>
            </div>

            {patientHistory.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-800">
                  <CalendarDays size={29} />
                </div>

                <h3 className="font-bold text-gray-900">
                  No Clinic History Yet
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  No clinic visits or assessments have been recorded for this
                  patient.
                </p>

                <button
                  type="button"
                  onClick={() => onNavigate("assessment")}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-green-900 transition hover:bg-green-50"
                >
                  <Plus size={17} />
                  Record a Visit
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {patientHistory.map((record, index) => (
                  <article
                    key={record.id ?? `${record.date}-${record.time}-${index}`}
                    className="p-4 sm:p-6"
                  >
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-900">
                          <HeartPulse size={22} />
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-900">
                            Health Assessment
                          </h3>

                          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
                            <CalendarDays size={15} />
                            {displayValue(record.date)}
                            <span>•</span>
                            {displayValue(record.time)}
                          </p>
                        </div>
                      </div>

                      <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-900">
                        Visit {patientHistory.length - index}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {vitalItems.map((item) => {
                        const Icon = item.icon;
                        const value = item.value(record);

                        return (
                          <div
                            key={item.label}
                            className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 p-4"
                          >
                            <div className="flex items-center gap-2 text-gray-500">
                              <Icon size={16} className="shrink-0 text-green-800" />
                              <p className="text-xs font-medium">
                                {item.label}
                              </p>
                            </div>

                            <p className="mt-2 break-words text-base font-bold text-gray-900">
                              {displayValue(value)}
                              {value !== null &&
                                value !== undefined &&
                                value !== "" &&
                                item.unit
                                ? ` ${item.unit}`
                                : ""}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {record.reason && (
                      <div className="mt-5 rounded-xl border border-green-100 bg-green-50/50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-green-900">
                          Reason for Visit
                        </p>

                        <p className="mt-2 break-words text-sm leading-6 text-gray-700">
                          {record.reason}
                        </p>
                      </div>
                    )}

                    {record.notes && (
                      <div className="mt-4 rounded-xl border border-gray-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          Additional Notes
                        </p>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                          {record.notes}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-patient-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <Trash2 size={24} />
            </div>

            <h2
              id="delete-patient-title"
              className="text-xl font-extrabold text-gray-900"
            >
              Delete Patient?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Are you sure you want to delete{" "}
              <strong className="text-gray-800">
                {displayValue(patient.name)}
              </strong>
              ? This action may permanently remove the patient record and could
              affect associated clinic history.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="button"
                onClick={onDeletePatient}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200"
              >
                <Trash2 size={17} />
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientProfile;