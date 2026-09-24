import { ArrowLeft, User } from "lucide-react";

import Sidebar from "../components/Sidebar";

function Settings({ user, currentPage, onNavigate, onLogout }) {
  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
    staffId: "--",
    profileImage: null,
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
          onClick={() => onNavigate("dashboard")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-700"
        >
          <ArrowLeft size={19} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Settings</h1>

          <p className="mt-1 text-slate-500">
            Manage your clinic staff account information.
          </p>
        </div>

        <div className="max-w-3xl space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Information associated with your clinic account.
            </p>

            <div className="mt-6 flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-green-100 text-green-700">
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt={currentUser.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={34} />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {currentUser.name}
                </h3>

                <p className="text-sm text-slate-500">{currentUser.role}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Staff ID</p>

                <p className="mt-1 font-medium text-slate-800">
                  {currentUser.staffId || "--"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Full Name</p>

                <p className="mt-1 font-medium text-slate-800">
                  {currentUser.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Role</p>

                <p className="mt-1 font-medium text-slate-800">
                  {currentUser.role}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Account Status</p>

                <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Security</h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your account security settings.
            </p>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-medium text-slate-700">Password</p>

              <p className="mt-1 text-sm text-slate-500">
                Password management will be available when the system is
                connected to a database.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Settings;
