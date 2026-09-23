/**
 * MediCase API Client (Placeholder / Mock Service)
 *
 * This file serves as a structured placeholder for future backend API integrations
 * (e.g. Express, Node.js, FastAPI, or Django with PostgreSQL/MongoDB).
 * Currently resolves promises using client-side simulated delays.
 */

import { initialMockCases } from '../data/mockData';

// In-memory cases store for active session
let sessionCases = [...initialMockCases];

/**
 * Fetch all patient cases for the Doctor Dashboard
 */
export async function getCases() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: sessionCases,
      });
    }, 200);
  });
}

/**
 * Fetch a single case by its Unique ID
 */
export async function getCaseById(caseId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const found = sessionCases.find((c) => c.id === caseId);
      if (found) {
        resolve({
          success: true,
          data: found,
        });
      } else {
        reject(new Error(`Case with ID ${caseId} not found.`));
      }
    }, 150);
  });
}

/**
 * Submit a newly completed patient case intake
 */
export async function submitCase(newCaseData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const createdCase = {
        ...newCaseData,
        id: newCaseData.id || `MC-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        status: newCaseData.status || 'Pending Review',
      };

      // Add to front of session list
      sessionCases = [createdCase, ...sessionCases];

      resolve({
        success: true,
        message: 'Case successfully submitted for clinical review.',
        data: createdCase,
      });
    }, 300);
  });
}

/**
 * Update doctor clinical review notes and status
 */
export async function updateCaseReview(caseId, { doctorNotes, status }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = sessionCases.findIndex((c) => c.id === caseId);
      if (index !== -1) {
        sessionCases[index] = {
          ...sessionCases[index],
          doctorNotes: doctorNotes ?? sessionCases[index].doctorNotes,
          status: status ?? sessionCases[index].status,
        };
        resolve({
          success: true,
          message: 'Case review updated successfully.',
          data: sessionCases[index],
        });
      } else {
        reject(new Error(`Case with ID ${caseId} not found.`));
      }
    }, 200);
  });
}

/**
 * Future AI Question Generator Hook (Mocked)
 */
export async function generateAIQuestions(chiefComplaint = '') {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        questions: [
          'What specific time of day or activity triggers or worsens your symptoms?',
          'Have you noticed any related sensory sensations (e.g. dizziness, tingling, numbness, or vision changes)?',
          'Have any over-the-counter remedies, rest, or heat/ice packs provided temporary relief?',
        ],
      });
    }, 250);
  });
}
