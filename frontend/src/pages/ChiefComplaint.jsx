import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import InputField from '../components/InputField';
import Button from '../components/Button';

/**
 * ChiefComplaint Page
 * Captures the primary reason for the patient's current visit in their own words.
 */
export default function ChiefComplaint({ caseData, updateChiefComplaint }) {
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(caseData?.chiefComplaint || '');
  const [error, setError] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    if (!complaint.trim()) {
      setError('Please describe the primary reason for consultation.');
      return;
    }

    updateChiefComplaint(complaint);
    navigate('/intake/symptoms');
  };

  return (
    <div className="container page-container">
      <div className="card">
        <PageHeader
          stepNumber="Step 2 of 8"
          title="Chief Complaint"
          subtitle="Describe the primary health concern or reason for consulting the doctor today."
        />

        <form onSubmit={handleContinue}>
          <InputField
            label="What is your main complaint or symptom?"
            name="chiefComplaint"
            type="textarea"
            rows={5}
            placeholder="Describe your symptoms in detail (e.g. 'I have been experiencing a sharp throbbing pain in my upper right abdomen for the past three days that radiates to my shoulder...')"
            value={complaint}
            onChange={(e) => {
              setComplaint(e.target.value);
              if (error) setError('');
            }}
            required
            error={error}
            hint="Include when the issue started, how often it occurs, and what makes it feel better or worse."
          />

          {/* Clinical Tip Box */}
          <div className="info-banner" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
            <span className="info-banner-icon">💡</span>
            <div>
              <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '0.2rem' }}>
                Tip for clinical clarity:
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Mention specific anatomical locations, whether pain is sharp, dull, or burning, and if anything specific triggers the problem.
              </p>
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                updateChiefComplaint(complaint);
                navigate('/intake/patient-details');
              }}
            >
              ← Back to Patient Details
            </Button>

            <Button type="submit" variant="primary">
              Continue to Symptoms →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
