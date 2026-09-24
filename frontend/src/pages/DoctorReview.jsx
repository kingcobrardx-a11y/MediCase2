import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import InputField from '../components/InputField';

/**
 * DoctorReview Page
 * Clinical inspection workspace for physicians to examine a patient case
 * and record assessment findings and status updates.
 */
export default function DoctorReview({
  cases = [],
  updateCaseNotes,
}) {
  const { caseId } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // FIND SELECTED CASE
  // =====================================================

  // IMPORTANT:
  // useParams() returns caseId as a STRING.
  // Backend case IDs are NUMBERS.
  // Therefore we compare both as strings.

  const currentCase = cases.find(
    (c) => String(c.id) === String(caseId)
  );


  // =====================================================
  // LOCAL STATE
  // =====================================================

  const [doctorNotes, setDoctorNotes] = useState('');
  const [status, setStatus] = useState('Pending Review');
  const [savedAlert, setSavedAlert] = useState(false);


  // =====================================================
  // LOAD EXISTING CASE REVIEW DATA
  // =====================================================

  useEffect(() => {

    if (currentCase) {

      setDoctorNotes(
        currentCase.doctorNotes || ''
      );

      setStatus(
        currentCase.status || 'Pending Review'
      );

    }

  }, [currentCase]);


  // =====================================================
  // CASE NOT FOUND
  // =====================================================

  if (!currentCase) {

    return (
      <div className="container page-container">

        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
          }}
        >

          <div
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
            }}
          >
            ❓
          </div>


          <h2>
            Case Not Found
          </h2>


          <p
            style={{
              color: 'var(--text-muted)',
              margin: '1rem 0 2rem',
            }}
          >
            No patient record with ID{' '}
            <strong>{caseId}</strong>{' '}
            was located.
          </p>


          <Button
            variant="primary"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            ← Return to Doctor Dashboard
          </Button>

        </div>

      </div>
    );
  }


  // =====================================================
  // CASE DATA
  // =====================================================

  const patient =
    currentCase.patientDetails || {};

  const symptoms =
    currentCase.symptoms || [];

  const history =
    currentCase.medicalHistory || {};

  const medications =
    currentCase.medications || [];

  const documents =
    currentCase.documents || [];

  const aiQuestions =
    currentCase.aiQuestions || [];


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDateTime = (dateValue) => {

    if (!dateValue) {
      return 'Recently';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return 'Recently';
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  };


  // =====================================================
  // SAVE DOCTOR ASSESSMENT
  // =====================================================

  const handleSaveAssessment = async (e) => {

    e.preventDefault();

    try {

      await updateCaseNotes(
        currentCase.id,
        doctorNotes,
        status
      );

      setSavedAlert(true);

      setTimeout(() => {
        setSavedAlert(false);
      }, 3000);

    } catch (error) {

      console.error(
        'Failed to save doctor assessment:',
        error
      );

    }

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="container"
      style={{
        paddingBottom: '4rem',
      }}
    >

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <div
        style={{
          marginBottom: '1.25rem',
        }}
      >

        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            navigate('/dashboard')
          }
          icon={
            <span>←</span>
          }
        >
          Back to Case Dashboard
        </Button>

      </div>


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        title={`Clinical Review: ${
          patient.fullName || 'Patient'
        }`}
        subtitle={`Case ID: ${
          currentCase.id
        } • Registered ${formatDateTime(
          currentCase.createdAt
        )}`}
        badge={status}
      />


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {savedAlert && (

        <div
          className="info-banner"
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
          }}
        >

          <span
            className="info-banner-icon"
            style={{
              color: '#059669',
            }}
          >
            ✓
          </span>


          <div>

            <strong
              style={{
                color: '#065f46',
              }}
            >
              Clinical notes saved successfully!
            </strong>


            <p
              style={{
                fontSize: '0.85rem',
                color: '#047857',
              }}
            >
              The patient case has been updated
              with the latest physician assessment.
            </p>

          </div>

        </div>

      )}


      {/* =================================================
          MAIN TWO COLUMN LAYOUT
      ================================================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >


        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >


          {/* =================================================
              PATIENT DEMOGRAPHICS
          ================================================= */}

          <div className="card">

            <h3
              style={{
                fontSize: '1.15rem',
                marginBottom: '1rem',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>👤</span>
              Patient Demographics
            </h3>


            <div className="summary-grid">

              <div className="summary-item">
                <label>
                  Full Name
                </label>

                <span>
                  {patient.fullName || '—'}
                </span>
              </div>


              <div className="summary-item">
                <label>
                  Age & Gender
                </label>

                <span>
                  {patient.age
                    ? `${patient.age} yrs`
                    : '—'}
                  {' • '}
                  {patient.gender || '—'}
                </span>
              </div>


              <div className="summary-item">
                <label>
                  Phone Contact
                </label>

                <span>
                  {patient.phone || '—'}
                </span>
              </div>


              <div className="summary-item">
                <label>
                  Email Address
                </label>

                <span>
                  {patient.email || '—'}
                </span>
              </div>

            </div>

          </div>


          {/* =================================================
              CHIEF COMPLAINT
          ================================================= */}

          <div className="card">

            <h3
              style={{
                fontSize: '1.15rem',
                marginBottom: '0.75rem',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>💬</span>
              Chief Complaint
            </h3>


            <p
              style={{
                background: 'var(--bg-subtle)',
                padding: '1.1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                lineHeight: '1.6',
              }}
            >
              {currentCase.chiefComplaint ||
                'No chief complaint provided.'}
            </p>

          </div>


          {/* =================================================
              SYMPTOMS
          ================================================= */}

          <div className="card">

            <h3
              style={{
                fontSize: '1.15rem',
                marginBottom: '1rem',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>🩺</span>
              Reported Symptoms ({symptoms.length})
            </h3>


            {symptoms.length > 0 ? (

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >

                {symptoms.map((sym, idx) => (

                  <div
                    key={
                      sym.id ??
                      `${currentCase.id}-symptom-${idx}`
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      border:
                        '1px solid var(--border-light)',
                    }}
                  >

                    <div>

                      <strong
                        style={{
                          fontSize: '0.95rem',
                          color: 'var(--text-main)',
                        }}
                      >
                        {sym.symptom}
                      </strong>


                      {sym.duration && (

                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Duration: {sym.duration}
                        </div>

                      )}

                    </div>


                    <span
                      className={`badge ${
                        sym.severity === 'Severe'
                          ? 'badge-urgent'
                          : sym.severity === 'Moderate'
                          ? 'badge-pending'
                          : 'badge-primary'
                      }`}
                    >
                      {sym.severity ||
                        'Moderate'}
                    </span>

                  </div>

                ))}

              </div>

            ) : (

              <p
                style={{
                  color: 'var(--text-light)',
                  fontStyle: 'italic',
                }}
              >
                No symptoms reported.
              </p>

            )}

          </div>


          {/* =================================================
              MEDICAL HISTORY & ALLERGIES
          ================================================= */}

          <div className="card">

            <h3
              style={{
                fontSize: '1.15rem',
                marginBottom: '1rem',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>📋</span>
              Medical History & Allergies
            </h3>


            {/* Allergies */}

            <div
              style={{
                padding: '1rem',
                background:
                  history.allergies &&
                  history.allergies.toLowerCase() !==
                    'none'
                    ? 'var(--status-urgent-bg)'
                    : 'var(--bg-subtle)',
                border:
                  history.allergies &&
                  history.allergies.toLowerCase() !==
                    'none'
                    ? '1px solid var(--status-urgent-border)'
                    : '1px solid var(--border-light)',
                borderRadius:
                  'var(--radius-md)',
                marginBottom: '1rem',
              }}
            >

              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: '#be123c',
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Allergies & Sensitivities
              </label>


              <strong
                style={{
                  fontSize: '0.95rem',
                  color: history.allergies
                    ? '#9f1239'
                    : 'var(--text-main)',
                }}
              >
                {history.allergies ||
                  'No known drug allergies reported'}
              </strong>

            </div>


            <div className="grid grid-cols-2">

              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >

                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: 'var(--text-light)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Pre-existing Conditions
                </label>


                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                  }}
                >
                  {history.illnesses ||
                    'None reported'}
                </p>

              </div>


              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >

                <label
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: 'var(--text-light)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Surgeries & Procedures
                </label>


                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                  }}
                >
                  {history.surgeries ||
                    'None reported'}
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              CURRENT MEDICATIONS
          ================================================= */}

          <div className="card">

            <h3
              style={{
                fontSize: '1.15rem',
                marginBottom: '1rem',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>💊</span>
              Current Medications ({medications.length})
            </h3>


            {medications.length > 0 ? (

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >

                {medications.map((med, idx) => (

                  <div
                    key={
                      med.id ??
                      `${currentCase.id}-med-${idx}`
                    }
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                    }}
                  >

                    <strong>
                      {med.name}
                    </strong>


                    <span
                      style={{
                        color: 'var(--text-muted)',
                      }}
                    >
                      {med.dosage &&
                        `${med.dosage}`}

                      {med.frequency &&
                        ` • ${med.frequency}`}
                    </span>

                  </div>

                ))}

              </div>

            ) : (

              <p
                style={{
                  color: 'var(--text-light)',
                  fontStyle: 'italic',
                }}
              >
                No active medications listed.
              </p>

            )}

          </div>


          {/* =================================================
              AI FOLLOW-UP QUESTIONS
          ================================================= */}

          {aiQuestions.length > 0 && (

            <div className="card">

              <h3
                style={{
                  fontSize: '1.15rem',
                  marginBottom: '0.75rem',
                  color: 'var(--primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>🤖</span>
                AI Follow-up Clarifications
              </h3>


              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >

                {aiQuestions.map((q, idx) => (

                  <div
                    key={
                      q.id ??
                      `${currentCase.id}-question-${idx}`
                    }
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                    }}
                  >

                    <strong
                      style={{
                        display: 'block',
                        color: 'var(--text-main)',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {q.question}
                    </strong>


                    <span
                      style={{
                        color: q.answer
                          ? 'var(--primary-dark)'
                          : 'var(--text-light)',
                      }}
                    >
                      {q.answer
                        ? `Patient: "${q.answer}"`
                        : 'No response recorded.'}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          )}


          {/* =================================================
              UPLOADED DOCUMENTS
          ================================================= */}

          <div className="card">

            <h3
              style={{
                fontSize: '1.15rem',
                marginBottom: '1rem',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>📂</span>
              Patient Documents & Records ({documents.length})
            </h3>


            {documents.length > 0 ? (

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >

                {documents.map((doc, idx) => (

                  <div
                    key={
                      doc.id ??
                      `${currentCase.id}-document-${idx}`
                    }
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >

                      <span>📄</span>

                      <div>

                        <strong
                          style={{
                            fontSize: '0.9rem',
                            display: 'block',
                          }}
                        >
                          {doc.name ||
                            doc.filename ||
                            'Uploaded document'}
                        </strong>


                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {doc.size ||
                            doc.document_type ||
                            'Document'}

                          {doc.uploadDate &&
                            ` • ${doc.uploadDate}`}
                        </span>

                      </div>

                    </div>


                    <span
                      className="badge badge-primary"
                      style={{
                        fontSize: '0.7rem',
                      }}
                    >
                      Ready for Review
                    </span>

                  </div>

                ))}

              </div>

            ) : (

              <p
                style={{
                  color: 'var(--text-light)',
                  fontStyle: 'italic',
                }}
              >
                No documents attached.
              </p>

            )}

          </div>

        </div>


        {/* =================================================
            RIGHT COLUMN — DOCTOR ASSESSMENT
        ================================================= */}

        <div
          style={{
            position: 'sticky',
            top: '100px',
          }}
        >

          <div
            className="card"
            style={{
              border:
                '2px solid var(--primary-border)',
            }}
          >

            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: '800',
                marginBottom: '1.25rem',
                color: 'var(--primary-dark)',
              }}
            >
              🩺 Doctor Clinical Assessment
            </h3>


            <form
              onSubmit={handleSaveAssessment}
            >

              {/* =================================================
                  STATUS
              ================================================= */}

              <InputField
                label="Case Review Status"
                name="status"
                type="select"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                options={[
                  {
                    value: 'Pending Review',
                    label: 'Pending Review',
                  },
                  {
                    value: 'Reviewed',
                    label:
                      'Reviewed / Clinical Plan Set',
                  },
                  {
                    value: 'Urgent',
                    label:
                      'Urgent Attention Required',
                  },
                ]}
                hint="Updates case priority tag on the dashboard."
              />


              {/* =================================================
                  DOCTOR NOTES
              ================================================= */}

              <InputField
                label="Physician Notes & Recommendations"
                name="doctorNotes"
                type="textarea"
                rows={7}
                placeholder="Enter clinical observations, recommended lab work, treatment plan, or patient advice..."
                value={doctorNotes}
                onChange={(e) =>
                  setDoctorNotes(e.target.value)
                }
                hint="Saved with this patient case."
              />


              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div
                style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />

                      <polyline points="17 21 17 13 7 13 7 21" />

                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                  }
                >
                  Save Assessment Notes
                </Button>


                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    navigate('/dashboard')
                  }
                >
                  Return to Dashboard
                </Button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}