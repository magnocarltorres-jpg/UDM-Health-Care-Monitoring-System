import clinicLogo from "../assets/Clinic.jpg";

function Sidebar({ currentPage, onNavigate, user, onLogout }) {
  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-green-900 p-6 text-white">
      <div className="mb-7 flex items-center gap-3">
        <img
          src={clinicLogo}
          alt="UDM Clinic Logo"
          className="h-10 w-10 rounded-full object-cover"
        />

        <h1 className="text-xl font-bold">UDM CLINIC</h1>
      </div>

      <nav className="space-y-2">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className={`w-full rounded-lg px-4 py-3 text-left ${
            currentPage === "dashboard"
              ? "bg-white text-green-900"
              : "hover:bg-green-500"
          }`}
        >
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => onNavigate("patients")}
          className={`w-full rounded-lg px-4 py-3 text-left ${
            currentPage === "patients"
              ? "bg-white text-green-900"
              : "hover:bg-green-500"
          }`}
        >
          Patients
        </button>

        <button
          type="button"
          onClick={() => onNavigate("nurses")}
          className={`w-full rounded-lg px-4 py-3 text-left ${
            currentPage === "nurses"
              ? "bg-white text-green-900"
              : "hover:bg-green-500"
          }`}
        >
          Nurses
        </button>

        <button
          type="button"
          onClick={() => onNavigate("assessment")}
          className={`w-full rounded-lg px-4 py-3 text-left ${
            currentPage === "assessment"
              ? "bg-white text-green-900"
              : "hover:bg-green-500"
          }`}
        >
          Assessment
        </button>

        <button
          type="button"
          onClick={() => onNavigate("records")}
          className={`w-full rounded-lg px-4 py-3 text-left ${
            currentPage === "records"
              ? "bg-white text-green-900"
              : "hover:bg-green-500"
          }`}
        >
          Records
        </button>
      </nav>

      <div className="mt-auto border-t border-green-700 pt-6">
        <div className="mb-5">
          <p className="text-sm text-green-200">Logged in as</p>

          <p className="font-semibold">{currentUser.name}</p>

          <p className="text-sm text-green-200">{currentUser.role}</p>
        </div>

        <h1 className="mb-3 text-sm font-semibold uppercase tracking-wider text-green-300">
          Account
        </h1>

        <button
          type="button"
          onClick={() => onNavigate("settings")}
          className={`mb-1 w-full rounded-lg px-4 py-3 text-left ${
            currentPage === "settings"
              ? "bg-white text-green-900"
              : "hover:bg-green-500"
          }`}
        >
          Settings
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg px-4 py-3 text-left hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
