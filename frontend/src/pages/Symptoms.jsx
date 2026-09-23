import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import InputField from '../components/InputField';
import Button from '../components/Button';

/**
 * Symptoms Page
 * Allows recording one or multiple symptoms along with duration and severity grade.
 */
export default function Symptoms({ caseData, updateSymptoms }) {
  const navigate = useNavigate();

  // Initial symptoms list from state or a blank default entry
  const [symptoms, setSymptoms] = useState(
    caseData?.symptoms?.length > 0
      ? caseData.symptoms
      : [{ symptom: '', duration: '', severity: 'Moderate' }]
  );

  const [error, setError] = useState('');

  const handleSymptomChange = (index, field, value) => {
    const updated = [...symptoms];
    updated[index][field] = value;
    setSymptoms(updated);
    if (error) setError('');
  };

  const handleAddSymptom = () => {
    setSymptoms((prev) => [
      ...prev,
      { symptom: '', duration: '', severity: 'Moderate' },
    ]);
  };

  const handleRemoveSymptom = (index) => {
    if (symptoms.length === 1) {
      // Reset first row instead of deleting last row
      setSymptoms([{ symptom: '', duration: '', severity: 'Moderate' }]);
      return;
    }
    setSymptoms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = (e) => {
    e.preventDefault();

    // Validate that at least one symptom has a description
    const hasValidSymptom = symptoms.some((s) => s.symptom.trim().length > 0);
    if (!hasValidSymptom) {
      setError('Please list at least one symptom you are experiencing.');
      return;
    }

    // Filter out completely blank rows
    const cleanedSymptoms = symptoms.filter((s) => s.symptom.trim().length > 0);
    updateSymptoms(cleanedSymptoms);
    navigate('/intake/ai-questions');
  };

  return (
    <div className="container page-container">
      <div className="card">
        <PageHeader
          stepNumber="Step 3 of 8"
          title="Associated Symptoms"
          subtitle="List your active symptoms, how long you have had them, and their severity level."
        />

        <form onSubmit={handleContinue}>
          {error && (
            <div className="info-banner info-banner-warning" style={{ marginBottom: '1.25rem' }}>
              <span className="info-banner-icon">⚠️</span>
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--status-pending-text)' }}>
                  Action needed:
                </strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--status-pending-text)' }}>{error}</p>
              </div>
            </div>
          )}

          <div className="dynamic-row-list">
            {symptoms.map((item, index) => (
              <div key={index} className="dynamic-row-card">
                <div>
                  <InputField
                    label={`Symptom #${index + 1}`}
                    placeholder="e.g. Headache, Nausea, Fever, Joint Pain"
                    value={item.symptom}
                    onChange={(e) => handleSymptomChange(index, 'symptom', e.target.value)}
                    required={index === 0}
                  />
                </div>

                <div>
                  <InputField
                    label="Duration"
                    placeholder="e.g. 3 days, 2 weeks"
                    value={item.duration}
                    onChange={(e) => handleSymptomChange(index, 'duration', e.target.value)}
                  />
                </div>

                <div>
                  <InputField
                    label="Severity"
                    type="select"
                    value={item.severity}
                    onChange={(e) => handleSymptomChange(index, 'severity', e.target.value)}
                    options={[
                      { value: 'Mild', label: 'Mild (Noticeable)' },
                      { value: 'Moderate', label: 'Moderate (Impairs daily tasks)' },
                      { value: 'Severe', label: 'Severe (Incapacitating)' },
                    ]}
                  />
                </div>

                <div style={{ paddingTop: '1.5rem' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveSymptom(index)}
                    title="Remove this symptom"
                    style={{ borderColor: '#fecdd3', color: '#e11d48' }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddSymptom}
            icon={<span>＋</span>}
            style={{ marginBottom: '1rem' }}
          >
            Add Another Symptom
          </Button>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                updateSymptoms(symptoms);
                navigate('/intake/chief-complaint');
              }}
            >
              ← Back to Chief Complaint
            </Button>

            <Button type="submit" variant="primary">
              Continue to AI Follow-up →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
