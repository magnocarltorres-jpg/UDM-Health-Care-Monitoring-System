import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import Sidebar from "../components/Sidebar";

function AddNurse({ user, currentPage, onNavigate, onAddNurse, onLogout }) {
  const [staffId, setStaffId] = useState("");
  const [name, setName] = useState("");

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!staffId.trim() || !name.trim()) {
      alert("Please enter the Staff ID and Full Name.");
      return;
    }

    const newNurse = {
      staffId: staffId.trim(),
      name: name.trim(),
      role: "Nurse",
      password: "123456",
      profileImage: null,
      status: "Available",
      assistingPatient: null,
    };

    onAddNurse(newNurse);
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
          onClick={() => onNavigate("nurses")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-700"
        >
          <ArrowLeft size={19} />
          Back to Nurses
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Add Nurse</h1>

          <p className="mt-1 text-slate-500">
            Add a new nurse to the UDM clinic.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Staff ID
            </label>

            <input
              type="text"
              value={staffId}
              onChange={(event) => setStaffId(event.target.value)}
              placeholder="Enter Staff ID"
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
              placeholder="Enter Full Name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => onNavigate("nurses")}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
            >
              Add Nurse
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddNurse;
