import { apiFetch } from "./utils/api";
import { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import Assessment from "./pages/Assesment";
import Records from "./pages/Records";
import AssessmentDetails from "./pages/AssessmentDetails";
import AddPatient from "./pages/AddPatient";
import EditPatient from "./pages/EditPatient";
import AddNurse from "./pages/AddNurse";
import Nurses from "./pages/Nurses";
import EditNurse from "./pages/EditNurse";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import ChangePassword from "./pages/ChangePassword";
import MedicineInventory from "./pages/MedicineInventory";
import Reports from "./pages/Reports";


const API_URL = (
  import.meta.env.VITE_API_URL || "https://udm-health-care-api.onrender.com"
).replace(/\/+$/, "");

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      result.message || `Request failed with status ${response.status}.`,
    );

    error.status = response.status;
    error.code = result.code;

    throw error;
  }

  return result;
}

function getAuthHeaders() {
  return {};
}

function getUserRole(user) {
  return String(user?.role || "").trim().toLowerCase();
}

function isAdministrator(user) {
  return ["admin", "administrator"].includes(getUserRole(user));
}

function isClinicStaff(user) {
  return ["nurse", "doctor"].includes(getUserRole(user));
}

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState("");

  const [nurses, setNurses] = useState([]);
  const [nursesLoading, setNursesLoading] = useState(false);
  const [nursesError, setNursesError] = useState("");

  const [clinicHistory, setClinicHistory] = useState([]);

  useEffect(() => {
    localStorage.removeItem("udm_auth_token");
    localStorage.removeItem("udm_clinic_history");

    let cancelled = false;

    async function restoreSession() {
      try {
        const response = await apiFetch(`${API_URL}/api/auth/me`, {
          cache: "no-store",
        });
        const result = await response.json().catch(() => ({}));

        if (cancelled) return;

        if (!response.ok || !result.user) {
          localStorage.removeItem("udm_authenticated");
          return;
        }

        localStorage.setItem("udm_authenticated", "true");
        setUser(result.user);
        setMustChangePassword(result.user.mustChangePassword === true);
        setCurrentPage(
          isAdministrator(result.user) ? "admin-panel" : "dashboard",
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Session restoration failed:", error);
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    apiFetch(`${API_URL}/api/auth/logout`, { method: "POST" }).catch(
      (error) => console.error("Server logout failed:", error),
    );
    localStorage.removeItem("udm_auth_token");
    localStorage.removeItem("udm_authenticated");

    setUser(null);
    setSelectedPatient(null);
    setSelectedNurse(null);
    setSelectedAssessment(null);

    setPatients([]);
    setNurses([]);
    setClinicHistory([]);

    setPatientsError("");
    setNursesError("");

    setPatientsLoading(false);
    setNursesLoading(false);

    setShowLogin(false);
    setCurrentPage("dashboard");
    setMustChangePassword(false);
  };

  const handleProfileUpdated = (updatedStaff) => {
    if (!updatedStaff?.id) return;

    setUser((currentUser) =>
      currentUser &&
      String(currentUser.id) === String(updatedStaff.id)
        ? { ...currentUser, ...updatedStaff }
        : currentUser,
    );

    setNurses((previousNurses) =>
      previousNurses.map((nurse) =>
        String(nurse.id) === String(updatedStaff.id)
          ? { ...nurse, ...updatedStaff }
          : nurse,
      ),
    );

    setSelectedNurse((currentNurse) =>
      currentNurse &&
      String(currentNurse.id) === String(updatedStaff.id)
        ? { ...currentNurse, ...updatedStaff }
        : currentNurse,
    );
  };

  useEffect(() => {
    if (!user) return undefined;

    let checking = false;
    let cancelled = false;
    let loggingOut = false;

    const checkAccountStatus = async () => {
      if (checking || cancelled || loggingOut) return;

      const authenticated = localStorage.getItem("udm_authenticated");

      if (!authenticated) {
        loggingOut = true;
        handleLogout();
        return;
      }

      checking = true;

      try {
        const response = await apiFetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        });

        const result = await response.json().catch(() => ({}));

        if (cancelled) return;

        if (
          response.status === 401 ||
          response.status === 403 ||
          result.code === "ACCOUNT_DEACTIVATED" ||
          result.code === "INVALID_SESSION"
        ) {
          loggingOut = true;
          handleLogout();
          return;
        }

        if (!response.ok) {
          console.error(
            "Unable to verify account status:",
            result.message || response.status,
          )
          return;
        }

        const accountStatus = String(result.user?.status ?? "")
          .trim()
          .toLowerCase();

        if (accountStatus !== "active") {
          loggingOut = true;
          handleLogout();
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Account status check failed:", error);
        }
      } finally {
        checking = false;
      }
    };

    checkAccountStatus();

    const handleWindowFocus = () => {
      checkAccountStatus();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [user]);

  useEffect(() => {
    if (!user || !isClinicStaff(user) || mustChangePassword) {
      setPatients([]);
      setPatientsError("");
      setPatientsLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadPatients() {
      setPatientsLoading(true);
      setPatientsError("");

      try {
        const response = await apiFetch(`${API_URL}/api/patients`, {
          headers: getAuthHeaders(),
        });

        const result = await readResponse(response);

        if (!cancelled) {
          setPatients(
            Array.isArray(result.patients) ? result.patients : [],
          );
        }
      } catch (error) {
        if (!cancelled) {
          setPatientsError(error.message || "Unable to load patients.");

          if (error.status === 401 || error.status === 403) {
            handleLogout();
          }
        }
      } finally {
        if (!cancelled) {
          setPatientsLoading(false);
        }
      }
    }

    loadPatients();

    return () => {
      cancelled = true;
    };
  }, [user, mustChangePassword]);

  useEffect(() => {
    if (!user || !isClinicStaff(user) || mustChangePassword) {
      return undefined;
    }

    let cancelled = false;

    async function loadClinicHistory() {
      try {
        const response = await apiFetch(`${API_URL}/api/assessments`, {
          headers: getAuthHeaders(),
        });
        const result = await readResponse(response);

        if (!cancelled) {
          setClinicHistory(
            Array.isArray(result.assessments) ? result.assessments : [],
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Unable to load clinic activity:", error);
          setClinicHistory([]);
        }
      }
    }

    loadClinicHistory();

    return () => {
      cancelled = true;
    };
  }, [user, mustChangePassword]);

  useEffect(() => {
    if (!user || !isClinicStaff(user) || mustChangePassword) {
      setNurses([]);
      setNursesError("");
      setNursesLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadNurses() {
      setNursesLoading(true);
      setNursesError("");

      try {
        const response = await apiFetch(`${API_URL}/api/nurses`, {
          headers: getAuthHeaders(),
        });

        const result = await readResponse(response);

        if (!cancelled) {
          setNurses(
            Array.isArray(result.nurses) ? result.nurses : [],
          );
        }
      } catch (error) {
        if (!cancelled) {
          setNursesError(error.message || "Unable to load nurses.");

          if (error.status === 401 || error.status === 403) {
            handleLogout();
          }
        }
      } finally {
        if (!cancelled) {
          setNursesLoading(false);
        }
      }
    }

    loadNurses();

    return () => {
      cancelled = true;
    };
  }, [user, mustChangePassword, currentPage]);

  const handleLogin = (loggedInUser, forcePasswordChange = false) => {
    setUser(loggedInUser);
    setClinicHistory([]);

    setMustChangePassword(
      Boolean(forcePasswordChange || loggedInUser?.mustChangePassword),
    );

    setShowLogin(false);
    setSelectedPatient(null);
    setSelectedNurse(null);
    setSelectedAssessment(null);

    setCurrentPage(
      isAdministrator(loggedInUser) ? "admin-panel" : "dashboard",
    );
  };

  const handleNavigate = (page) => {
    if (isAdministrator(user)) {
      setCurrentPage(page === "reports" ? "reports" : "admin-panel");
      return;
    }

    if (page === "admin-panel") {
      setCurrentPage("dashboard");
      return;
    }

    setCurrentPage(page);
  };

  const handlePatientSelect = (patient) => {
    if (!patient) return;

    setSelectedPatient(patient);
    setCurrentPage("patient-profile");
  };

  const handleRecordView = (record) => {
    if (!record) return;

    setSelectedAssessment(record);
    setCurrentPage("assessment-details");
  };

  const handleAddPatient = (newPatient) => {
    if (!newPatient) return;

    setPatients((previousPatients) => [
      newPatient,
      ...previousPatients.filter(
        (patient) => patient.id !== newPatient.id,
      ),
    ]);

    setCurrentPage("patients");
  };

  const handleAddNurse = (newNurse) => {
    if (!newNurse) return;

    setNurses((previousNurses) => [
      newNurse,
      ...previousNurses.filter(
        (nurse) =>
          nurse.id !== newNurse.id &&
          nurse.staffId !== newNurse.staffId,
      ),
    ]);

    setCurrentPage("nurses");
  };

  const handleEditNurse = async (
    updatedNurse,
    profileFile = null,
    removeProfileImage = false,
  ) => {
    if (!updatedNurse?.id) {
      throw new Error("A valid staff record is required.");
    }

    if (!profileFile && !removeProfileImage) {
      throw new Error("Choose a photo or remove the current photo.");
    }

    const formData = new FormData();

    if (profileFile) {
      formData.append("profileImage", profileFile);
    }

    if (removeProfileImage) {
      formData.append("removeProfileImage", "true");
    }

    const response = await apiFetch(
      `${API_URL}/api/staff/${encodeURIComponent(updatedNurse.id)}/photo`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      },
    );

    const result = await readResponse(response);
    const savedStaff = result.staff;

    if (!savedStaff) {
      throw new Error(
        "The server did not return the updated staff profile.",
      );
    }

    handleProfileUpdated(savedStaff);

    setSelectedNurse((currentNurse) =>
      currentNurse &&
      String(currentNurse.id) === String(savedStaff.id)
        ? { ...currentNurse, ...savedStaff }
        : currentNurse,
    );

    setCurrentPage("nurses");

    return savedStaff;
  };

  const handleDeleteNurse = (nurseToDelete) => {
    if (!nurseToDelete) return;

    setNurses((previousNurses) =>
      previousNurses.filter(
        (nurse) =>
          nurse.id !== nurseToDelete.id &&
          nurse.staffId !== nurseToDelete.staffId,
      ),
    );

    setSelectedNurse(null);
    setCurrentPage("nurses");
  };

  const handleEditPatient = async (updatedPatient) => {
    try {
      if (!selectedPatient?.id) {
        throw new Error("No patient record is selected.");
      }

      const response = await apiFetch(
        `${API_URL}/api/patients/${selectedPatient.id}`,
        {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPatient),
        },
      );

      const result = await readResponse(response);

      if (!result.patient) {
        throw new Error(
          "The server did not return the updated patient.",
        );
      }

      setPatients((previousPatients) =>
        previousPatients.map((patient) =>
          patient.id === result.patient.id
            ? result.patient
            : patient,
        ),
      );

      setSelectedPatient(result.patient);
      setCurrentPage("patient-profile");
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleLogout();
        return;
      }

      window.alert(error.message || "Unable to update patient.");
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedPatient.name}?`,
    );

    if (!confirmed) return;

    try {
      const response = await apiFetch(
        `${API_URL}/api/patients/${selectedPatient.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      await readResponse(response);

      setPatients((previousPatients) =>
        previousPatients.filter(
          (patient) => patient.id !== selectedPatient.id,
        ),
      );

      setClinicHistory((previousHistory) =>
        previousHistory.filter(
          (record) =>
            record.patientId !== selectedPatient.patientId &&
            record.patient_id !== selectedPatient.id,
        ),
      );

      setSelectedPatient(null);
      setCurrentPage("patients");

      window.alert("Patient deleted successfully.");
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        handleLogout();
        return;
      }

      window.alert(error.message || "Unable to delete patient.");
    }
  };

  const handleSaveAssessment = (assessment) => {
    if (!assessment) return;

    setClinicHistory((previousHistory) => [
      assessment,
      ...previousHistory.filter(
        (record) => record.id !== assessment.id,
      ),
    ]);

    setCurrentPage("patient-profile");
  };

  if (!showLogin && !user) {
    return <LandingPage onLogin={() => setShowLogin(true)} />;
  }

  if (showLogin && !user) {
    return <Login onLogin={handleLogin} />;
  }

  if (mustChangePassword && user) {
    return (
      <ChangePassword
        user={user}
        onLogout={handleLogout}
        onPasswordChanged={() => {
          setMustChangePassword(false);
          setCurrentPage(
            isAdministrator(user) ? "admin-panel" : "dashboard",
          );
        }}
      />
    );
  }

  if (isAdministrator(user) && currentPage === "reports") {
    return (
      <Reports
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    );
  }

  if (isAdministrator(user)) {
    return (
      <AdminPanel
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentPage === "admin-panel") {
    return (
      <Dashboard
        user={user}
        currentPage="dashboard"
        clinicHistory={clinicHistory}
        patients={patients}
        onNavigate={handleNavigate}
        onPatientSelect={handlePatientSelect}
        onLogout={handleLogout}
      />
    );
  }

if (currentPage === "settings") {
  return (
    <Settings
      user={user}
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onProfileUpdated={handleProfileUpdated}
    />
  );
}
  if (currentPage === "add-patient") {
    return (
      <AddPatient
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAddPatient={handleAddPatient}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "patients") {
    return (
      <Patients
        user={user}
        currentPage={currentPage}
        patients={patients}
        patientsLoading={patientsLoading}
        patientsError={patientsError}
        onNavigate={handleNavigate}
        onPatientSelect={handlePatientSelect}
        onAddPatient={() => handleNavigate("add-patient")}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "patient-profile") {
    return (
      <PatientProfile
        key={selectedPatient?.id}
        user={user}
        currentPage={currentPage}
        patient={selectedPatient}
        onNavigate={handleNavigate}
        onDeletePatient={handleDeletePatient}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "edit-patient") {
    return (
      <EditPatient
        user={user}
        currentPage={currentPage}
        patient={selectedPatient}
        onNavigate={handleNavigate}
        onSavePatient={handleEditPatient}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "add-nurse") {
    return (
      <AddNurse
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAddNurse={handleAddNurse}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "edit-nurse") {
    return (
      <EditNurse
        user={user}
        currentPage={currentPage}
        nurse={selectedNurse}
        onNavigate={handleNavigate}
        onSaveNurse={handleEditNurse}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "nurses") {
    return (
      <Nurses
        user={user}
        currentPage={currentPage}
        nurses={nurses}
        nursesLoading={nursesLoading}
        nursesError={nursesError}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "assessment") {
    return (
      <Assessment
        user={user}
        currentPage={currentPage}
        patient={selectedPatient}
        onNavigate={handleNavigate}
        onSaveAssessment={handleSaveAssessment}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "assessment-details") {
    return (
      <AssessmentDetails
        user={user}
        currentPage={currentPage}
        record={selectedAssessment}
        onNavigate={handleNavigate}
        onBack={() => setCurrentPage("records")}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "records") {
    return (
      <Records
        user={user}
        currentPage={currentPage}
        clinicHistory={clinicHistory}
        onNavigate={handleNavigate}
        onViewRecord={handleRecordView}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "medicine-inventory") {
    return (
      <MedicineInventory
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === "reports") {
    return (
      <Reports
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      currentPage={currentPage}
      clinicHistory={clinicHistory}
      patients={patients}
      onNavigate={handleNavigate}
      onPatientSelect={handlePatientSelect}
      onLogout={handleLogout}
    />
  );
}

export default App;