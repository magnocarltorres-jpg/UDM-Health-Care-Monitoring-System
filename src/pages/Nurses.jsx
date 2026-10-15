import { useMemo, useState } from "react";
import {
  Search,
  User,
  X,
  Eye,
  Users,
  UserCheck,
  UserX,
  Filter,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

function Nurses({
  user,
  currentPage,
  nurses = [],
  onNavigate,
  onLogout,
  nursesLoading = false,
  nursesError = "",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedNurse, setSelectedNurse] = useState(null);

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const getStatus = (nurse) => nurse.status || "Unknown";

  const statusOptions = useMemo(() => {
    const statuses = nurses
      .map((nurse) => getStatus(nurse))
      .filter(Boolean);

    return ["All", ...new Set(statuses)];
  }, [nurses]);

  const filteredNurses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return nurses.filter((nurse) => {
      const matchesSearch =
        (nurse.name || "").toLowerCase().includes(query) ||
        (nurse.staffId || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || getStatus(nurse) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [nurses, searchQuery, statusFilter]);

  const activeCount = nurses.filter(
    (nurse) => getStatus(nurse).toLowerCase() === "active",
  ).length;

  const inactiveCount = nurses.filter(
    (nurse) => getStatus(nurse).toLowerCase() === "inactive",
  ).length;

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "active":
      case "available":
        return "bg-green-100 text-green-700";

      case "inactive":
      case "unavailable":
        return "bg-red-100 text-red-700";

      case "on leave":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const closeProfile = () => setSelectedNurse(null);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Nurses Directory
          </h1>

          <p className="mt-2 text-slate-500">
            View clinic nurse accounts, profiles, and account statuses.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Nurses
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {nurses.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Accounts
                </p>

                <p className="mt-2 text-3xl font-bold text-green-700">
                  {activeCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <UserCheck size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inactive Accounts
                </p>

                <p className="mt-2 text-3xl font-bold text-red-700">
                  {inactiveCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <UserX size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search nurse name or Staff ID..."
                aria-label="Search nurses"
                className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter nurses by status"
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All statuses" : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Clinic Nurses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredNurses.length} of {nurses.length} nurse
              {nurses.length !== 1 ? "s" : ""}
            </p>
          </div>

          {(searchQuery || statusFilter !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {nursesLoading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
              Loading nurse accounts...
            </div>
          ) : nursesError ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <h3 className="font-semibold text-red-600">
                Unable to load nurses
              </h3>

              <p className="mt-2 max-w-lg text-sm text-slate-500">
                {nursesError}
              </p>
            </div>
          ) : filteredNurses.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <User size={26} />
              </div>

              <h3 className="font-semibold text-slate-800">
                {nurses.length === 0
                  ? "No nurse accounts available"
                  : "No nurses found"}
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {nurses.length === 0
                  ? "Nurse accounts will appear here when available."
                  : "Try another name, Staff ID, or account status."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Nurse
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Account Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Assisting Patient
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                      Profile
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredNurses.map((nurse) => (
                    <tr
                      key={nurse.id || nurse.staffId || nurse.name}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 text-green-700">
                            {nurse.profileImage ? (
                              <img
                                src={nurse.profileImage}
                                alt={`${nurse.name || "Nurse"} profile`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User size={21} />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {nurse.name || "Unnamed Nurse"}
                            </p>

                            <p className="text-sm text-slate-500">
                              {nurse.staffId || "No Staff ID"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(getStatus(nurse))}`}
                        >
                          {getStatus(nurse)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {nurse.assistingPatient || "No patient assigned"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedNurse(nurse)}
                          className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                          aria-label={`View profile of ${nurse.name || "nurse"}`}
                        >
                          <Eye size={16} />
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selectedNurse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProfile();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="nurse-profile-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2
                id="nurse-profile-title"
                className="text-xl font-bold text-slate-800"
              >
                Nurse Profile
              </h2>

              <button
                type="button"
                onClick={closeProfile}
                aria-label="Close nurse profile"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-green-100 text-green-700">
                  {selectedNurse.profileImage ? (
                    <img
                      src={selectedNurse.profileImage}
                      alt={`${selectedNurse.name || "Nurse"} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={42} />
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-800">
                  {selectedNurse.name || "Unnamed Nurse"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedNurse.staffId || "No Staff ID"}
                </p>

                <span
                  className={`mt-3 rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(getStatus(selectedNurse))}`}
                >
                  {getStatus(selectedNurse)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Full Name
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {selectedNurse.name || "Not available"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Staff ID
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {selectedNurse.staffId || "Not available"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Role
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {selectedNurse.role || "Nurse"}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Account Status
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {getStatus(selectedNurse)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Assisting Patient
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {selectedNurse.assistingPatient || "No patient assigned"}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-slate-400">
                Read-only profile. Account changes are managed by authorized
                administrators.
              </p>

              <button
                type="button"
                onClick={closeProfile}
                className="mt-5 w-full rounded-lg bg-green-700 px-4 py-3 font-medium text-white hover:bg-green-800"
              >
                Close Profile
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Nurses;
