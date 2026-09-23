const API_BASE_URL = "http://127.0.0.1:8000";


// =========================
// CREATE PATIENT
// =========================

export async function createPatient(patientData) {
  const response = await fetch(`${API_BASE_URL}/patients/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    throw new Error("Failed to create patient");
  }

  return await response.json();
}


// =========================
// CREATE CASE
// =========================

export async function createCase(caseData) {
  const response = await fetch(`${API_BASE_URL}/cases/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(caseData),
  });

  if (!response.ok) {
    throw new Error("Failed to create case");
  }

  return await response.json();
}


// =========================
// SUBMIT COMPLETE CASE
// =========================

export async function submitCase(newCaseData) {

  // 1. Create patient first
  const patientResponse = await createPatient({
    name: newCaseData.patientDetails.fullName,
    age: Number(newCaseData.patientDetails.age),
    gender: newCaseData.patientDetails.gender,
    phone: newCaseData.patientDetails.phone,
    email: newCaseData.patientDetails.email || null,
  });

  const patientId = patientResponse.patient.id;


  // 2. Convert frontend data into backend case format
  const caseData = {
    patient_id: patientId,

    chief_complaint: newCaseData.chiefComplaint,

    symptoms: newCaseData.symptoms
      .map((item) => {
        return `${item.symptom} (${item.severity}, ${item.duration})`;
      })
      .join(", "),

    duration: newCaseData.symptoms
      .map((item) => item.duration)
      .filter(Boolean)
      .join(", "),

    medical_history: newCaseData.medicalHistory?.illnesses || null,

    allergies: newCaseData.medicalHistory?.allergies || null,

    current_medications: newCaseData.medications
      .map((item) => {
        if (!item.name) return "";
        return `${item.name} ${item.dosage || ""} ${item.frequency || ""}`.trim();
      })
      .filter(Boolean)
      .join(", "),

    status: "pending",
  };


  // 3. Create case
  const caseResponse = await createCase(caseData);

  const createdCase = caseResponse.case;


  // 4. Return frontend-friendly response
  return {
    success: true,

    message: "Case successfully submitted for clinical review.",

    data: {
      ...newCaseData,

      id: createdCase.id,
      patientId: patientId,
      status: createdCase.status,
      backendCaseId: createdCase.id,
    },
  };
}


// =========================
// GET ALL CASES
// =========================

export async function getCases() {

  const response = await fetch(`${API_BASE_URL}/cases/`);

  if (!response.ok) {
    throw new Error("Failed to fetch cases");
  }

  const data = await response.json();

  return {
    success: true,
    data,
  };
}


// =========================
// GET SINGLE CASE
// =========================

export async function getCaseById(caseId) {

  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch case");
  }

  const data = await response.json();

  return {
    success: true,
    data,
  };
}


// =========================
// UPDATE CASE STATUS
// =========================

export async function updateCaseStatus(caseId, status) {

  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}/status`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update case status");
  }

  return await response.json();
}


// =========================
// DOCTOR REVIEW
// =========================

export async function updateCaseReview(
  caseId,
  { doctorNotes, status }
) {

  // First update case status
  const statusResponse = await updateCaseStatus(
    caseId,
    status
  );

  return {
    success: true,

    message: "Case review updated successfully.",

    data: {
      caseId,
      doctorNotes,
      status: statusResponse.status,
    },
  };
}


// =========================
// AI QUESTIONS - TEMPORARY MOCK
// =========================

export async function generateAIQuestions(
  chiefComplaint = ""
) {

  return {
    success: true,

    questions: [
      "What specific time of day or activity triggers or worsens your symptoms?",

      "Have you noticed any related sensations such as dizziness, tingling, numbness, or blurred vision?",

      "Have any remedies, rest, hot/cold compresses, or over-the-counter medications offered relief?",
    ],
  };
}