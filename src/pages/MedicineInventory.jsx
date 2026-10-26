import { useEffect, useState } from "react";
import { ArrowLeft, PackagePlus } from "lucide-react";
import Sidebar from "../components/Sidebar";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://udm-health-care-api.onrender.com"
).replace(/\/+$/, "");

function MedicineInventory({
  user,
  currentPage,
  onNavigate,
  onLogout,
}) {
  const [medicines, setMedicines] = useState([]);
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [restockAmounts, setRestockAmounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const authHeaders = () => {
    const token = localStorage.getItem("udm_auth_token");
    if (!token) throw new Error("Your session has expired. Please log in again.");
    return { Authorization: `Bearer ${token}` };
  };

  const loadMedicines = async () => {
    const response = await fetch(`${API_URL}/api/medicines`, {
      headers: authHeaders(),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.message || "Unable to load medicine inventory.");
    }
    setMedicines(Array.isArray(result.medicines) ? result.medicines : []);
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${API_URL}/api/medicines`, {
          headers: authHeaders(),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.message || "Unable to load medicine inventory.");
        }
        if (!cancelled) {
          setMedicines(Array.isArray(result.medicines) ? result.medicines : []);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || "Unable to load medicine inventory.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddMedicine = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/api/medicines`, {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicineName: medicineName.trim(),
          dosage: dosage.trim(),
          stockQuantity: Number(stockQuantity),
          expirationDate,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Unable to add medicine.");
      }

      setMedicines((previous) =>
        [...previous, result.medicine].sort((a, b) =>
          a.medicine_name.localeCompare(b.medicine_name),
        ),
      );
      setMedicineName("");
      setDosage("");
      setStockQuantity("");
      setExpirationDate("");
      setSuccessMessage("Medicine batch added to inventory.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to add medicine.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestock = async (medicineId) => {
    const quantity = Number(restockAmounts[medicineId]);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setErrorMessage("Enter a positive whole-number quantity to restock.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
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

      await loadMedicines();
      setRestockAmounts((previous) => ({ ...previous, [medicineId]: "" }));
      setSuccessMessage("Medicine stock updated.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to restock medicine.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="medicineName" className={labelClass}>
                  Medicine Name
                </label>
                <input
                  id="medicineName"
                  value={medicineName}
                  onChange={(event) => setMedicineName(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="dosage" className={labelClass}>
                  Dosage
                </label>
                <input
                  id="dosage"
                  value={dosage}
                  onChange={(event) => setDosage(event.target.value)}
                  placeholder="e.g. 500 mg"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="stockQuantity" className={labelClass}>
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
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="expirationDate" className={labelClass}>
                  Expiration Date
                </label>
                <input
                  id="expirationDate"
                  type="date"
                  value={expirationDate}
                  onChange={(event) => setExpirationDate(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-900 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
            >
              <PackagePlus size={18} />
              Add to Inventory
            </button>
          </form>

          {errorMessage && (
            <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p role="status" className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
              {successMessage}
            </p>
          )}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-slate-900">Stock on Hand</h2>
            </div>
            {loading ? (
              <p className="p-6 text-sm text-slate-500">Loading inventory...</p>
            ) : medicines.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No medicine has been added to inventory.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {medicines.map((medicine) => {
                  const expired =
                    medicine.expiration_date <
                    new Date().toISOString().slice(0, 10);
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
                        <p className="mt-1 text-sm text-slate-500">
                          Stock:{" "}
                          <strong className="text-slate-800">
                            {medicine.stock_quantity}
                          </strong>
                          {" · "}Expires: {medicine.expiration_date}
                          {expired && (
                            <span className="ml-2 font-semibold text-red-700">
                              Expired
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
        </div>
      </main>
    </div>
  );
}

export default MedicineInventory;
