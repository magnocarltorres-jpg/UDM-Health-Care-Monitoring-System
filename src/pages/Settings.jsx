import {
  ArrowLeft,
  User,
  ShieldCheck,
  LockKeyhole,
  Settings as SettingsIcon,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import StaffProfilePhoto from "../components/StaffProfilePhoto";

function Settings({
  user,
  currentPage,
  onNavigate,
  onLogout,
  onProfileUpdated,
}) {
  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
    staffId: "--",
    profileImage: null,
  };

  const accountDetails = [
    {
      label: "Staff ID",
      value: currentUser.staffId || "--",
      icon: BadgeCheck,
    },
    {
      label: "Full Name",
      value: currentUser.name || "--",
      icon: User,
    },
    {
      label: "Role",
      value: currentUser.role || "--",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-slate-50 lg:flex-row">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-6xl">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-500 transition hover:bg-green-50 hover:text-green-800"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <header className="mb-7 overflow-hidden rounded-2xl bg-gradient-to-br from-green-950 via-green-900 to-green-800 p-5 text-white shadow-lg sm:p-8">
            <div className="flex items-start gap-4 sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 sm:h-14 sm:w-14">
                <SettingsIcon size={26} />
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-200">
                  UDM Clinic
                </p>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Settings
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100 sm:text-base">
                  View your staff account information, update your profile
                  picture, and review your account security.
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800">
                    <User size={21} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Account Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Information associated with your clinic staff account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-7 p-5 sm:p-7">
                <div className="flex flex-col gap-5 rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-white p-5 sm:flex-row sm:items-center sm:p-6">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-green-100 text-green-800 shadow-sm sm:h-24 sm:w-24">
                    {currentUser.profileImage ? (
                      <img
                        src={currentUser.profileImage}
                        alt={`${currentUser.name}'s profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={38} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                        {currentUser.name || "Clinic Staff"}
                      </h3>

                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                        <BadgeCheck size={13} />
                        {currentUser.status || "Active"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {currentUser.role || "Staff"}
                    </p>

                    <p className="mt-1 break-all text-sm text-slate-500">
                      Staff ID: {currentUser.staffId || "--"}
                    </p>
                  </div>
                </div>

                <div>
                  <StaffProfilePhoto
                    user={currentUser}
                    onProfileUpdated={onProfileUpdated}
                  />
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                    Staff Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {accountDetails.map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-green-200 hover:bg-green-50/40"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            {label}
                          </p>

                          <p className="mt-1 break-words font-semibold text-slate-800">
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-green-200 hover:bg-green-50/40">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-800">
                        <ShieldCheck size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Account Status
                        </p>

                        <p className="mt-1 font-semibold text-green-800">
                          {currentUser.status || "Active"}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Your current staff account status.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-6">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800">
                      <LockKeyhole size={21} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Security
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Account protection
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <ShieldCheck
                      size={20}
                      className="mt-0.5 shrink-0 text-green-700"
                    />

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Authorized staff access
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your account is intended for authorized UDM clinic
                        personnel.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-800">
                      Password
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Password changes are handled through the system's
                      password management workflow.
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <LockKeyhole size={15} />
                      Keep your login credentials private.
                    </div>
                  </div>

                  <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <p className="text-sm font-semibold text-green-900">
                      Protect patient information
                    </p>

                    <p className="mt-1 text-xs leading-5 text-green-800">
                      Always log out when leaving a shared clinic computer.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-slate-900">
                  Quick Navigation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Return to your main workspace.
                </p>

                <button
                  type="button"
                  onClick={() => onNavigate("dashboard")}
                  className="mt-4 flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-800"
                >
                  Dashboard
                  <ChevronRight size={18} />
                </button>
              </section>
            </div>
          </div>

          <footer className="mt-8 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
            UDM Health Care Monitoring System · Staff Settings
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Settings;