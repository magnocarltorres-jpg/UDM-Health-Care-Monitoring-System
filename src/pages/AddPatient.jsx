import { apiFetch } from "../utils/api";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://udm-health-care-api.onrender.com"
).replace(/\/+$/, "");

function AddPatient({
  user,
  currentPage,
  onNavigate,
  onAddPatient,
  onLogout,
}) {
  const [studentNumber, setStudentNumber] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [address, setAddress] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [guardianContactNumber, setGuardianContactNumber] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setCoursesLoading(true);
      setCoursesError("");

      try {
        const token = localStorage.getItem("udm_authenticated");

        if (!token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const response = await apiFetch(`${API_URL}/api/courses`, {
          headers: {},
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.message || "Unable to load course options.");
        }

        if (!cancelled) {
          setCourses(Array.isArray(result.courses) ? result.courses : []);
        }
      } catch (error) {
        if (!cancelled) {
          setCoursesError(error.message || "Unable to load course options.");
        }
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    }

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const token = localStorage.getItem("udm_authenticated");

    if (!token) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    setSaving(true);

    try {
      const response = await apiFetch(`${API_URL}/api/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
    body: JSON.stringify({
  studentNumber: studentNumber.trim(),
  name: name.trim(),
  course,
  yearLevel,
  age: age === "" ? null : Number(age),
  sex,
  address: address.trim(),
  guardianName: guardianName.trim(),
  guardianRelationship: guardianRelationship.trim(),
  guardianContactNumber: guardianContactNumber.trim(),
}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save the patient.");
      }

      onAddPatient(result.patient);
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to connect to the server.",
      );
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold text-slate-800">
            Add Patient
          </h1>

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

              <select
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                required
                disabled={coursesLoading || courses.length === 0}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {coursesLoading ? "Loading courses..." : "Select course"}
                </option>
                {courses.map((item) => (
                  <option key={item.id} value={item.course_name}>
                    {item.college_name} — {item.course_name}
                  </option>
                ))}
              </select>
              {coursesError && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {coursesError}
                </p>
              )}
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

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Age
              </label>

              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                placeholder="Enter age"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sex
              </label>

              <select
                value={sex}
                onChange={(event) => setSex(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
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
                placeholder="Enter patient's address"
                rows="3"
                required
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Guardian Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Contact details for the patient's guardian or emergency contact.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Guardian Name
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(event) => setGuardianName(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Relationship
              </label>
              <input
                type="text"
                value={guardianRelationship}
                onChange={(event) => setGuardianRelationship(event.target.value)}
                placeholder="e.g. Parent, sibling"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Guardian Contact Number
              </label>
              <input
                type="tel"
                value={guardianContactNumber}
                onChange={(event) => setGuardianContactNumber(event.target.value)}
                placeholder="e.g. 09XXXXXXXXX"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate("patients")}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || coursesLoading || courses.length === 0}
              className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Patient"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddPatient;
