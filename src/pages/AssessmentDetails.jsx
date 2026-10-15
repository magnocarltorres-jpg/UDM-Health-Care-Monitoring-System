import { ArrowLeft, FileText, UserRound, Activity, HeartPulse, ClipboardList, CalendarDays, Clock3, Ruler, Weight, Thermometer, Gauge, Droplets, Stethoscope } from "lucide-react";
import Sidebar from "../components/Sidebar";

function AssessmentDetails({ user, currentPage, record, onNavigate, onBack, onLogout }) {
  const hasValue = (value) => value !== "" && value != null;

  const formatValue = (value, unit = "") =>
    hasValue(value) ? `${value}${unit}` : "--";

  const bmi = hasValue(record?.bmi) ? Number(record.bmi).toFixed(2) : "--";

  const bmiColor = {
    Underweight: "bg-sky-50 text-sky-700 ring-sky-200",
    Normal: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Normal weight": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Overweight: "bg-amber-50 text-amber-700 ring-amber-200",
    Obese: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  if (!record) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          user={user}
          currentPage={currentPage}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
        <main className="flex min-w-0 flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <FileText size={28} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              Assessment Not Found
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              The selected assessment record is unavailable.
            </p>
            <button
              onClick={onBack}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <ArrowLeft size={17} />
              Back to Records
            </button>
          </div>
        </main>
      </div>
    );
  }

  const patientDetails = [
    { label: "Patient Name", value: record.patientName, icon: UserRound },
    { label: "Student Number", value: record.studentNumber, icon: ClipboardList },
    { label: "Patient ID", value: record.patientId, icon: FileText },
    { label: "Visit Date", value: record.date, icon: CalendarDays },
    { label: "Visit Time", value: record.time, icon: Clock3 },
  ];

  const vitalSigns = [
    { label: "Height", value: formatValue(record.height, " cm"), icon: Ruler, color: "bg-sky-50 text-sky-700" },
    { label: "Weight", value: formatValue(record.weight, " kg"), icon: Weight, color: "bg-violet-50 text-violet-700" },
    { label: "Blood Pressure", value: record.bloodPressure || "--", icon: Activity, color: "bg-rose-50 text-rose-700" },
    { label: "Temperature", value: formatValue(record.temperature, " °C"), icon: Thermometer, color: "bg-orange-50 text-orange-700" },
    { label: "Heart Rate", value: formatValue(record.heartRate, " bpm"), icon: HeartPulse, color: "bg-pink-50 text-pink-700" },
    { label: "SpO₂", value: formatValue(record.spo2, "%"), icon: Droplets, color: "bg-cyan-50 text-cyan-700" },
  ];

  const bmiStatus = record.bmiStatus || "--";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-6xl space-y-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <button
                onClick={onBack}
                className="mb-4 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-emerald-700"
              >
                <ArrowLeft size={18} />
                Back to Records
              </button>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Assessment Details
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Review the patient's visit information and clinical assessment.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
              <FileText size={16} />
              Clinic Record
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
       <div className="h-2 bg-gradient-to-r from-green-700 via-green-600 to-green-700" />
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <UserRound size={32} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                  Patient Record
                </p>
                <h2 className="mt-1 break-words text-2xl font-bold text-slate-900">
                  {record.patientName || "Unknown Patient"}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    Student No: {record.studentNumber || "--"}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    Patient ID: {record.patientId || "--"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 sm:min-w-44">
                <p className="text-xs font-medium text-slate-500">Assessment Date</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {record.date || "--"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {record.time || "--"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <UserRound size={22} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Patient Information</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Identification and visit details
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {patientDetails.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center gap-2 text-slate-500">
                      <Icon size={16} />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    <p className="mt-3 break-words text-sm font-semibold text-slate-800">
                      {item.value || "--"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                <HeartPulse size={22} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Vital Signs</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Measurements recorded during the assessment
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vitalSigns.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <Gauge size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Body Mass Index (BMI)</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{bmi}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-medium text-slate-500">BMI Category</p>
                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${
                      bmiColor[bmiStatus] || "bg-slate-100 text-slate-600 ring-slate-200"
                    }`}
                  >
                    {bmiStatus}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Stethoscope size={22} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Clinical Assessment</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Reason for visit and recorded notes
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                  Reason for Visit
                </h3>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {record.reason || "No reason recorded."}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">
                  Assessment Notes
                </h3>
                <div className="min-h-24 whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {record.notes || "No assessment notes recorded."}
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-start border-t border-slate-200 pt-5">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <ArrowLeft size={17} />
              Back to Records
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AssessmentDetails;
