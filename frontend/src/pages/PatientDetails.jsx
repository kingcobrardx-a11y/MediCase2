import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import InputField from '../components/InputField';
import Button from '../components/Button';

/**
 * PatientDetails Page
 * Captures core demographic information: Full Name, Age, Gender, Phone, and Email.
 */
export default function PatientDetails({ caseData, updatePatientDetails }) {
  const navigate = useNavigate();

  // Local state initialized with current case data to avoid data loss
  const [formData, setFormData] = useState({
    fullName: caseData?.patientDetails?.fullName || '',
    age: caseData?.patientDetails?.age || '',
    gender: caseData?.patientDetails?.gender || '',
    phone: caseData?.patientDetails?.phone || '',
    email: caseData?.patientDetails?.email || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Please enter the patient’s full name.';
    if (!formData.age) {
      errs.age = 'Please enter patient age.';
    } else if (Number(formData.age) < 0 || Number(formData.age) > 130) {
      errs.age = 'Please enter a valid age.';
    }
    if (!formData.gender) errs.gender = 'Please select a gender.';
    if (!formData.phone.trim()) errs.phone = 'Please enter a contact phone number.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Persist to central case state
    updatePatientDetails(formData);
    navigate('/intake/chief-complaint');
  };

  return (
    <div className="container page-container">
      <div className="card">
        <PageHeader
          stepNumber="Step 1 of 8"
          title="Patient Demographics"
          subtitle="Please provide accurate personal and contact information for clinical records."
        />

        <form onSubmit={handleContinue}>
          <div className="grid grid-cols-2">
            <InputField
              label="Full Name"
              name="fullName"
              placeholder="e.g. Johnathan Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              error={errors.fullName}
              className="grid-col-span-2"
            />

            <InputField
              label="Age (Years)"
              name="age"
              type="number"
              placeholder="e.g. 42"
              min="0"
              max="130"
              value={formData.age}
              onChange={handleChange}
              required
              error={errors.age}
            />

            <InputField
              label="Gender"
              name="gender"
              type="select"
              value={formData.gender}
              onChange={handleChange}
              required
              placeholder="Select Gender"
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Non-Binary', label: 'Non-Binary' },
                { value: 'Prefer not to say', label: 'Prefer not to say' },
              ]}
              error={errors.gender}
            />
          </div>

          <div className="grid grid-cols-2" style={{ marginTop: '0.5rem' }}>
            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="e.g. +1 (555) 019-2834"
              value={formData.phone}
              onChange={handleChange}
              required
              error={errors.phone}
            />

            <InputField
              label="Email Address (Optional)"
              name="email"
              type="email"
              placeholder="e.g. patient@example.com"
              value={formData.email}
              onChange={handleChange}
              hint="Used for appointment confirmations and summary delivery."
            />
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
            >
              ← Back to Welcome
            </Button>

            <Button type="submit" variant="primary">
              Continue to Chief Complaint →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
