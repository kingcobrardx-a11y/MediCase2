import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ProgressBar Component
 * Visual step indicator for the 8-stage case-taking wizard.
 */
export default function ProgressBar({ currentStep = 1 }) {
  const navigate = useNavigate();

  const steps = [
    { number: 1, label: 'Patient Details', path: '/intake/patient-details' },
    { number: 2, label: 'Chief Complaint', path: '/intake/chief-complaint' },
    { number: 3, label: 'Symptoms', path: '/intake/symptoms' },
    { number: 4, label: 'AI Questions', path: '/intake/ai-questions' },
    { number: 5, label: 'Medical History', path: '/intake/medical-history' },
    { number: 6, label: 'Medications', path: '/intake/medications' },
    { number: 7, label: 'Documents', path: '/intake/documents' },
    { number: 8, label: 'Case Summary', path: '/intake/case-summary' },
  ];

  return (
    <div className="progress-container">
      <div className="container">
        <ol className="progress-steps">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isActive = step.number === currentStep;

            return (
              <li key={step.number}>
                <button
                  type="button"
                  onClick={() => {
                    // Allow navigating to any step up to current or previous
                    if (step.number <= currentStep) {
                      navigate(step.path);
                    }
                  }}
                  className={`progress-step-item ${isActive ? 'active' : ''} ${
                    isCompleted ? 'completed' : ''
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div className="step-circle">
                    {isCompleted ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="step-label">{step.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
