import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, User, X } from "lucide-react";
import Sidebar from "../components/Sidebar";

function AddNurse({
  user,
  currentPage,
  onNavigate,
  onAddNurse,
  onLogout,
}) {
  const [staffId, setStaffId] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The profile image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setError("");
    setProfileImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!staffId.trim() || !name.trim()) {
      setError("Please enter the Staff ID and Full Name.");
      return;
    }

    if (typeof onAddNurse !== "function") {
      setError("The nurse creation handler is not configured.");
      return;
    }

    setSubmitting(true);

    try {
      await onAddNurse({
        staffId: staffId.trim(),
        name: name.trim(),
        role: "Nurse",
        profileImageFile: profileImage,
        status: "Active",
      });
    } catch (submitError) {
      setError(
        submitError?.message || "Unable to add the nurse. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() => onNavigate("nurses")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-700"
        >
          <ArrowLeft size={19} />
          Back to Nurses
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Add Nurse
          </h1>

          <p className="mt-1 text-slate-500">
            Add a nurse profile to the UDM clinic.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Nurse Profile Picture
            </label>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-green-50 text-green-700">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Nurse profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={38} />
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <ImagePlus size={18} />
                  Choose Photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>

                {profileImage && (
                  <button
                    type="button"
                    onClick={() => setProfileImage(null)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <X size={17} />
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              JPG, PNG, or WEBP. Maximum file size: 5 MB.
            </p>
          </div>

          <div>
            <label
              htmlFor="staffId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Staff ID
            </label>

            <input
              id="staffId"
              type="text"
              value={staffId}
              onChange={(event) => setStaffId(event.target.value)}
              placeholder="Enter Staff ID"
              autoComplete="off"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="nurseName"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>

            <input
              id="nurseName"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter Full Name"
              autoComplete="name"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => onNavigate("nurses")}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Add Nurse"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddNurse;
