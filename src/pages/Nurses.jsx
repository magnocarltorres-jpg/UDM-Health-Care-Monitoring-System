import { useState } from "react";

import { Search, UserPlus, MoreVertical, User } from "lucide-react";

import Sidebar from "../components/Sidebar";

function Nurses({
  user,
  currentPage,
  nurses,
  onNavigate,
  onSelectNurse,
  onDeleteNurse,
  onLogout,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const nurseList = nurses || [];

  const filteredNurses = nurseList.filter((nurse) => {
    const query = searchQuery.toLowerCase().trim();

    return (
      nurse.name?.toLowerCase().includes(query) ||
      nurse.staffId?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Nurses</h1>

            <p className="mt-1 text-slate-500">
              Manage UDM clinic nurses and their assigned patients.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("add-nurse")}
            className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
          >
            <UserPlus size={19} />
            Add Nurse
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
              className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Clinic Nurses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredNurses.length} Nurse
              {filteredNurses.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {filteredNurses.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <User size={26} />
              </div>

              <h3 className="font-semibold text-slate-800">
                {searchQuery.trim() ? "No nurses found" : "No nurses yet"}
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                {searchQuery.trim()
                  ? "Try searching using the nurse's name or Staff ID."
                  : "Add a nurse to start managing clinic nursing staff."}
              </p>

              {!searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => onNavigate("add-nurse")}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
                >
                  <UserPlus size={17} />
                  Add Nurse
                </button>
              )}
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
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Assisting Patient
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredNurses.map((nurse) => (
                    <tr key={nurse.staffId} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-green-100 text-green-700">
                            {nurse.profileImage ? (
                              <img
                                src={nurse.profileImage}
                                alt={nurse.name}
                                className="h-11 w-11 object-cover"
                              />
                            ) : (
                              <User size={21} />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {nurse.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              {nurse.staffId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          {nurse.status || "Available"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {nurse.assistingPatient || "No patient assigned"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === nurse.staffId
                                  ? null
                                  : nurse.staffId,
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreVertical size={20} />
                          </button>

                          {openMenu === nurse.staffId && (
                            <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectNurse(nurse);
                                  onNavigate("edit-nurse");
                                  setOpenMenu(null);
                                }}
                                className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                Edit Nurse
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    `Are you sure you want to delete ${nurse.name}?`,
                                  );

                                  if (confirmed) {
                                    onDeleteNurse(nurse);
                                    setOpenMenu(null);
                                  }
                                }}
                                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete Nurse
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Nurses;
