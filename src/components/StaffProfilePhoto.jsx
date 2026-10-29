
import { useEffect, useRef, useState } from "react";
import { Camera, Trash2, UserRound, LoaderCircle } from "lucide-react";


const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://udm-health-care-api.onrender.com"
).replace(/\/+$/, "");


export default function StaffProfilePhoto({
  user,
  onProfileUpdated,
}) {
  const [photo, setPhoto] = useState(user?.profileImage || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const role = String(user?.role || "").trim().toLowerCase();
  const canUpload = ["nurse", "doctor"].includes(role);

  useEffect(() => {
    setPhoto(user?.profileImage || null);
  }, [user?.profileImage]);

  const updatePhoto = async (formData) => {
    setError("");
    setMessage("");

    const token = localStorage.getItem("udm_auth_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (!user?.id) {
      setError("Your staff account ID could not be found.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/staff/${encodeURIComponent(user.id)}/photo`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update your profile photo.",
        );
      }

      if (!result.staff) {
        throw new Error("The server did not return the updated profile.");
      }

      setPhoto(result.staff.profileImage || null);
      onProfileUpdated?.(result.staff);

      setMessage(
        result.message || "Profile photo updated successfully.",
      );
    } catch (err) {
      setError(err.message || "Unable to update your profile photo.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WEBP image.");
      setMessage("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your image must not exceed 5 MB.");
      setMessage("");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    await updatePhoto(formData);
  };

  const handleRemovePhoto = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove your profile photo?",
    );

    if (!confirmed) return;

    const formData = new FormData();
    formData.append("removeProfileImage", "true");

    await updatePhoto(formData);
  };

  if (!canUpload) {
    return null;
  }

  return (
    <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">
        My Profile Photo
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Upload or change your own profile picture.
      </p>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
        {photo ? (
          <img
            src={photo}
            alt="My profile"
            className="h-24 w-24 shrink-0 rounded-full border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-800">
            <UserRound size={42} strokeWidth={1.5} />
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
          <label
            className={`inline-flex items-center gap-2 rounded-xl bg-green-900 px-4 py-3 text-sm font-semibold text-white ${
              loading
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-green-800"
            }`}
          >
            {loading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Camera size={17} />
            )}

            {loading
              ? "Saving..."
              : photo
                ? "Change Photo"
                : "Upload Photo"}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={loading}
              onChange={handlePhotoUpload}
            />
          </label>

          {photo && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={17} />
              Remove
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Accepted formats: JPG, PNG, and WEBP. Maximum size: 5 MB.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-4 text-sm text-green-800">
          {message}
        </p>
      )}
    </section>
  );
}
