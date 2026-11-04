import { useState } from "react";
import { LockKeyhole } from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://udm-health-care-api.onrender.com"
).replace(/\/+$/, "");

function SetPassword({ token, onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setError("");

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmation) {
      setError("The password and confirmation do not match.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to set your password.");
      }

      onComplete();
    } catch (requestError) {
      setError(requestError.message || "Unable to set your password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-800">
          <LockKeyhole size={28} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Set Your Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Choose a password of at least 8 characters to activate your clinic account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label htmlFor="confirmation" className="mb-1 block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              id="confirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-green-900 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Set password"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default SetPassword;
