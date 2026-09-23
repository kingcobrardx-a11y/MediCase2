import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import InputField from '../components/InputField';
import Button from '../components/Button';

/**
 * Medications Page
 * Captures all current prescription and over-the-counter medications, doses, and frequency.
 */
export default function Medications({ caseData, updateMedications }) {
  const navigate = useNavigate();

  const [medications, setMedications] = useState(
    caseData?.medications && caseData.medications.length > 0
      ? caseData.medications
      : [{ name: '', dosage: '', frequency: '' }]
  );

  const handleMedChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleAddMed = () => {
    setMedications((prev) => [...prev, { name: '', dosage: '', frequency: '' }]);
  };

  const handleRemoveMed = (index) => {
    if (medications.length === 1) {
      setMedications([{ name: '', dosage: '', frequency: '' }]);
      return;
    }
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNoMeds = () => {
    setMedications([{ name: 'None / No regular medications', dosage: 'N/A', frequency: 'N/A' }]);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    // Filter out completely blank rows
    const cleaned = medications.filter(
      (m) => m.name.trim().length > 0 || m.dosage.trim().length > 0
    );
    updateMedications(cleaned.length > 0 ? cleaned : [{ name: 'None reported', dosage: '-', frequency: '-' }]);
    navigate('/intake/documents');
  };

  return (
    <div className="container page-container">
      <div className="card">
        <PageHeader
          stepNumber="Step 6 of 8"
          title="Current Medications"
          subtitle="List all prescription drugs, over-the-counter supplements, or herbal remedies you currently take."
        />

        <form onSubmit={handleContinue}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNoMeds}
            >
              I take no current medications
            </Button>
          </div>

          <div className="dynamic-row-list">
            {medications.map((item, index) => (
              <div key={index} className="dynamic-row-card">
                <div>
                  <InputField
                    label={`Medication #${index + 1}`}
                    placeholder="e.g. Amlodipine, Metformin, Lisinopril"
                    value={item.name}
                    onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                  />
                </div>

                <div>
                  <InputField
                    label="Dosage"
                    placeholder="e.g. 10mg, 500mg"
                    value={item.dosage}
                    onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                  />
                </div>

                <div>
                  <InputField
                    label="Frequency"
                    placeholder="e.g. Once daily, PRN"
                    value={item.frequency}
                    onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                  />
                </div>

                <div style={{ paddingTop: '1.5rem' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMed(index)}
                    title="Remove medication"
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
            onClick={handleAddMed}
            icon={<span>＋</span>}
            style={{ marginBottom: '1rem' }}
          >
            Add Another Medication
          </Button>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                updateMedications(medications);
                navigate('/intake/medical-history');
              }}
            >
              ← Back to Medical History
            </Button>

            <Button type="submit" variant="primary">
              Continue to Documents →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
