import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';

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

// API Service
import {
  submitCase,
  updateCaseReview,
  uploadDocument,
} from './services/api';

import { initialMockCases } from './data/mockData';

import './App.css';


// =====================================================
// INITIAL EMPTY CASE TEMPLATE
// =====================================================

const emptyCaseTemplate = {
  patientDetails: {
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
  },

  chiefComplaint: '',

  symptoms: [
    {
      symptom: '',
      duration: '',
      severity: 'Moderate',
    },
  ],

  aiQuestions: [
    {
      id: 'q1',
      question:
        'What specific time of day or activity triggers or worsens your symptoms?',
      answer: '',
    },
    {
      id: 'q2',
      question:
        'Have you noticed any related sensations (such as dizziness, tingling, numbness, or blurred vision)?',
      answer: '',
    },
    {
      id: 'q3',
      question:
        'Have any remedies, rest, hot/cold compresses, or over-the-counter medications offered relief?',
      answer: '',
    },
  ],

  medicalHistory: {
    illnesses: '',
    surgeries: '',
    allergies: '',
  },

  medications: [
    {
      name: '',
      dosage: '',
      frequency: '',
    },
  ],

  documents: [],
};


// =====================================================
// APP CONTENT
// =====================================================

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

  // ===================================================
  // PROGRESS BAR
  // ===================================================

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

      {showProgressBar && (
        <ProgressBar currentStep={stepNumber} />
      )}

      <main className="main-content">

        <Routes>

          {/* =================================================
              WELCOME
          ================================================= */}

          <Route
            path="/"
            element={<Welcome />}
          />


          {/* =================================================
              PATIENT DETAILS
          ================================================= */}

          <Route
            path="/intake/patient-details"
            element={
              <PatientDetails
                caseData={currentCase}
                updatePatientDetails={updatePatientDetails}
              />
            }
          />


          {/* =================================================
              CHIEF COMPLAINT
          ================================================= */}

          <Route
            path="/intake/chief-complaint"
            element={
              <ChiefComplaint
                caseData={currentCase}
                updateChiefComplaint={updateChiefComplaint}
              />
            }
          />


          {/* =================================================
              SYMPTOMS
          ================================================= */}

          <Route
            path="/intake/symptoms"
            element={
              <Symptoms
                caseData={currentCase}
                updateSymptoms={updateSymptoms}
              />
            }
          />


          {/* =================================================
              AI QUESTIONS
          ================================================= */}

          <Route
            path="/intake/ai-questions"
            element={
              <AIQuestions
                caseData={currentCase}
                updateAIQuestions={updateAIQuestions}
              />
            }
          />


          {/* =================================================
              MEDICAL HISTORY
          ================================================= */}

          <Route
            path="/intake/medical-history"
            element={
              <MedicalHistory
                caseData={currentCase}
                updateMedicalHistory={updateMedicalHistory}
              />
            }
          />


          {/* =================================================
              MEDICATIONS
          ================================================= */}

          <Route
            path="/intake/medications"
            element={
              <Medications
                caseData={currentCase}
                updateMedications={updateMedications}
              />
            }
          />


          {/* =================================================
              DOCUMENTS
          ================================================= */}

          <Route
            path="/intake/documents"
            element={
              <Documents
                caseData={currentCase}
                updateDocuments={updateDocuments}
              />
            }
          />


          {/* =================================================
              CASE SUMMARY
          ================================================= */}

          <Route
            path="/intake/case-summary"
            element={
              <CaseSummary
                caseData={currentCase}
                finishCase={finishCase}
              />
            }
          />


          {/* =================================================
              DOCTOR DASHBOARD
          ================================================= */}

          <Route
            path="/dashboard"
            element={
              <DoctorDashboard
                cases={cases}
              />
            }
          />


          {/* =================================================
              DOCTOR REVIEW
          ================================================= */}

          <Route
            path="/review/:caseId"
            element={
              <DoctorReview
                cases={cases}
                updateCaseNotes={updateDoctorNotes}
              />
            }
          />


          {/* =================================================
              FALLBACK
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </main>
    </div>
  );
}


// =====================================================
// MAIN APP
// =====================================================

export default function App() {

  // Existing frontend cases
  const [cases, setCases] = useState(
    initialMockCases
  );

  // Current patient intake
  const [currentCase, setCurrentCase] = useState(
    emptyCaseTemplate
  );


  // ===================================================
  // UPDATE PATIENT DETAILS
  // ===================================================

  const updatePatientDetails = (details) => {
    setCurrentCase((prev) => ({
      ...prev,
      patientDetails: details,
    }));
  };


  // ===================================================
  // UPDATE CHIEF COMPLAINT
  // ===================================================

  const updateChiefComplaint = (complaint) => {
    setCurrentCase((prev) => ({
      ...prev,
      chiefComplaint: complaint,
    }));
  };


  // ===================================================
  // UPDATE SYMPTOMS
  // ===================================================

  const updateSymptoms = (symptoms) => {
    setCurrentCase((prev) => ({
      ...prev,
      symptoms,
    }));
  };


  // ===================================================
  // UPDATE AI QUESTIONS
  // ===================================================

  const updateAIQuestions = (aiQuestions) => {
    setCurrentCase((prev) => ({
      ...prev,
      aiQuestions,
    }));
  };


  // ===================================================
  // UPDATE MEDICAL HISTORY
  // ===================================================

  const updateMedicalHistory = (medicalHistory) => {
    setCurrentCase((prev) => ({
      ...prev,
      medicalHistory,
    }));
  };


  // ===================================================
  // UPDATE MEDICATIONS
  // ===================================================

  const updateMedications = (medications) => {
    setCurrentCase((prev) => ({
      ...prev,
      medications,
    }));
  };


  // ===================================================
  // UPDATE DOCUMENTS
  // ===================================================

  const updateDocuments = (documents) => {
    setCurrentCase((prev) => ({
      ...prev,
      documents,
    }));
  };


  // ===================================================
  // FINISH CASE
  // ===================================================

  const handleFinishCase = async () => {

    try {

      console.log(
        'Submitting patient and case...'
      );


      // -------------------------------------------------
      // 1. CREATE PATIENT + CASE
      // -------------------------------------------------

      const result = await submitCase(
        currentCase
      );

      const newCase = result.data;


      // -------------------------------------------------
      // 2. GET REAL BACKEND CASE ID
      // -------------------------------------------------

      const caseId =
        newCase.backendCaseId;


      console.log(
        'Backend case created:',
        caseId
      );


      // -------------------------------------------------
      // 3. UPLOAD DOCUMENTS
      // -------------------------------------------------

      if (
        currentCase.documents &&
        currentCase.documents.length > 0
      ) {

        console.log(
          `Uploading ${currentCase.documents.length} document(s)...`
        );


        for (
          const document
          of currentCase.documents
        ) {

          // Make sure actual File object exists
          if (!document.file) {

            console.warn(
              'Skipping document because File object is missing:',
              document.name
            );

            continue;
          }


          console.log(
            'Uploading:',
            document.name
          );


          await uploadDocument(
            caseId,
            document.file,
            document.type
          );


          console.log(
            'Uploaded successfully:',
            document.name
          );
        }
      }


      // -------------------------------------------------
      // 4. ADD CASE TO FRONTEND STATE
      // -------------------------------------------------

      setCases((prev) => [
        newCase,
        ...prev,
      ]);


      // -------------------------------------------------
      // 5. RESET INTAKE FORM
      // -------------------------------------------------

      setCurrentCase(
        emptyCaseTemplate
      );


      console.log(
        'Case submission completed successfully.'
      );


      // Return ID to CaseSummary
      return newCase.id;

    } catch (error) {

      console.error(
        'Failed to submit case:',
        error
      );


      alert(
        'There was an error submitting the case. Please try again.'
      );


      return null;
    }
  };


  // ===================================================
  // UPDATE DOCTOR REVIEW
  // ===================================================

  const handleUpdateDoctorNotes = async (
    caseId,
    doctorNotes,
    status
  ) => {

    try {

      await updateCaseReview(
        caseId,
        {
          doctorNotes,
          status,
        }
      );


      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? {
                ...c,
                doctorNotes,
                status,
              }
            : c
        )
      );

    } catch (error) {

      console.error(
        'Failed to update doctor review:',
        error
      );

      alert(
        'Failed to update doctor review.'
      );
    }
  };


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <BrowserRouter>

      <AppContent
        currentCase={currentCase}
        cases={cases}

        updatePatientDetails={
          updatePatientDetails
        }

        updateChiefComplaint={
          updateChiefComplaint
        }

        updateSymptoms={
          updateSymptoms
        }

        updateAIQuestions={
          updateAIQuestions
        }

        updateMedicalHistory={
          updateMedicalHistory
        }

        updateMedications={
          updateMedications
        }

        updateDocuments={
          updateDocuments
        }

        finishCase={
          handleFinishCase
        }

        updateDoctorNotes={
          handleUpdateDoctorNotes
        }
      />

    </BrowserRouter>
  );
}