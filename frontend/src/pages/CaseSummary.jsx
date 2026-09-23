import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

/**
 * CaseSummary Page
 * Displays an organized, structured clinical case dossier before final submission.
 */
export default function CaseSummary({ caseData, finishCase }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState('');

  const patient = caseData?.patientDetails || {};
  const symptoms = caseData?.symptoms || [];
  const aiQuestions = caseData?.aiQuestions || [];
  const history = caseData?.medicalHistory || {};
  const medications = caseData?.medications || [];
  const documents = caseData?.documents || [];

  const handleFinishCase = async () => {
    setIsSubmitting(true);
    try {
      const generatedId = await finishCase();
      setSubmittedCaseId(generatedId);
      setSubmissionSuccess(true);
    } catch (err) {
      console.error('Failed to submit case:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="container page-container">
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#ecfdf5',
              border: '2px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              fontSize: '2rem',
              marginBottom: '1.5rem',
            }}
          >
            ✓
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Case Successfully Registered!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Case Reference ID: <strong style={{ color: 'var(--primary)' }}>{submittedCaseId}</strong>
          </p>

          <p style={{ maxWidth: '520px', margin: '0 auto 2.5rem', color: 'var(--text-muted)' }}>
            The clinical case has been successfully filed into the queue. Clinicians can now inspect the case, review symptoms, and add clinical notes in the Doctor Dashboard.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Open Doctor Dashboard →
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
            >
              Start Another Case
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-container">
      <div className="card">
        <PageHeader
          stepNumber="Step 8 of 8"
          title="Clinical Case Summary"
          subtitle="Please review all recorded patient details before finalizing and transmitting to the physician queue."
          badge="Ready for Submission"
        />

        {/* Section 1: Demographics */}
        <div className="summary-section">
          <div className="summary-header">
            <h3 className="summary-title">
              <span>👤</span> 1. Patient Information
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/intake/patient-details')}
            >
              Edit
            </Button>
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <label>Full Name</label>
              <span>{patient.fullName || 'Not provided'}</span>
            </div>
            <div className="summary-item">
              <label>Age & Gender</label>
              <span>
                {patient.age ? `${patient.age} yrs` : '—'} • {patient.gender || '—'}
              </span>
            </div>
            <div className="summary-item">
              <label>Phone Number</label>
              <span>{patient.phone || 'Not provided'}</span>
            </div>
            <div className="summary-item">
              <label>Email</label>
              <span>{patient.email || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Chief Complaint */}
        <div className="summary-section">
          <div className="summary-header">
            <h3 className="summary-title">
              <span>💬</span> 2. Chief Complaint
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/intake/chief-complaint')}
            >
              Edit
            </Button>
          </div>
          <p
            style={{
              background: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontWeight: '500',
              lineHeight: '1.6',
            }}
          >
            {caseData?.chiefComplaint || 'No chief complaint recorded.'}
          </p>
        </div>

        {/* Section 3: Symptoms */}
        <div className="summary-section">
          <div className="summary-header">
            <h3 className="summary-title">
              <span>🩺</span> 3. Symptoms Reported
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/intake/symptoms')}
            >
              Edit
            </Button>
          </div>

          {symptoms.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {symptoms.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {s.symptom}
                    </strong>
                    {s.duration && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        (Duration: {s.duration})
                      </span>
                    )}
                  </div>
                  <span
                    className={`badge ${
                      s.severity === 'Severe'
                        ? 'badge-urgent'
                        : s.severity === 'Moderate'
                        ? 'badge-pending'
                        : 'badge-primary'
                    }`}
                  >
                    {s.severity || 'Moderate'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No symptoms listed.</p>
          )}
        </div>

        {/* Section 4: AI Clarifying Questions */}
        <div className="summary-section">
          <div className="summary-header">
            <h3 className="summary-title">
              <span>🤖</span> 4. AI Clinical Inquiry (Preview)
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/intake/ai-questions')}
            >
              Edit
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {aiQuestions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                }}
              >
                <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  Q: {q.question}
                </strong>
                <span style={{ color: q.answer ? 'var(--primary-dark)' : 'var(--text-light)', fontStyle: q.answer ? 'normal' : 'italic' }}>
                  A: {q.answer || 'Not answered'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Medical History & Allergies */}
        <div className="summary-section">
          <div className="summary-header">
            <h3 className="summary-title">
              <span>📋</span> 5. Medical History & Allergies
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/intake/medical-history')}
            >
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-3">
            <div className="summary-item">
              <label>Previous Illnesses</label>
              <span>{history.illnesses || 'None declared'}</span>
            </div>
            <div className="summary-item">
              <label>Surgeries / Procedures</label>
              <span>{history.surgeries || 'None declared'}</span>
            </div>
            <div className="summary-item">
              <label>Known Allergies</label>
              <span style={{ color: history.allergies ? '#e11d48' : 'inherit' }}>
                {history.allergies || 'No known drug allergies (NKDA)'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 6: Medications */}
        <div className="summary-section">
          <div className="summary-header">
            <h3 className="summary-title">
              <span>💊</span> 6. Current Medications
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/intake/medications')}
            >
              Edit
            </Button>
          </div>

          {medications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {medications.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.6rem 1rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                  }}
                >
                  <strong>{m.name || 'Unnamed'}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {m.dosage ? `Dose: ${m.dosage}` : ''} {m.frequency ? `• ${m.frequency}` : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No medications listed.</p>
          )}
        </div>

        {/* Section 7: Documents */}
        <div className="summary-section">
          <div className="summary-header">
            <h3 className="summary-title">
              <span>📂</span> 7. Attached Documents ({documents.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/intake/documents')}
            >
              Edit
            </Button>
          </div>

          {documents.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {documents.map((d, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.5rem 0.85rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                  }}
                >
                  📄 {d.name} ({d.size})
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No documents attached.</p>
          )}
        </div>

        {/* Final Actions */}
        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/intake/documents')}
          >
            ← Back to Documents
          </Button>

          <Button
            type="button"
            variant="success"
            size="lg"
            onClick={handleFinishCase}
            disabled={isSubmitting}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          >
            {isSubmitting ? 'Finalizing Case...' : 'Finish Case & Submit to Doctor'}
          </Button>
        </div>
      </div>
    </div>
  );
}
