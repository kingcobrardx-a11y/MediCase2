import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import InputField from '../components/InputField';
import Button from '../components/Button';

/**
 * MedicalHistory Page
 * Captures past illnesses, previous surgeries, and known allergies.
 */
export default function MedicalHistory({ caseData, updateMedicalHistory }) {
  const navigate = useNavigate();

  const [history, setHistory] = useState({
    illnesses: caseData?.medicalHistory?.illnesses || '',
    surgeries: caseData?.medicalHistory?.surgeries || '',
    allergies: caseData?.medicalHistory?.allergies || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHistory((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickAddCondition = (condition) => {
    setHistory((prev) => {
      const current = prev.illnesses.trim();
      if (!current) return { ...prev, illnesses: condition };
      if (current.includes(condition)) return prev;
      return { ...prev, illnesses: `${current}, ${condition}` };
    });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    updateMedicalHistory(history);
    navigate('/intake/medications');
  };

  const commonConditions = [
    'Hypertension',
    'Type 2 Diabetes',
    'Asthma',
    'Migraine',
    'Thyroid Disorder',
    'High Cholesterol',
    'None',
  ];

  return (
    <div className="container page-container">
      <div className="card">
        <PageHeader
          stepNumber="Step 5 of 8"
          title="Medical & Surgical History"
          subtitle="Document past medical conditions, prior surgeries, and known substance or drug allergies."
        />

        <form onSubmit={handleContinue}>
          {/* Quick Add Common Conditions */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.4rem' }}>
              Quick Add Common Conditions:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {commonConditions.map((cond) => (
                <button
                  type="button"
                  key={cond}
                  onClick={() => handleQuickAddCondition(cond)}
                  className="badge badge-primary"
                  style={{ cursor: 'pointer', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                  + {cond}
                </button>
              ))}
            </div>
          </div>

          <InputField
            label="Previous or Existing Illnesses"
            name="illnesses"
            type="textarea"
            rows={3}
            placeholder="List any chronic medical conditions, major past illnesses, or state 'None'..."
            value={history.illnesses}
            onChange={handleChange}
            hint="e.g. Hypertension diagnosed in 2021, childhood asthma, seasonal rhinitis."
          />

          <InputField
            label="Previous Surgeries or Major Hospitalizations"
            name="surgeries"
            type="textarea"
            rows={2}
            placeholder="List past surgical procedures and approximate year, or 'None'..."
            value={history.surgeries}
            onChange={handleChange}
            hint="e.g. Appendectomy (2018), Knee Arthroscopy (2020)."
          />

          <InputField
            label="Known Allergies (Medications, Foods, Environmental)"
            name="allergies"
            type="textarea"
            rows={2}
            placeholder="List any known allergies and reactions (e.g. 'Penicillin - hives', 'Peanuts') or 'No known drug allergies (NKDA)'..."
            value={history.allergies}
            onChange={handleChange}
            hint="Critical for physician prescribing decisions and patient safety."
          />

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                updateMedicalHistory(history);
                navigate('/intake/ai-questions');
              }}
            >
              ← Back to AI Questions
            </Button>

            <Button type="submit" variant="primary">
              Continue to Medications →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
