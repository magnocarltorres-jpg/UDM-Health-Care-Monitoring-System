import { useEffect, useState } from "react";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import Assessment from "./pages/Assesment";
import Records from "./pages/Records";
import AddPatient from "./pages/AddPatient";
import EditPatient from "./pages/EditPatient";
import AddNurse from "./pages/AddNurse";
import Nurses from "./pages/Nurses";
import EditNurse from "./pages/EditNurse";
import Settings from "./pages/Settings";
import StaffAccounts from "./data/StaffAccount";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedNurse, setSelectedNurse] = useState(null);

  const [clinicHistory, setClinicHistory] = useState(() => {
    const savedHistory = localStorage.getItem("udm_clinic_history");

    if (savedHistory) {
      return JSON.parse(savedHistory);
    }

    return [];
  });

  const [patients, setPatients] = useState(() => {
    const savedPatients = localStorage.getItem("udm_patients");

    if (savedPatients) {
      return JSON.parse(savedPatients);
    }

    return [
      {
        studentNumber: "2026-00123",
        patientId: "PT-0001",
        name: "Juan Dela Cruz",
        course: "BSIT",
        yearLevel: "2nd Year",
      },
    ];
  });

  const [nurses, setNurses] = useState(() => {
    const savedNurses = localStorage.getItem("udm_nurses");

    if (savedNurses) {
      return JSON.parse(savedNurses);
    }

    return StaffAccounts.filter((account) => account.role === "Nurse");
  });

  useEffect(() => {
    localStorage.setItem("udm_patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem("udm_nurses", JSON.stringify(nurses));
  }, [nurses]);

  useEffect(() => {
    localStorage.setItem("udm_clinic_history", JSON.stringify(clinicHistory));
  }, [clinicHistory]);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setShowLogin(false);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedPatient(null);
    setSelectedNurse(null);
    setShowLogin(false);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setCurrentPage("patient-profile");
  };

  const handleRecordView = (record) => {
    const patient = patients.find(
      (patient) => patient.patientId === record.patientId,
    );

    if (!patient) {
      return;
    }

    setSelectedPatient(patient);
    setCurrentPage("patient-profile");
  };

  const handleAddPatient = (newPatient) => {
    setPatients((previousPatients) => [...previousPatients, newPatient]);

    setCurrentPage("patients");
  };

  const handleAddNurse = (newNurse) => {
    setNurses((previousNurses) => [...previousNurses, newNurse]);

    setCurrentPage("nurses");
  };

  const handleEditNurse = (updatedNurse) => {
    setNurses((previousNurses) =>
      previousNurses.map((nurse) =>
        nurse.staffId === selectedNurse.staffId ? updatedNurse : nurse,
      ),
    );

    setSelectedNurse(updatedNurse);
    setCurrentPage("nurses");
  };

  const handleDeleteNurse = (nurseToDelete) => {
    setNurses((previousNurses) =>
      previousNurses.filter((nurse) => nurse.staffId !== nurseToDelete.staffId),
    );

    setCurrentPage("nurses");
  };

  const handleEditPatient = (updatedPatient) => {
    setPatients((previousPatients) =>
      previousPatients.map((patient) =>
        patient.patientId === selectedPatient.patientId
          ? updatedPatient
          : patient,
      ),
    );

    setSelectedPatient(updatedPatient);
    setCurrentPage("patient-profile");
  };

  const handleDeletePatient = () => {
    setPatients((previousPatients) =>
      previousPatients.filter(
        (patient) => patient.patientId !== selectedPatient.patientId,
      ),
    );

    setClinicHistory((previousHistory) =>
      previousHistory.filter(
        (record) => record.patientId !== selectedPatient.patientId,
      ),
    );

    setSelectedPatient(null);
    setCurrentPage("patients");
  };

  const handleSaveAssessment = (assessment) => {
    setClinicHistory((previousHistory) => [...previousHistory, assessment]);

    setCurrentPage("patient-profile");
  };

  if (!showLogin && !user) {
    return <LandingPage onLogin={() => setShowLogin(true)} />;
  }

  if (showLogin && !user) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentPage === "settings") {
    return (
      <Settings
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
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
        user={user}
        currentPage={currentPage}
        patient={selectedPatient}
        clinicHistory={clinicHistory}
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
        onNavigate={handleNavigate}
        onSelectNurse={setSelectedNurse}
        onDeleteNurse={handleDeleteNurse}
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
