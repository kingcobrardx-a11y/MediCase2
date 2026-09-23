import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProgressBar from './components/ProgressBar';

// Page Imports
import Welcome from './pages/Welcome';
import PatientDetails from './pages/PatientDetails';
import ChiefComplaint from './pages/ChiefComplaint';
import Symptoms from './pages/Symptoms';
import AIQuestions from './pages/AIQuestions';
import MedicalHistory from './pages/MedicalHistory';
import Medications from './pages/Medications';
import Documents from './pages/Documents';
import CaseSummary from './pages/CaseSummary';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorReview from './pages/DoctorReview';

// Mock Data & API Service
import { initialMockCases } from './data/mockData';
import { submitCase, updateCaseReview } from './services/api';

import './App.css';

/**
 * Initial empty template for a new patient case intake
 */
const emptyCaseTemplate = {
  patientDetails: {
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
  },
  chiefComplaint: '',
  symptoms: [{ symptom: '', duration: '', severity: 'Moderate' }],
  aiQuestions: [
    { id: 'q1', question: 'What specific time of day or activity triggers or worsens your symptoms?', answer: '' },
    { id: 'q2', question: 'Have you noticed any related sensations (such as dizziness, tingling, numbness, or blurred vision)?', answer: '' },
    { id: 'q3', question: 'Have any remedies, rest, hot/cold compresses, or over-the-counter medications offered relief?', answer: '' },
  ],
  medicalHistory: {
    illnesses: '',
    surgeries: '',
    allergies: '',
  },
  medications: [{ name: '', dosage: '', frequency: '' }],
  documents: [],
};

/**
 * AppContent Wrapper to handle route-based ProgressBar display
 */
function AppContent({
  currentCase,
  cases,
  updatePatientDetails,
  updateChiefComplaint,
  updateSymptoms,
  updateAIQuestions,
  updateMedicalHistory,
  updateMedications,
  updateDocuments,
  finishCase,
  updateDoctorNotes,
}) {
  const location = useLocation();

  // Determine current intake step number for the ProgressBar
  const getStepNumber = (pathname) => {
    switch (pathname) {
      case '/intake/patient-details':
        return 1;
      case '/intake/chief-complaint':
        return 2;
      case '/intake/symptoms':
        return 3;
      case '/intake/ai-questions':
        return 4;
      case '/intake/medical-history':
        return 5;
      case '/intake/medications':
        return 6;
      case '/intake/documents':
        return 7;
      case '/intake/case-summary':
        return 8;
      default:
        return 0;
    }
  };

  const stepNumber = getStepNumber(location.pathname);
  const showProgressBar = stepNumber > 0;

  return (
    <div className="app-wrapper">
      <Navbar />

      {showProgressBar && <ProgressBar currentStep={stepNumber} />}

      <main className="main-content">
        <Routes>
          {/* Welcome Page */}
          <Route path="/" element={<Welcome />} />

          {/* Intake Workflow Pages */}
          <Route
            path="/intake/patient-details"
            element={
              <PatientDetails
                caseData={currentCase}
                updatePatientDetails={updatePatientDetails}
              />
            }
          />
          <Route
            path="/intake/chief-complaint"
            element={
              <ChiefComplaint
                caseData={currentCase}
                updateChiefComplaint={updateChiefComplaint}
              />
            }
          />
          <Route
            path="/intake/symptoms"
            element={
              <Symptoms
                caseData={currentCase}
                updateSymptoms={updateSymptoms}
              />
            }
          />
          <Route
            path="/intake/ai-questions"
            element={
              <AIQuestions
                caseData={currentCase}
                updateAIQuestions={updateAIQuestions}
              />
            }
          />
          <Route
            path="/intake/medical-history"
            element={
              <MedicalHistory
                caseData={currentCase}
                updateMedicalHistory={updateMedicalHistory}
              />
            }
          />
          <Route
            path="/intake/medications"
            element={
              <Medications
                caseData={currentCase}
                updateMedications={updateMedications}
              />
            }
          />
          <Route
            path="/intake/documents"
            element={
              <Documents
                caseData={currentCase}
                updateDocuments={updateDocuments}
              />
            }
          />
          <Route
            path="/intake/case-summary"
            element={
              <CaseSummary
                caseData={currentCase}
                finishCase={finishCase}
              />
            }
          />

          {/* Doctor Portal Pages */}
          <Route
            path="/dashboard"
            element={<DoctorDashboard cases={cases} />}
          />
          <Route
            path="/review/:caseId"
            element={
              <DoctorReview
                cases={cases}
                updateCaseNotes={updateDoctorNotes}
              />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * Top-level App Component managing central application state
 */
export default function App() {
  // All patient cases in memory (pre-loaded with realistic mock cases)
  const [cases, setCases] = useState(initialMockCases);

  // Active intake draft state
  const [currentCase, setCurrentCase] = useState(emptyCaseTemplate);

  // State updater handlers
  const updatePatientDetails = (details) => {
    setCurrentCase((prev) => ({ ...prev, patientDetails: details }));
  };

  const updateChiefComplaint = (complaint) => {
    setCurrentCase((prev) => ({ ...prev, chiefComplaint: complaint }));
  };

  const updateSymptoms = (symptoms) => {
    setCurrentCase((prev) => ({ ...prev, symptoms }));
  };

  const updateAIQuestions = (aiQuestions) => {
    setCurrentCase((prev) => ({ ...prev, aiQuestions }));
  };

  const updateMedicalHistory = (medicalHistory) => {
    setCurrentCase((prev) => ({ ...prev, medicalHistory }));
  };

  const updateMedications = (medications) => {
    setCurrentCase((prev) => ({ ...prev, medications }));
  };

  const updateDocuments = (documents) => {
    setCurrentCase((prev) => ({ ...prev, documents }));
  };

  // Complete and submit the active case to the doctor queue
  const handleFinishCase = async () => {
    const result = await submitCase(currentCase);
    const newCase = result.data;

    // Prepend to cases list
    setCases((prev) => [newCase, ...prev]);

    // Reset current case draft
    setCurrentCase(emptyCaseTemplate);

    return newCase.id;
  };

  // Update physician clinical notes & status
  const handleUpdateDoctorNotes = async (caseId, doctorNotes, status) => {
    await updateCaseReview(caseId, { doctorNotes, status });
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, doctorNotes, status } : c
      )
    );
  };

  return (
    <BrowserRouter>
      <AppContent
        currentCase={currentCase}
        cases={cases}
        updatePatientDetails={updatePatientDetails}
        updateChiefComplaint={updateChiefComplaint}
        updateSymptoms={updateSymptoms}
        updateAIQuestions={updateAIQuestions}
        updateMedicalHistory={updateMedicalHistory}
        updateMedications={updateMedications}
        updateDocuments={updateDocuments}
        finishCase={handleFinishCase}
        updateDoctorNotes={handleUpdateDoctorNotes}
      />
    </BrowserRouter>
  );
}
