import { apiFetch } from "../utils/api";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, PackagePlus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getClinicDateInputValue, getClinicDateKey } from "../utils/dateTime";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://udm-health-care-api.onrender.com"
).replace(/\/+$/, "");

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100";

const LABEL_CLASS = "mb-2 block text-sm font-semibold text-slate-700";

function MedicineInventory({ user, currentPage, onNavigate, onLogout }) {
  const [medicines, setMedicines] = useState([]);
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [movements, setMovements] = useState([]);
  const [movementsError, setMovementsError] = useState("");
  const [restockAmounts, setRestockAmounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("udm_authenticated");

    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    return {};
  }, []);

  const loadMedicines = useCallback(async () => {
    const response = await apiFetch(`${API_URL}/api/medicines`, {
      headers: authHeaders(),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to load medicine inventory.",
      );
    }

    setMedicines(
      Array.isArray(result.medicines) ? result.medicines : [],
    );
  }, [authHeaders]);

  const loadMovements = useCallback(async () => {
    const response = await apiFetch(`${API_URL}/api/medicines/movements`, {
      headers: authHeaders(),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Unable to load medicine history.");
    }

    setMovements(Array.isArray(result.movements) ? result.movements : []);
    setMovementsError("");
  }, [authHeaders]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const results = await Promise.allSettled([
          loadMedicines(),
          loadMovements(),
        ]);
        const movementResult = results[1];

        if (movementResult.status === "rejected" && !cancelled) {
          setMovementsError(
            movementResult.reason.message || "Unable to load medicine history.",
          );
        }

        if (results[0].status === "rejected") {
          throw results[0].reason;
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error.message || "Unable to load medicine inventory.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loadMedicines, loadMovements]);

  const handleAddMedicine = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    setWarningMessage("");

    try {
      const response = await apiFetch(`${API_URL}/api/medicines`, {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicineName: medicineName.trim(),
          dosage: dosage.trim(),
          batchNumber: batchNumber.trim(),
          stockQuantity: Number(stockQuantity),
          expirationDate,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to add medicine.");
      }

      if (result.medicine) {
        setMedicines((previous) =>
          [...previous, result.medicine].sort((a, b) =>
            (a.medicine_name || "").localeCompare(
              b.medicine_name || "",
            ),
          ),
        );
        await loadMovements();
      } else {
        await Promise.all([loadMedicines(), loadMovements()]);
      }

      setMedicineName("");
      setDosage("");
      setBatchNumber("");
      setStockQuantity("");
      setExpirationDate("");
      setSuccessMessage("Medicine batch added to inventory.");
      setWarningMessage(result.auditWarning || "");
    } catch (error) {
      setErrorMessage(error.message || "Unable to add medicine.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestock = async (medicineId) => {
    const quantity = Number(restockAmounts[medicineId]);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setErrorMessage(
        "Enter a positive whole-number quantity to restock.",
      );
      return;
    }

    if (saving) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    setWarningMessage("");

    try {
      const response = await apiFetch(
        `${API_URL}/api/medicines/${encodeURIComponent(medicineId)}/stock`,
        {
          method: "PUT",
          headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to restock medicine.");
      }

      await Promise.all([loadMedicines(), loadMovements()]);

      setRestockAmounts((previous) => ({
        ...previous,
        [medicineId]: "",
      }));

      setSuccessMessage("Medicine stock updated.");
      setWarningMessage(result.auditWarning || "");
    } catch (error) {
      setErrorMessage(error.message || "Unable to restock medicine.");
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

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-green-900"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <header className="mb-7">
            <h1 className="text-3xl font-bold text-slate-900">
              Medicine Inventory
            </h1>
            <p className="mt-1 text-slate-500">
              Track stock levels and expiration dates for clinic medicines.
            </p>
          </header>

          <form
            onSubmit={handleAddMedicine}
            className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="mb-5 text-lg font-bold text-slate-900">
              Add Medicine Batch
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label htmlFor="medicineName" className={LABEL_CLASS}>
                  Medicine Name
                </label>
                <input
                  id="medicineName"
                  value={medicineName}
                  onChange={(event) => setMedicineName(event.target.value)}
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="dosage" className={LABEL_CLASS}>
                  Dosage
                </label>
                <input
                  id="dosage"
                  value={dosage}
                  onChange={(event) => setDosage(event.target.value)}
                  placeholder="e.g. 500 mg"
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="batchNumber" className={LABEL_CLASS}>
                  Batch / Lot Number
                </label>
                <input
                  id="batchNumber"
                  value={batchNumber}
                  onChange={(event) => setBatchNumber(event.target.value)}
                  maxLength={100}
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="stockQuantity" className={LABEL_CLASS}>
                  Initial Stock
                </label>
                <input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  step="1"
                  value={stockQuantity}
                  onChange={(event) => setStockQuantity(event.target.value)}
                  required
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="expirationDate" className={LABEL_CLASS}>
                  Expiration Date
                </label>
                <input
                  id="expirationDate"
                  type="date"
                  value={expirationDate}
                  onChange={(event) => setExpirationDate(event.target.value)}
                  required
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-900 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
            >
              <PackagePlus size={18} />
              {saving ? "Saving..." : "Add to Inventory"}
            </button>
          </form>

          {errorMessage && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-800"
            >
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p
              role="status"
              className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800"
            >
              {successMessage}
            </p>
          )}

          {warningMessage && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
            >
              {warningMessage}
            </p>
          )}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-slate-900">Stock on Hand</h2>
            </div>

            {loading ? (
              <p className="p-6 text-sm text-slate-500">
                Loading inventory...
              </p>
            ) : medicines.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No medicine has been added to inventory.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {medicines.map((medicine) => {
                  const expiryCutoff = new Date(
                    `${getClinicDateInputValue()}T00:00:00+08:00`,
                  );
                  expiryCutoff.setDate(expiryCutoff.getDate() + 30);
                  const expired =
                    medicine.expiration_date &&
                    medicine.expiration_date <
                      getClinicDateInputValue();
                  const expiringSoon =
                    !expired &&
                    medicine.expiration_date &&
                    medicine.expiration_date <=
                      getClinicDateKey(expiryCutoff);
                  const lowStock = Number(medicine.stock_quantity) <= 10;

                  return (
                    <article
                      key={medicine.id}
                      className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {medicine.medicine_name}{" "}
                          <span className="font-medium text-slate-500">
                            ({medicine.dosage})
                          </span>
                        </h3>

                        {medicine.generic_name && (
                          <p className="mt-1 text-sm text-slate-500">
                            Generic: {medicine.generic_name}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-slate-500">
                          Code: {medicine.item_code || "--"}
                          {" · "}
                          Batch: {medicine.batch_number || "--"}
                          {" · "}
                          Stock:{" "}
                          <strong className="text-slate-800">
                            {medicine.stock_quantity}
                          </strong>
                          {" · "}
                          Expires: {medicine.expiration_date || "--"}

                          {expired && (
                            <span className="ml-2 font-semibold text-red-700">
                              Expired
                            </span>
                          )}
                          {!expired && expiringSoon && (
                            <span className="ml-2 font-semibold text-amber-700">
                              Expires within 30 days
                            </span>
                          )}
                          {lowStock && (
                            <span className="ml-2 font-semibold text-amber-700">
                              Low stock
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={restockAmounts[medicine.id] || ""}
                          onChange={(event) =>
                            setRestockAmounts((previous) => ({
                              ...previous,
                              [medicine.id]: event.target.value,
                            }))
                          }
                          aria-label={`Restock quantity for ${medicine.medicine_name}`}
                          placeholder="Qty"
                          className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleRestock(medicine.id)}
                          className="rounded-lg border border-green-200 px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-50 disabled:opacity-60"
                        >
                          Restock
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-slate-900">
                Stock & Dispensing History
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Recent receipts, restocks, and patient dispenses.
              </p>
            </div>
            {movementsError ? (
              <p role="alert" className="p-5 text-sm text-red-700">
                {movementsError}
              </p>
            ) : movements.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">
                No stock movements recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Medicine / Batch</th>
                      <th className="px-5 py-3">Movement</th>
                      <th className="px-5 py-3">Patient</th>
                      <th className="px-5 py-3">Staff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movements.map((movement) => {
                      const medicine = Array.isArray(movement.medicines)
                        ? movement.medicines[0]
                        : movement.medicines;
                      const patient = Array.isArray(movement.patients)
                        ? movement.patients[0]
                        : movement.patients;
                      const staff = Array.isArray(movement.staff_accounts)
                        ? movement.staff_accounts[0]
                        : movement.staff_accounts;

                      return (
                        <tr key={movement.id}>
                          <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                            {new Date(movement.created_at).toLocaleString(
                              "en-PH",
                              { timeZone: "Asia/Manila" },
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-700">
                            <span className="font-medium">
                              {medicine?.brand_name ||
                                medicine?.generic_name ||
                                "Medicine"}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {medicine?.batch_number || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3 capitalize text-slate-700">
                            {movement.movement_type}{" "}
                            <strong>
                              {movement.quantity_change > 0 ? "+" : ""}
                              {movement.quantity_change}
                            </strong>
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {patient?.name || "—"}
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {staff?.name || "Former staff"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default MedicineInventory;
