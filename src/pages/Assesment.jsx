import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  formatClinicDate,
  formatClinicTime,
  getClinicDateInputValue,
  getClinicDateKey,
} from "../utils/dateTime";
import {
  ArrowLeft,
  Save,
  User,
  GraduationCap,
  Ruler,
  Weight,
  HeartPulse,
  Thermometer,
  Activity,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://udm-health-care-api.onrender.com"
).replace(/\/+$/, "");

function Assessment({
  user,
  currentPage,
  patient,
  onNavigate,
  onSaveAssessment,
  onLogout,
}) {
  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [spo2, setSpo2] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [medicineId, setMedicineId] = useState("");
  const [dispenseQuantity, setDispenseQuantity] = useState("");
  const [inventoryError, setInventoryError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMedicines() {
      try {
        const token = localStorage.getItem("udm_auth_token");
        if (!token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const response = await fetch(`${API_URL}/api/medicines`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.message || "Unable to load medicine inventory.");
        }

        if (!cancelled) {
          setMedicines(Array.isArray(result.medicines) ? result.medicines : []);
        }
      } catch (error) {
        if (!cancelled) {
          setInventoryError(error.message || "Unable to load medicine inventory.");
        }
      }
    }

    loadMedicines();
    return () => {
      cancelled = true;
    };
  }, []);

  const calculateBMI = () => {
    if (!height.trim() || !weight.trim()) {
      return null;
    }

    const heightInMeters = Number(height) / 100;
    const weightValue = Number(weight);

    if (
      !Number.isFinite(heightInMeters) ||
      !Number.isFinite(weightValue) ||
      heightInMeters <= 0 ||
      weightValue <= 0
    ) {
      return null;
    }

    return weightValue / (heightInMeters * heightInMeters);
  };

  const bmi = calculateBMI();

  const getBMIStatus = () => {
    if (bmi === null) return "Not available";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const displayValue = (value) =>
    value !== null && value !== undefined && value !== ""
      ? value
      : "Not provided";

  const handleSave = async () => {
    if (isSaving) return;

    setSaveError("");
    setSaveSuccess("");

    if (
      !height.trim() ||
      !weight.trim() ||
      !bloodPressure.trim() ||
      !temperature.trim() ||
      !heartRate.trim() ||
      !spo2.trim() ||
      !reason.trim()
    ) {
      setSaveError("Please complete all required fields before saving.");
      return;
    }

    if (!patient?.id || !Number.isFinite(Number(patient.id))) {
      setSaveError(
        "The selected patient has no valid database ID. Please select the patient again."
      );
      return;
    }

    const heightValue = Number(height);
    const weightValue = Number(weight);
    const temperatureValue = Number(temperature);
    const heartRateValue = Number(heartRate);
    const spo2Value = Number(spo2);
    const bloodPressureValue = bloodPressure.trim();

    if (!/^\d{2,3}\/\d{2,3}$/.test(bloodPressureValue)) {
      setSaveError("Enter blood pressure in the correct format, such as 120/80.");
      return;
    }

    const [systolic, diastolic] = bloodPressureValue.split("/").map(Number);

    if (
      systolic < 50 ||
      systolic > 300 ||
      diastolic < 20 ||
      diastolic > 200
    ) {
      setSaveError("Please check the blood pressure values.");
      return;
    }

    if (
      !Number.isFinite(heightValue) ||
      heightValue < 30 ||
      heightValue > 250
    ) {
      setSaveError("Height must be between 30 and 250 cm.");
      return;
    }

    if (
      !Number.isFinite(weightValue) ||
      weightValue < 1 ||
      weightValue > 300
    ) {
      setSaveError("Weight must be between 1 and 300 kg.");
      return;
    }

    if (
      !Number.isFinite(temperatureValue) ||
      temperatureValue < 30 ||
      temperatureValue > 45
    ) {
      setSaveError("Temperature must be between 30°C and 45°C.");
      return;
    }

    if (
      !Number.isFinite(heartRateValue) ||
      heartRateValue < 30 ||
      heartRateValue > 220
    ) {
      setSaveError("Heart rate must be between 30 and 220 bpm.");
      return;
    }

    if (
      !Number.isFinite(spo2Value) ||
      spo2Value < 0 ||
      spo2Value > 100
    ) {
      setSaveError("SpO2 must be between 0% and 100%.");
      return;
    }

    if (bmi === null || !Number.isFinite(bmi)) {
      setSaveError("Unable to calculate BMI. Check height and weight.");
      return;
    }

    const token = localStorage.getItem("udm_auth_token");

    if (!token) {
      setSaveError("Your session has expired. Please log in again.");
      onLogout?.();
      return;
    }

    const assessmentData = {
      patientId: Number(patient.id),
      height: heightValue,
      weight: weightValue,
      bloodPressure: bloodPressureValue,
      temperature: temperatureValue,
      heartRate: heartRateValue,
      spo2: spo2Value,
      bmi: Number(bmi.toFixed(2)),
      bmiStatus: getBMIStatus(),
      reason: reason.trim(),
      notes: notes.trim(),
      medicineId: medicineId || null,
      dispenseQuantity: dispenseQuantity || null,
    };

    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assessmentData),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          result.message ||
            "Your session is invalid or your account is inactive. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(result.message || "Failed to save assessment.");
      }

      if (!result.assessment) {
        throw new Error("The server did not return the saved assessment.");
      }

      const saved = result.assessment;

      const savedAssessment = {
        id: saved.id,
        patientId: patient.patientId,
        studentNumber: patient.studentNumber,
        patientName: patient.name,
        height: saved.height,
        weight: saved.weight,
        bloodPressure: saved.blood_pressure,
        temperature: saved.temperature,
        heartRate: saved.heart_rate,
        spo2: saved.spo2,
        bmi: saved.bmi,
        bmiStatus: saved.bmi_status,
        reason: saved.reason,
        notes: saved.notes,
        date: saved.created_at
          ? formatClinicDate(saved.created_at)
          : "",
        time: saved.created_at
          ? formatClinicTime(saved.created_at, { second: "2-digit" })
          : "",
        dateKey: getClinicDateKey(saved.created_at),
      };

      if (typeof onSaveAssessment === "function") {
        await onSaveAssessment(savedAssessment);
      }

      setMedicineId("");
      setDispenseQuantity("");
      setSaveSuccess("Assessment saved successfully.");
    } catch (error) {
      setSaveError(
        error.message || "Unable to save assessment. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full min-w-0 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700";

  const measurementFields = [
    {
      label: "Height",
      unit: "cm",
      value: height,
      setter: setHeight,
      placeholder: "Enter height",
      icon: Ruler,
      min: 30,
      max: 250,
      step: "0.1",
      required: true,
    },
    {
      label: "Weight",
      unit: "kg",
      value: weight,
      setter: setWeight,
      placeholder: "Enter weight",
      icon: Weight,
      min: 1,
      max: 300,
      step: "0.1",
      required: true,
    },
    {
      label: "Temperature",
      unit: "°C",
      value: temperature,
      setter: setTemperature,
      placeholder: "e.g. 36.5",
      icon: Thermometer,
      min: 30,
      max: 45,
      step: "0.1",
      required: true,
    },
    {
      label: "Heart Rate",
      unit: "bpm",
      value: heartRate,
      setter: setHeartRate,
      placeholder: "e.g. 75",
      icon: Activity,
      min: 30,
      max: 220,
      step: "1",
      required: true,
    },
    {
      label: "SpO2",
      unit: "%",
      value: spo2,
      setter: setSpo2,
      placeholder: "e.g. 98",
      icon: HeartPulse,
      min: 0,
      max: 100,
      step: "0.1",
      required: true,
    },
  ];

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
              Please select a patient before starting an assessment.
            </p>

            <button
              type="button"
              onClick={() => onNavigate("patients")}
              className="mt-6 w-full rounded-xl bg-green-900 px-5 py-3 font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Go to Patients
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
            onClick={() => onNavigate("patient-profile")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-4"
          >
            <ArrowLeft size={18} />
            Back to Patient Profile
          </button>

          <header className="mb-7">
            <p className="mb-2 text-sm font-semibold text-green-800">
              UDM Health Care Monitoring System
            </p>

            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Health Assessment
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Record the patient's current health measurements and visit notes.
            </p>
          </header>

          <section className="mb-6 overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
            <div className="h-2 bg-green-900" />

            <div className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-900">
                  <User size={23} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Patient Information
                  </h2>
                  <p className="text-sm text-gray-500">
                    Confirm the patient before recording measurements.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Patient Name
                  </p>
                  <p className="mt-2 break-words font-semibold text-gray-900">
                    {displayValue(patient.name)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Student Number
                  </p>
                  <p className="mt-2 break-words font-semibold text-gray-900">
                    {displayValue(patient.studentNumber)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Patient ID
                  </p>
                  <p className="mt-2 break-words font-semibold text-gray-900">
                    {displayValue(patient.patientId)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Course and Year
                  </p>
                  <p className="mt-2 flex items-start gap-2 break-words font-semibold text-gray-900">
                    <GraduationCap
                      size={18}
                      className="mt-0.5 shrink-0 text-green-800"
                    />
                    {[patient.course, patient.yearLevel]
                      .filter(Boolean)
                      .join(" • ") || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-900">
                  <HeartPulse size={23} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Health Measurements
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the measurements recorded during the visit.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:grid-cols-3">
              {measurementFields.slice(0, 2).map((field) => {
                const Icon = field.icon;

                return (
                  <div key={field.label} className="min-w-0">
                    <label className={labelClass}>
                      {field.label} ({field.unit}){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Icon
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-800"
                      />
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={field.value}
                        onChange={(event) => field.setter(event.target.value)}
                        placeholder={field.placeholder}
                        className={`${inputClass} pl-10 pr-14`}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                        {field.unit}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="min-w-0">
                <label className={labelClass}>
                  Blood Pressure <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <HeartPulse
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-800"
                  />
                  <input
                    type="text"
                    value={bloodPressure}
                    onChange={(event) => setBloodPressure(event.target.value)}
                    placeholder="e.g. 120/80"
                    className={`${inputClass} pl-10`}
                    aria-describedby="blood-pressure-hint"
                  />
                </div>

                <p id="blood-pressure-hint" className="mt-2 text-xs text-gray-400">
                  Format: systolic/diastolic, such as 120/80
                </p>
              </div>

              {measurementFields.slice(2).map((field) => {
                const Icon = field.icon;

                return (
                  <div key={field.label} className="min-w-0">
                    <label className={labelClass}>
                      {field.label} ({field.unit}){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Icon
                        size={18}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-800"
                      />
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={field.value}
                        onChange={(event) => field.setter(event.target.value)}
                        placeholder={field.placeholder}
                        className={`${inputClass} pl-10 pr-14`}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                        {field.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-bold text-gray-900">
                Dispense Medicine (Optional)
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Dispensed quantity is deducted from available stock when this visit is saved.
              </p>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <label className={labelClass} htmlFor="medicineId">
                  Medicine
                </label>
                <select
                  id="medicineId"
                  value={medicineId}
                  onChange={(event) => setMedicineId(event.target.value)}
                  className={inputClass}
                >
                  <option value="">No medicine dispensed</option>
                  {medicines
                    .filter(
                      (medicine) =>
                        medicine.stock_quantity > 0 &&
                        medicine.expiration_date >=
                          getClinicDateInputValue(),
                    )
                    .map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.medicine_name} ({medicine.dosage}) —{" "}
                        {medicine.stock_quantity} in stock
                      </option>
                    ))}
                </select>
                {inventoryError && (
                  <p role="alert" className="mt-2 text-sm text-red-700">
                    {inventoryError}
                  </p>
                )}
                {!inventoryError &&
                  medicines.filter(
                    (medicine) =>
                      medicine.stock_quantity > 0 &&
                      medicine.expiration_date >=
                        getClinicDateInputValue(),
                  ).length === 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      No unexpired medicine is currently in stock.
                    </p>
                  )}
              </div>
              <div>
                <label className={labelClass} htmlFor="dispenseQuantity">
                  Quantity to Dispense
                </label>
                <input
                  id="dispenseQuantity"
                  type="number"
                  min="1"
                  max={
                    medicines.find(
                      (medicine) => String(medicine.id) === medicineId,
                    )?.stock_quantity || undefined
                  }
                  value={dispenseQuantity}
                  onChange={(event) => setDispenseQuantity(event.target.value)}
                  disabled={!medicineId}
                  required={Boolean(medicineId)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-900">
                  <FileText size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Visit Notes
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Describe the reason for the visit and any observations.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label className={labelClass}>
                  Reason for Visit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="e.g. Headache, injury, consultation"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Enter additional observations or notes..."
                  rows={4}
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>
          </section>

          <section className="mb-6 overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
            <div className="border-b border-green-100 bg-green-50/70 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-900 text-white">
                  <Activity size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Automatic Results
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    BMI is calculated from the entered height and weight.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-sm font-semibold text-gray-500">
                  Body Mass Index (BMI)
                </p>

                <p className="mt-3 text-3xl font-extrabold text-green-900">
                  {bmi !== null && Number.isFinite(bmi)
                    ? bmi.toFixed(2)
                    : "--"}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Calculated in kg/m²
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-sm font-semibold text-gray-500">
                  BMI Interpretation
                </p>

                <p className="mt-3 text-xl font-extrabold text-gray-900">
                  {getBMIStatus()}
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  BMI is a screening measure, not a diagnosis. Interpretation
                  may differ for children and adolescents.
                </p>
              </div>
            </div>
          </section>

          {saveError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="leading-6">{saveError}</p>
            </div>
          )}

          {saveSuccess && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            >
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
              <p className="leading-6">{saveSuccess}</p>
            </div>
          )}

          <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white/95 p-4 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:rounded-2xl sm:border sm:bg-white sm:p-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onNavigate("patient-profile")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={18} />
              Cancel
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving Assessment...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Assessment
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Assessment;