/**
 * Realistic Mock Patient Cases for MediCase Doctor Dashboard & Review
 */

export const initialMockCases = [
  {
    id: 'MC-8291',
    createdAt: '2026-09-06 09:30 AM',
    status: 'Urgent', // 'Urgent' | 'Pending Review' | 'Reviewed'
    patientDetails: {
      fullName: 'Sarah Jenkins',
      age: 34,
      gender: 'Female',
      phone: '+1 (555) 234-8901',
      email: 'sarah.jenkins@example.com',
    },
    chiefComplaint: 'Severe throbbing migraines concentrated in the left temple accompanied by nausea and shimmering visual aura lasting over 4 hours.',
    symptoms: [
      { symptom: 'Throbbing left temple headache', duration: '3 days', severity: 'Severe' },
      { symptom: 'Photophobia (light sensitivity)', duration: '2 days', severity: 'Severe' },
      { symptom: 'Visual zig-zag scotoma (aura)', duration: '1 day', severity: 'Moderate' },
      { symptom: 'Mild nausea and loss of appetite', duration: '2 days', severity: 'Moderate' },
    ],
    aiQuestions: [
      { question: 'Does the headache worsen with physical activity or bending over?', answer: 'Yes, significantly worsens when walking or bending down.' },
      { question: 'Have you experienced any numbness or tingling in the face or fingers?', answer: 'Mild tingling in left fingers prior to the onset of the migraine.' },
      { question: 'Have over-the-counter NSAIDs (Ibuprofen/Acetaminophen) provided relief?', answer: 'Minimal relief from 400mg Ibuprofen.' },
    ],
    medicalHistory: {
      illnesses: 'Chronic episodic migraine since college, mild seasonal allergic rhinitis.',
      surgeries: 'Appendectomy (2018).',
      allergies: 'Penicillin (causes hives), Shellfish.',
    },
    medications: [
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed at migraine onset' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily as needed' },
    ],
    documents: [
      { name: 'Brain_MRI_Report_Nov2025.pdf', size: '2.4 MB', uploadDate: '2026-09-06' },
      { name: 'Optometry_Visual_Field_Scan.pdf', size: '1.1 MB', uploadDate: '2026-09-06' },
    ],
    doctorNotes: 'Patient presents with classic migraine with aura symptoms. Prior MRI clear. Recommend switching acute rescue therapy to Naratriptan and assessing prophylaxis with Topiramate.',
  },
  {
    id: 'MC-7412',
    createdAt: '2026-09-06 10:15 AM',
    status: 'Pending Review',
    patientDetails: {
      fullName: 'Robert Miller',
      age: 58,
      gender: 'Male',
      phone: '+1 (555) 456-7890',
      email: 'robert.m@example.com',
    },
    chiefComplaint: 'Follow-up consultation for elevated blood pressure readings (155/95 mmHg average) and intermittent mild bilateral ankle edema.',
    symptoms: [
      { symptom: 'Elevated morning systolic BP readings', duration: '3 weeks', severity: 'Moderate' },
      { symptom: 'Bilateral ankle swelling in evenings', duration: '2 weeks', severity: 'Mild' },
      { symptom: 'Occasional morning dull occipital headache', duration: '1 week', severity: 'Mild' },
    ],
    aiQuestions: [
      { question: 'Have you noticed any shortness of breath while lying flat at night (orthopnea)?', answer: 'No orthopnea noticed.' },
      { question: 'Have there been changes in your daily sodium intake or exercise regimen?', answer: 'Diet has been somewhat high in sodium due to dining out.' },
    ],
    medicalHistory: {
      illnesses: 'Primary Essential Hypertension (diagnosed 2021), Hyperlipidemia.',
      surgeries: 'Knee Arthroscopy (2015).',
      allergies: 'No known drug allergies (NKDA).',
    },
    medications: [
      { name: 'Amlodipine Besylate', dosage: '5mg', frequency: 'Once daily each morning' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime' },
    ],
    documents: [
      { name: 'Blood_Pressure_Log_Aug2026.pdf', size: '420 KB', uploadDate: '2026-09-06' },
      { name: 'Lipid_Panel_Lab_Results.pdf', size: '890 KB', uploadDate: '2026-09-06' },
    ],
    doctorNotes: '',
  },
  {
    id: 'MC-6190',
    createdAt: '2026-09-05 02:40 PM',
    status: 'Reviewed',
    patientDetails: {
      fullName: 'Emily Chen',
      age: 26,
      gender: 'Female',
      phone: '+1 (555) 789-0123',
      email: 'emily.chen@example.com',
    },
    chiefComplaint: 'Widespread pruritic erythematous maculopapular rash on torso and bilateral arms after initiating amoxicillin for dental abscess.',
    symptoms: [
      { symptom: 'Diffuse itchy maculopapular skin rash', duration: '2 days', severity: 'Severe' },
      { symptom: 'Mild generalized joint tenderness', duration: '24 hours', severity: 'Moderate' },
      { symptom: 'Low grade subjective feverish feeling', duration: '24 hours', severity: 'Mild' },
    ],
    aiQuestions: [
      { question: 'Is there any swelling of your lips, tongue, or difficulty swallowing or breathing?', answer: 'No lip swelling, airways feel clear.' },
      { question: 'When did you take the last dose of the suspected antibiotic?', answer: 'Took last dose yesterday evening, discontinued this morning.' },
    ],
    medicalHistory: {
      illnesses: 'None. Generally healthy.',
      surgeries: 'Wisdom teeth extraction 4 days ago.',
      allergies: 'Suspected Amoxicillin allergy.',
    },
    medications: [
      { name: 'Amoxicillin (Discontinued)', dosage: '500mg', frequency: 'TID for 3 days' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours as needed' },
    ],
    documents: [
      { name: 'Rash_Photo_UpperTorso.jpg', size: '1.8 MB', uploadDate: '2026-09-05' },
    ],
    doctorNotes: 'Confirmed morbilliform drug eruption secondary to Amoxicillin. No signs of anaphylaxis or mucosal involvement. Prescribed oral Prednisone taper and topical Hydrocortisone 1%.',
  },
  {
    id: 'MC-5044',
    createdAt: '2026-09-05 11:20 AM',
    status: 'Pending Review',
    patientDetails: {
      fullName: 'James Wilson',
      age: 71,
      gender: 'Male',
      phone: '+1 (555) 901-2345',
      email: 'j.wilson71@example.com',
    },
    chiefComplaint: 'Gradual increase in dyspnea upon climbing one flight of stairs with dry non-productive cough during early morning hours.',
    symptoms: [
      { symptom: 'Exertional dyspnea (shortness of breath)', duration: '1 month', severity: 'Moderate' },
      { symptom: 'Dry non-productive nocturnal cough', duration: '3 weeks', severity: 'Mild' },
      { symptom: 'General daytime fatigue', duration: '2 weeks', severity: 'Moderate' },
    ],
    aiQuestions: [
      { question: 'Do you have any history of tobacco smoking or occupational exposure to dust/chemicals?', answer: 'Former smoker (15 pack-years), quit 20 years ago.' },
      { question: 'Have you noticed any chest pressure or discomfort radiating to the arm or jaw?', answer: 'No radiating chest pressure.' },
    ],
    medicalHistory: {
      illnesses: 'Type 2 Diabetes Mellitus, Mild Osteoarthritis.',
      surgeries: 'Right inguinal hernia repair (2012).',
      allergies: 'Sulfa antibiotics.',
    },
    medications: [
      { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily with meals' },
      { name: 'Glipizide', dosage: '5mg', frequency: 'Once daily before breakfast' },
    ],
    documents: [
      { name: 'Recent_Chest_Xray_Summary.pdf', size: '3.1 MB', uploadDate: '2026-09-05' },
    ],
    doctorNotes: '',
  }
];
