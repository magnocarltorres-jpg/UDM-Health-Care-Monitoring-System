import { useEffect, useState } from "react";
import {
  ArrowLeft,
  UserRound,
  GraduationCap,
  MapPin,
  Save,
  ClipboardList,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

function EditPatient({
  user,
  currentPage,
  patient,
  onNavigate,
  onSavePatient,
  onLogout,
}) {
  const [studentNumber, setStudentNumber] = useState(patient?.studentNumber || "");
  const [patientId, setPatientId] = useState(patient?.patientId || "");
  const [name, setName] = useState(patient?.name || "");
  const [course, setCourse] = useState(patient?.course || "");
  const [yearLevel, setYearLevel] = useState(patient?.yearLevel || "");
  const [age, setAge] = useState(patient?.age ?? "");
  const [sex, setSex] = useState(patient?.sex || "");
  const [address, setAddress] = useState(patient?.address || "");

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  useEffect(() => {
    setStudentNumber(patient?.studentNumber || "");
    setPatientId(patient?.patientId || "");
    setName(patient?.name || "");
    setCourse(patient?.course || "");
    setYearLevel(patient?.yearLevel || "");
    setAge(patient?.age ?? "");
    setSex(patient?.sex || "");
    setAddress(patient?.address || "");
  }, [patient]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !studentNumber.trim() ||
      !patientId.trim() ||
      !name.trim() ||
      !course.trim() ||
      !yearLevel.trim() ||
      age === "" ||
      Number(age) <= 0 ||
      !sex ||
      !address.trim()
    ) {
      alert("Please complete all fields with valid information.");
      return;
    }

    onSavePatient({
      ...patient,
      studentNumber: studentNumber.trim(),
      patientId: patientId.trim(),
      name: name.trim(),
      course: course.trim(),
      yearLevel: yearLevel.trim(),
      age: Number(age),
      sex,
      address: address.trim(),
    });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100";

  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => onNavigate("patient-profile")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-green-800"
          >
            <ArrowLeft size={19} />
            Back to Patient Profile
          </button>

          <header className="mb-8 rounded-2xl bg-gradient-to-r from-green-950 via-green-800 to-green-700 p-6 text-white shadow-sm sm:p-8">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/15 p-3">
                <UserRound size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Edit Patient
                </h1>
                <p className="mt-1 text-sm text-green-100 sm:text-base">
                  Update the patient's personal and academic information.
                </p>
              </div>
            </div>
          </header>

          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <section className="border-b border-slate-100 p-5 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2.5 text-green-800">
                  <ClipboardList size={21} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">
                    Patient Identification
                  </h2>
                  <p className="text-sm text-slate-500">
                    Identification details used to find patient records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="studentNumber" className={labelClass}>
                    Student Number
                  </label>
                  <input
                    id="studentNumber"
                    type="text"
                    value={studentNumber}
                    onChange={(event) => setStudentNumber(event.target.value)}
                    placeholder="Enter student number"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="patientId" className={labelClass}>
                    Patient ID
                  </label>
                  <input
                    id="patientId"
                    type="text"
                    value={patientId}
                    onChange={(event) => setPatientId(event.target.value)}
                    placeholder="Enter patient ID"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="patientName" className={labelClass}>
                    Full Name
                  </label>
                  <input
                    id="patientName"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter full name"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="border-b border-slate-100 p-5 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2.5 text-green-800">
                  <GraduationCap size={21} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">
                    Academic Information
                  </h2>
                  <p className="text-sm text-slate-500">
                    The patient's course and year level.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="course" className={labelClass}>
                    Course
                  </label>
                  <input
                    id="course"
                    type="text"
                    value={course}
                    onChange={(event) => setCourse(event.target.value)}
                    placeholder="e.g. BSIT"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="yearLevel" className={labelClass}>
                    Year Level
                  </label>
                  <input
                    id="yearLevel"
                    type="text"
                    value={yearLevel}
                    onChange={(event) => setYearLevel(event.target.value)}
                    placeholder="e.g. 2nd Year"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="border-b border-slate-100 p-5 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2.5 text-green-800">
                  <UserRound size={21} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">
                    Personal Information
                  </h2>
                  <p className="text-sm text-slate-500">
                    Basic details and contact address.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="age" className={labelClass}>
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    placeholder="Enter age"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="sex" className={labelClass}>
                    Sex
                  </label>
                  <select
                    id="sex"
                    value={sex}
                    onChange={(event) => setSex(event.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className={labelClass}>
                    Address
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-4 text-slate-400"
                    />
                    <textarea
                      id="address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      rows={3}
                      placeholder="Enter complete address"
                      required
                      className={`${inputClass} resize-y pl-11`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 bg-slate-50 p-5 sm:flex-row sm:justify-end sm:px-8 sm:py-6">
              <button
                type="button"
                onClick={() => onNavigate("patient-profile")}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-900"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditPatient;
