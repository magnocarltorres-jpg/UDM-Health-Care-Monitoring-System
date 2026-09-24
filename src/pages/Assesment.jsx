import { useState } from "react";

import Sidebar from "../components/Sidebar";

import { ArrowLeft, Save } from "lucide-react";

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

  const calculateBMI = () => {
    if (!height || !weight) {
      return null;
    }

    const heightInMeters = Number(height) / 100;

    if (heightInMeters <= 0 || Number(weight) <= 0) {
      return null;
    }

    return Number(weight) / (heightInMeters * heightInMeters);
  };

  const bmi = calculateBMI();

  const getBMIStatus = () => {
    if (bmi === null) {
      return "Not available";
    }

    if (bmi < 18.5) {
      return "Underweight";
    }

    if (bmi < 25) {
      return "Normal";
    }

    if (bmi < 30) {
      return "Overweight";
    }

    return "Obese";
  };

  const handleSave = () => {
    if (
      !height ||
      !weight ||
      !bloodPressure ||
      !temperature ||
      !heartRate ||
      !spo2 ||
      !reason.trim()
    ) {
      alert("Please complete all required fields before saving.");
      return;
    }

    const bloodPressurePattern = /^\d{2,3}\/\d{2,3}$/;

    if (!bloodPressurePattern.test(bloodPressure)) {
      alert(
        "Please enter blood pressure in the correct format, such as 120/80.",
      );
      return;
    }

    const heightValue = Number(height);
    const weightValue = Number(weight);
    const temperatureValue = Number(temperature);
    const heartRateValue = Number(heartRate);
    const spo2Value = Number(spo2);

    if (heightValue < 30 || heightValue > 250) {
      alert("Height must be between 30 and 250 cm.");
      return;
    }

    if (weightValue < 1 || weightValue > 300) {
      alert("Weight must be between 1 and 300 kg.");
      return;
    }

    if (temperatureValue < 30 || temperatureValue > 45) {
      alert("Temperature must be between 30°C and 45°C.");
      return;
    }

    if (heartRateValue < 30 || heartRateValue > 220) {
      alert("Heart rate must be between 30 and 220 bpm.");
      return;
    }

    if (spo2Value < 0 || spo2Value > 100) {
      alert("SpO2 must be between 0% and 100%.");
      return;
    }

    const assessment = {
      id: crypto.randomUUID(),
      patientId: patient.patientId,
      studentNumber: patient.studentNumber,
      patientName: patient.name,
      height,
      weight,
      bloodPressure,
      temperature,
      heartRate,
      spo2,
      bmi,
      bmiStatus: getBMIStatus(),
      reason: reason.trim(),
      notes: notes.trim(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    onSaveAssessment(assessment);
  };

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
              Please select a patient before starting an assessment.
            </p>

            <button
              type="button"
              onClick={() => onNavigate("patients")}
              className="mt-5 rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
            >
              Go to Patients
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
        <div className="mb-8">
          <button
            type="button"
            onClick={() => onNavigate("patient-profile")}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-700"
          >
            <ArrowLeft size={18} />
            Back to Patient Profile
          </button>

          <h1 className="text-3xl font-bold text-slate-800">
            Health Assessment
          </h1>

          <p className="mt-1 text-slate-500">
            Record the patient's current health measurements.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Patient Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Patient Name</p>

              <p className="mt-1 font-medium text-slate-800">{patient.name}</p>
            </div>

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
              <p className="text-sm text-slate-500">Course</p>

              <p className="mt-1 font-medium text-slate-800">
                {patient.course} • {patient.yearLevel}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-800">
            Health Measurements
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Height (cm)
              </label>

              <input
                type="number"
                min="30"
                max="250"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                placeholder="Enter height"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Weight (kg)
              </label>

              <input
                type="number"
                min="1"
                max="300"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="Enter weight"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Blood Pressure
              </label>

              <input
                type="text"
                value={bloodPressure}
                onChange={(event) => setBloodPressure(event.target.value)}
                placeholder="e.g. 120/80"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Temperature (°C)
              </label>

              <input
                type="number"
                min="30"
                max="45"
                step="0.1"
                value={temperature}
                onChange={(event) => setTemperature(event.target.value)}
                placeholder="Enter temperature"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Heart Rate (bpm)
              </label>

              <input
                type="number"
                min="30"
                max="220"
                value={heartRate}
                onChange={(event) => setHeartRate(event.target.value)}
                placeholder="Enter heart rate"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                SpO2 (%)
              </label>

              <input
                type="number"
                min="0"
                max="100"
                value={spo2}
                onChange={(event) => setSpo2(event.target.value)}
                placeholder="Enter SpO2"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-slate-800">
            Visit Notes
          </h2>

          <p className="mb-5 text-sm text-slate-500">
            Record the reason for the visit and any important observation.
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Reason for Visit
            </label>

            <input
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Headache, injury, consultation"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Additional Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Enter additional observations or notes..."
              rows="4"
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-800">
            Automatic Results
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-5">
              <p className="text-sm text-slate-500">BMI</p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {bmi !== null ? bmi.toFixed(2) : "--"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-5">
              <p className="text-sm text-slate-500">BMI Interpretation</p>

              <p className="mt-2 text-lg font-semibold text-slate-800">
                {getBMIStatus()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate("patient-profile")}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
          >
            <Save size={18} />
            Save Assessment
          </button>
        </div>
      </main>
    </div>
  );
}

export default Assessment;
