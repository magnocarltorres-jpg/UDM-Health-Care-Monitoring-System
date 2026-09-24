import { useState } from "react";
import Sidebar from "../components/Sidebar";

function AddPatient({ user, currentPage, onNavigate, onAddPatient, onLogout }) {
  const [studentNumber, setStudentNumber] = useState("");
  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const newPatient = {
      studentNumber,
      patientId,
      name,
      course,
      yearLevel,
      age,
      sex,
      address,
    };

    onAddPatient(newPatient);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Add Patient</h1>

          <p className="mt-1 text-slate-500">
            Register a new patient in the UDM clinic system.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Student Number
              </label>

              <input
                type="text"
                value={studentNumber}
                onChange={(event) => setStudentNumber(event.target.value)}
                placeholder="e.g. 2026-00124"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Patient ID
              </label>

              <input
                type="text"
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                placeholder="e.g. PT-0002"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter patient's full name"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course
              </label>

              <input
                type="text"
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                placeholder="e.g. BSIT"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Year Level
              </label>

              <select
                value={yearLevel}
                onChange={(event) => setYearLevel(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Select year level</option>

                <option value="1st Year">1st Year</option>

                <option value="2nd Year">2nd Year</option>

                <option value="3rd Year">3rd Year</option>

                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Age
          </label>

          <input
            type="number"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder="Enter age"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Sex
            </label>

            <select
              value={sex}
              onChange={(event) => setSex(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="">Select Sex</option>

              <option value="Male">Male</option>

              <option value="Female">Female</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Address
            </label>

            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter patient's Address"
              rows="3"
              required
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate("patients")}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
            >
              Save Patient
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddPatient;
