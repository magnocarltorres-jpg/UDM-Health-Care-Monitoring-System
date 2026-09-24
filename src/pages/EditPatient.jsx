import { useState } from "react";

import { ArrowLeft } from "lucide-react";

import Sidebar from "../components/Sidebar";

function EditPatient({
  user,
  currentPage,
  patient,
  onNavigate,
  onSavePatient,
  onLogout,
}) {
  const [studentNumber, setStudentNumber] = useState(
    patient?.studentNumber || "",
  );

  const [patientId, setPatientId] = useState(patient?.patientId || "");
  const [name, setName] = useState(patient?.name || "");
  const [course, setCourse] = useState(patient?.course || "");
  const [yearLevel, setYearLevel] = useState(patient?.yearLevel || "");
  const [age, setAge] = useState(patient?.age || "");
  const [sex, setSex] = useState(patient?.sex || "");
  const [address, setAddress] = useState(patient?.address || "");

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const updatedPatient = {
      studentNumber,
      patientId,
      name,
      course,
      yearLevel,
      age,
      sex,
      address,
    };

    onSavePatient(updatedPatient);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="flex-1 p-8">
        <button
          type="button"
          onClick={() => onNavigate("patient-profile")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-700"
        >
          <ArrowLeft size={18} />
          Back to Patient Profile
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Edit Patient</h1>

          <p className="mt-1 text-slate-500">
            Update the patient's information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Student Number
            </label>

            <input
              type="text"
              value={studentNumber}
              onChange={(event) => setStudentNumber(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Patient ID
            </label>

            <input
              type="text"
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Course
            </label>

            <input
              type="text"
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Year Level
            </label>

            <input
              type="text"
              value={yearLevel}
              onChange={(event) => setYearLevel(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Age
            </label>

            <input
              type="number"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sex
            </label>

            <select
              value={sex}
              onChange={(event) => setSex(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="">Select sex</option>

              <option value="Male">Male</option>

              <option value="Female">Female</option>
            </select>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Address
            </label>

            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows="3"
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => onNavigate("patient-profile")}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditPatient;
