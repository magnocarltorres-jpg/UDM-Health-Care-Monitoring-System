
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, UserRound, Upload, X } from "lucide-react";
import Sidebar from "../components/Sidebar";

function EditNurse({
  user,
  currentPage,
  nurse,
  onNavigate,
  onSaveNurse,
  onLogout,
}) {
  const [staffId, setStaffId] = useState(nurse?.staffId || "");
  const [name, setName] = useState(nurse?.name || "");
  const [profileImage, setProfileImage] = useState(
    nurse?.profileImage || null,
  );
  const [profileFile, setProfileFile] = useState(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const currentUser = user || {
    name: "Clinic Staff",
    role: "Staff",
  };

  const role = String(currentUser.role || "").trim().toLowerCase();
  const isAdministrator = ["admin", "administrator"].includes(role);
  const isOwnNurseProfile =
    role === "nurse" &&
    String(currentUser.id ?? "") === String(nurse?.id ?? "");

  const canEditProfile = isAdministrator || isOwnNurseProfile;
  const canEditDetails = isAdministrator;

  useEffect(() => {
    setStaffId(nurse?.staffId || "");
    setName(nurse?.name || "");
    setProfileImage(nurse?.profileImage || null);
    setProfileFile(null);
    setRemoveProfileImage(false);
    setSaveError("");
  }, [nurse]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setSaveError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Please choose an image no larger than 5 MB.");
      return;
    }

    setSaveError("");
    setProfileFile(file);
    setRemoveProfileImage(false);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
      }
    };

    reader.onerror = () => {
      setProfileFile(null);
      setSaveError("Unable to read this image. Please try another file.");
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    setProfileFile(null);
    setRemoveProfileImage(true);
    setSaveError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveError("");

    if (!nurse?.id) {
      setSaveError("The nurse record could not be identified.");
      return;
    }

    if (canEditDetails && (!staffId.trim() || !name.trim())) {
      setSaveError("Please enter the Staff ID and Full Name.");
      return;
    }

    if (!canEditProfile) {
      setSaveError("You are not authorized to edit this nurse profile.");
      return;
    }

    if (
      !canEditDetails &&
      !profileFile &&
      !removeProfileImage
    ) {
      setSaveError("Choose a new photo or remove the current photo first.");
      return;
    }

    const updatedNurse = {
      ...nurse,
      staffId: staffId.trim(),
      name: name.trim(),
      profileImage,
    };

    try {
      setIsSaving(true);

      await onSaveNurse(
        updatedNurse,
        profileFile,
        removeProfileImage,
      );
    } catch (error) {
      setSaveError(
        error?.message || "Unable to save the nurse profile.",
      );
    } finally {
      setIsSaving(false);
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
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => onNavigate("nurses")}
            className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-green-800"
          >
            <ArrowLeft size={19} />
            Back to Nurses
          </button>

          <header className="mb-8 rounded-2xl bg-gradient-to-r from-green-950 via-green-800 to-green-700 p-6 text-white shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-3">
                <UserRound size={27} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Edit Nurse Profile
                </h1>
                <p className="mt-1 text-sm text-green-100 sm:text-base">
                  Update the nurse's details and profile picture.
                </p>
              </div>
            </div>
          </header>

          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 p-5 sm:p-8">
              <h2 className="text-lg font-bold text-slate-800">
                Profile Picture
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose a photo to identify this nurse.
              </p>

              <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-green-100 bg-green-50 shadow-sm">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={`${name || "Nurse"} profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound
                        size={54}
                        className="text-green-800"
                      />
                    )}
                  </div>

                  {canEditProfile && (
                    <div className="absolute bottom-1 right-1 rounded-full bg-green-800 p-2 text-white shadow">
                      <Camera size={17} />
                    </div>
                  )}
                </div>

                <div className="w-full flex-1 text-center sm:text-left">
                  <p className="font-semibold text-slate-800">
                    {name || "Nurse Name"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {staffId || "Staff ID"}
                  </p>

                  {canEditProfile && (
                    <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-green-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-900">
                        <Upload size={17} />
                        Upload Photo
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={isSaving}
                        />
                      </label>

                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={17} />
                          Remove Photo
                        </button>
                      )}
                    </div>
                  )}

                  <p className="mt-3 text-xs text-slate-400">
                    JPG, PNG, or WEBP. Maximum file size: 5 MB.
                  </p>

                  {!canEditDetails && isOwnNurseProfile && (
                    <p className="mt-2 text-xs text-slate-500">
                      You can update your own profile picture. Contact your
                      Administrator to change your Staff ID or name.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-8">
              <h2 className="text-lg font-bold text-slate-800">
                Nurse Information
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="staffId"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Staff ID
                  </label>
                  <input
                    id="staffId"
                    type="text"
                    value={staffId}
                    onChange={(event) => setStaffId(event.target.value)}
                    placeholder="Enter Staff ID"
                    required={canEditDetails}
                    readOnly={!canEditDetails}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 read-only:cursor-not-allowed read-only:bg-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nurseName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="nurseName"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter Full Name"
                    required={canEditDetails}
                    readOnly={!canEditDetails}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 read-only:cursor-not-allowed read-only:bg-slate-100"
                  />
                </div>
              </div>

              {saveError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {saveError}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={() => onNavigate("nurses")}
                disabled={isSaving}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canEditProfile || isSaving}
                className="rounded-xl bg-green-800 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditNurse;
