import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { formatClinicDate, formatClinicTime, getClinicDateKey } from "../utils/dateTime";
import {
  Search,
  FileText,
  Eye,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Save,
  Activity,
  CalendarDays,
  UserRound,
  HeartPulse,
  AlertCircle,
} from "lucide-react";

const API_URL = `${(import.meta.env.VITE_API_URL || "https://udm-health-care-api.onrender.com").replace(/\/+$/, "")}/api/assessments`;

const emptyForm = {
  height: "",
  weight: "",
  bloodPressure: "",
  temperature: "",
  heartRate: "",
  spo2: "",
  reason: "",
  notes: "",
};

function getBmiStatus(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function getPatient(record) {
  const relation = record.patients || record.patient || {};
  return Array.isArray(relation) ? relation[0] || {} : relation;
}

function formatRecord(record) {
  const patient = getPatient(record);
  const createdAt = record.created_at ? new Date(record.created_at) : null;
  const validDate = createdAt && !Number.isNaN(createdAt.getTime());

  return {
    id: record.id,
    patientRecordId: record.patient_id,
    patientId: patient.patient_id || record.patient_identifier || "--",
    studentNumber: patient.student_number || record.student_number || "--",
    patientName: patient.name || record.patient_name || "Unknown Patient",
    height: record.height ?? "",
    weight: record.weight ?? "",
    bloodPressure: record.blood_pressure ?? record.bloodPressure ?? "",
    temperature: record.temperature ?? "",
    heartRate: record.heart_rate ?? record.heartRate ?? "",
    spo2: record.spo2 ?? "",
    bmi: record.bmi ?? "",
    bmiStatus: record.bmi_status || record.bmiStatus || "",
    reason: record.reason || "",
    notes: record.notes || "",
    date: validDate ? formatClinicDate(createdAt) : "--",
    time: validDate ? formatClinicTime(createdAt) : "",
    dateKey: validDate ? getClinicDateKey(createdAt) : "",
    createdAt: record.created_at,
  };
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text || `Server returned status ${response.status}.` };
  }
}

function Records({ user, currentPage, onNavigate, onViewRecord, onLogout }) {
  const currentUser = user || { name: "Clinic Staff", role: "Staff" };

  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const token = localStorage.getItem("udm_auth_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.message || "Unable to load clinic records.");
      }

      const assessments = Array.isArray(result) ? result : result.assessments || [];
      setRecords(assessments.map(formatRecord));
    } catch (fetchError) {
      setError(fetchError.message || "Unable to connect to the clinic records server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const query = searchQuery.toLowerCase().trim();

  const filteredRecords = records
    .filter((record) => {
      if (!query) return true;

      return (
        String(record.patientName).toLowerCase().includes(query) ||
        String(record.studentNumber).toLowerCase().includes(query) ||
        String(record.patientId).toLowerCase().includes(query) ||
        String(record.reason).toLowerCase().includes(query)
      );
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const today = getClinicDateKey();
  const todaysRecords = records.filter((record) => record.dateKey === today).length;

  const startEditing = (record) => {
    setActionError("");
    setEditingRecord(record);
    setForm({
      height: String(record.height ?? ""),
      weight: String(record.weight ?? ""),
      bloodPressure: String(record.bloodPressure ?? ""),
      temperature: String(record.temperature ?? ""),
      heartRate: String(record.heartRate ?? ""),
      spo2: String(record.spo2 ?? ""),
      reason: String(record.reason ?? ""),
      notes: String(record.notes ?? ""),
    });
  };

  const closeEditor = () => {
    if (isSaving) return;
    setEditingRecord(null);
    setForm({ ...emptyForm });
    setActionError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingRecord || isSaving) return;

    const heightText = String(form.height).trim();
    const weightText = String(form.weight).trim();
    const temperatureText = String(form.temperature).trim();
    const heartRateText = String(form.heartRate).trim();
    const spo2Text = String(form.spo2).trim();
    const bloodPressure = String(form.bloodPressure).trim();
    const reason = String(form.reason).trim();
    const notes = String(form.notes ?? "").trim();

    const height = Number(heightText);
    const weight = Number(weightText);
    const temperature = Number(temperatureText);
    const heartRate = Number(heartRateText);
    const spo2 = Number(spo2Text);

    setActionError("");

    if (!heightText || !Number.isFinite(height) || height <= 0 || height > 300) {
      setActionError("Enter a valid height greater than 0 and no more than 300 cm.");
      return;
    }

    if (!weightText || !Number.isFinite(weight) || weight <= 0 || weight > 500) {
      setActionError("Enter a valid weight greater than 0 and no more than 500 kg.");
      return;
    }

    if (!temperatureText || !Number.isFinite(temperature) || temperature <= 0 || temperature > 50) {
      setActionError("Enter a valid temperature greater than 0 and no more than 50 °C.");
      return;
    }

    if (!heartRateText || !Number.isInteger(heartRate) || heartRate < 1 || heartRate > 300) {
      setActionError("Enter a whole-number heart rate between 1 and 300 bpm.");
      return;
    }

    if (!spo2Text || !Number.isFinite(spo2) || spo2 <= 0 || spo2 > 100) {
      setActionError("SpO₂ must be greater than 0 and no more than 100%.");
      return;
    }

    if (!/^\d{2,3}\/\d{2,3}$/.test(bloodPressure)) {
      setActionError("Enter blood pressure in the format 120/80.");
      return;
    }

    const [systolic, diastolic] = bloodPressure.split("/").map(Number);

    if (systolic < 1 || systolic > 300 || diastolic < 1 || diastolic > 200) {
      setActionError("Enter valid systolic and diastolic blood pressure values.");
      return;
    }

    if (!reason) {
      setActionError("Reason for visit is required.");
      return;
    }

    const bmi = Number((weight / (height / 100) ** 2).toFixed(2));
    const token = localStorage.getItem("udm_auth_token");

    if (!token) {
      setActionError("Your session has expired. Please log in again.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/${editingRecord.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          height,
          weight,
          bloodPressure,
          temperature,
          heartRate,
          spo2,
          reason,
          notes,
        }),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.message || `Failed to update assessment (${response.status}).`);
      }

      const updatedAssessment = result.assessment;

      if (updatedAssessment) {
        setRecords((previousRecords) =>
          previousRecords.map((record) =>
            String(record.id) === String(editingRecord.id)
              ? formatRecord({
                  ...record,
                  ...updatedAssessment,
                  patients: {
                    name: editingRecord.patientName,
                    student_number: editingRecord.studentNumber,
                    patient_id: editingRecord.patientId,
                  },
                })
              : record
          )
        );
      } else {
        await fetchRecords();
      }

      setEditingRecord(null);
      setForm({ ...emptyForm });
      setActionError("");

      window.alert(`Assessment updated successfully. BMI: ${bmi.toFixed(2)} (${getBmiStatus(bmi)}).`);
    } catch (updateError) {
      console.error("Assessment update failed:", updateError);
      setActionError(updateError.message || "Unable to update the assessment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (record) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the assessment for ${record.patientName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("udm_auth_token");

    if (!token) {
      setActionError("Your session has expired. Please log in again.");
      return;
    }

    setDeletingId(record.id);
    setActionError("");

    try {
      const response = await fetch(`${API_URL}/${record.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(result.message || `Delete failed with status ${response.status}.`);
      }

      setRecords((previousRecords) =>
        previousRecords.filter((item) => String(item.id) !== String(record.id))
      );

      if (String(editingRecord?.id) === String(record.id)) {
        setEditingRecord(null);
        setForm({ ...emptyForm });
      }

      window.alert("Assessment deleted successfully.");
    } catch (deleteError) {
      console.error("Assessment deletion failed:", deleteError);
      setActionError(deleteError.message || "Unable to delete the assessment.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (record) => {
    if (onViewRecord) onViewRecord(record);
  };

  const inputClass =
    "mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100";

  const fields = [
    { name: "height", label: "Height", unit: "cm", step: "0.1", min: "0.1", max: "300" },
    { name: "weight", label: "Weight", unit: "kg", step: "0.1", min: "0.1", max: "500" },
    { name: "bloodPressure", label: "Blood Pressure", unit: "mmHg", type: "text", placeholder: "120/80" },
    { name: "temperature", label: "Temperature", unit: "°C", step: "0.1", min: "0.1", max: "50" },
    { name: "heartRate", label: "Heart Rate", unit: "bpm", step: "1", min: "1", max: "300" },
    { name: "spo2", label: "SpO₂", unit: "%", step: "1", min: "1", max: "100" },
  ];

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-[#f6f8f7] lg:flex-row">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[1500px]">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-900">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                UDM CLINIC
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Clinic Records
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Review patient visits and assessment history.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm sm:self-auto">
              <CalendarDays size={17} className="text-emerald-700" />
              <span>{formatClinicDate(new Date(), {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}</span>
            </div>
          </header>

          {actionError && !editingRecord && (
            <div
              role="alert"
              className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <div className="flex items-start gap-2">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionError("")}
                aria-label="Dismiss error"
                className="shrink-0 rounded-lg p-1 hover:bg-red-100"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <section aria-label="Record summary" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">All assessments</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{records.length}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <FileText size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Today's visits</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{todaysRecords}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <CalendarDays size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Matching records</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{filteredRecords.length}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Search size={21} />
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={19}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search name, Student Number, Patient ID, or visit reason..."
                  aria-label="Search clinic records"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={fetchRecords}
                disabled={isLoading || isSaving || deletingId !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                Refresh records
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-800">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">All Clinic Records</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isLoading
                      ? "Loading records..."
                      : `${filteredRecords.length} record${filteredRecords.length !== 1 ? "s" : ""} found`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                Clinic assessment history
              </div>
            </div>

            {isLoading ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                  <RefreshCw size={27} className="animate-spin" />
                </div>
                <p className="mt-4 font-semibold text-slate-800">Loading clinic records</p>
                <p className="mt-1 text-sm text-slate-500">Connecting to the database...</p>
              </div>
            ) : error ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertCircle size={27} />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">Unable to load records</h3>
                <p className="mt-2 max-w-lg break-words text-sm leading-6 text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={fetchRecords}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-900"
                >
                  <RefreshCw size={16} />
                  Try again
                </button>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  {query ? <Search size={28} /> : <FileText size={28} />}
                </div>
                <h3 className="mt-4 font-bold text-slate-900">
                  {query ? "No matching records" : "No clinic records yet"}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {query
                    ? "Try another patient name, Student Number, Patient ID, or visit reason."
                    : "Saved patient assessments will appear here after they are recorded."}
                </p>
                {query && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 bg-green-50/50 px-4 py-3 text-xs text-slate-500 sm:hidden">
                  Swipe horizontally to view all columns and actions.
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        {["Patient", "Student Number", "Visit Date", "Blood Pressure", "BMI", "Actions"].map((heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 sm:px-6"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="transition hover:bg-green-50/40">
                          <td className="px-5 py-4 sm:px-6 sm:py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-800">
                                <UserRound size={19} />
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-52 truncate text-sm font-semibold text-slate-900">
                                  {record.patientName}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  ID: {record.patientId}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                            {record.studentNumber}
                          </td>

                          <td className="px-5 py-4 sm:px-6">
                            <div className="flex items-start gap-2">
                              <CalendarDays size={16} className="mt-0.5 shrink-0 text-green-700" />
                              <div>
                                <p className="whitespace-nowrap text-sm font-medium text-slate-700">{record.date}</p>
                                <p className="mt-1 text-xs text-slate-400">{record.time || "Time unavailable"}</p>
                                <p className="mt-2 max-w-44 truncate text-xs text-slate-500" title={record.reason}>
                                  {record.reason || "No reason provided"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                            <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                              {record.bloodPressure || "--"}
                            </span>
                          </td>

                          <td className="px-5 py-4 sm:px-6">
                            <p className="text-sm font-bold text-slate-900">
                              {record.bmi !== "" && record.bmi !== null && record.bmi !== undefined && Number.isFinite(Number(record.bmi))
                                ? Number(record.bmi).toFixed(2)
                                : "--"}
                            </p>
                            <span className="mt-1 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800">
                              {record.bmiStatus || "--"}
                            </span>
                          </td>

                          <td className="px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleView(record)}
                                title="View assessment"
                                aria-label={`View assessment for ${record.patientName}`}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-200"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => startEditing(record)}
                                disabled={isSaving || deletingId !== null}
                                title="Edit assessment"
                                aria-label={`Edit assessment for ${record.patientName}`}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(record)}
                                disabled={isSaving || deletingId !== null}
                                title="Delete assessment"
                                aria-label={`Delete assessment for ${record.patientName}`}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === record.id ? (
                                  <RefreshCw size={17} className="animate-spin" />
                                ) : (
                                  <Trash2 size={17} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {!isLoading && !error && filteredRecords.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>
                  Showing <span className="font-semibold text-slate-700">{filteredRecords.length}</span> of{" "}
                  <span className="font-semibold text-slate-700">{records.length}</span> records
                </p>
                <p>Sorted by most recent visit</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {editingRecord && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-assessment-title"
            className="my-auto flex max-h-[95dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-800 sm:flex">
                  <Pencil size={21} />
                </div>
                <div className="min-w-0">
                  <h2 id="edit-assessment-title" className="text-lg font-bold text-slate-900 sm:text-xl">
                    Edit Clinic Assessment
                  </h2>
                  <p className="mt-1 truncate text-xs text-slate-500 sm:text-sm">
                    {editingRecord.patientName} · {editingRecord.studentNumber}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                disabled={isSaving}
                aria-label="Close editor"
                className="shrink-0 rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-6 p-4 sm:p-6">
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <HeartPulse size={20} className="mt-0.5 shrink-0 text-green-800" />
                    <div>
                      <h3 className="text-sm font-semibold text-green-950">Patient measurements</h3>
                      <p className="mt-1 text-xs leading-5 text-green-800">
                        Update the recorded measurements and confirm that each value is correct before saving.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  {fields.map((field) => (
                    <label key={field.name} className="block min-w-0 text-sm font-semibold text-slate-700">
                      {field.label}
                      <span className="ml-1 font-normal text-slate-400">({field.unit})</span>
                      <input
                        required
                        name={field.name}
                        type={field.type || "number"}
                        inputMode={field.type === "text" ? "text" : "decimal"}
                        step={field.step}
                        min={field.min}
                        max={field.max}
                        value={form[field.name]}
                        onChange={handleFormChange}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        className={inputClass}
                      />
                    </label>
                  ))}

                  <label className="block min-w-0 text-sm font-semibold text-slate-700 sm:col-span-2">
                    Reason for Visit <span className="text-red-500">*</span>
                    <input
                      required
                      name="reason"
                      value={form.reason}
                      onChange={handleFormChange}
                      maxLength={500}
                      placeholder="Enter the reason for the visit"
                      className={inputClass}
                    />
                  </label>

                  <label className="block min-w-0 text-sm font-semibold text-slate-700 sm:col-span-2">
                    Clinical Notes
                    <span className="ml-1 font-normal text-slate-400">(Optional)</span>
                    <textarea
                      name="notes"
                      rows={4}
                      value={form.notes}
                      onChange={handleFormChange}
                      maxLength={5000}
                      placeholder="Enter relevant observations or additional notes..."
                      className={`${inputClass} resize-y`}
                    />
                  </label>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Activity size={19} className="mt-0.5 shrink-0 text-green-800" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">BMI recalculation</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      BMI is calculated from the updated height and weight when saved. BMI categories are screening indicators and should be interpreted in the appropriate clinical context.
                    </p>
                  </div>
                </div>

                {actionError && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <AlertCircle size={19} className="mt-0.5 shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={isSaving}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:min-w-28"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-40"
                >
                  {isSaving ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {isSaving ? "Saving changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Records;