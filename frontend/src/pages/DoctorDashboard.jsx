import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

/**
 * DoctorDashboard Page
 * Central overview of all submitted patient cases with quick metrics, search, and review actions.
 */
export default function DoctorDashboard({ cases = [] }) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // =====================================================
  // STATS
  // =====================================================

  const totalCount = cases.length;

  const pendingCount = cases.filter(
    (c) => c.status === 'Pending Review'
  ).length;

  const reviewedCount = cases.filter(
    (c) => c.status === 'Reviewed'
  ).length;

  const urgentCount = cases.filter(
    (c) => c.status === 'Urgent'
  ).length;


  // =====================================================
  // FILTER CASES
  // =====================================================

  const filteredCases = cases.filter((c) => {
    const patientName =
      c.patientDetails?.fullName?.toLowerCase() || '';

    const complaint =
      c.chiefComplaint?.toLowerCase() || '';

    const term = searchTerm.toLowerCase();

    const matchesSearch =
      patientName.includes(term) ||
      complaint.includes(term);

    const matchesStatus =
      statusFilter === 'All' ||
      c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return 'Recent';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return 'Recent';
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
  // RENDER
  // =====================================================

  return (
    <div
      className="container"
      style={{ paddingBottom: '3rem' }}
    >

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        title="Doctor Clinical Dashboard"
        subtitle="Manage and triage active patient intake cases, review clinical complaints, and record assessment notes."
        action={
          <Button
            variant="primary"
            onClick={() =>
              navigate('/intake/patient-details')
            }
            icon={<span>＋</span>}
          >
            New Patient Case
          </Button>
        }
      />


      {/* =================================================
          STATS COUNTER ROW
      ================================================= */}

      <div className="dashboard-stats">

        <div className="stat-card">
          <div className="stat-label">
            Total Active Cases
          </div>

          <div
            className="stat-val"
            style={{
              color: 'var(--primary-dark)',
            }}
          >
            {totalCount}
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-label">
            Pending Review
          </div>

          <div
            className="stat-val"
            style={{
              color: 'var(--status-pending-text)',
            }}
          >
            {pendingCount}
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-label">
            Reviewed Cases
          </div>

          <div
            className="stat-val"
            style={{
              color: 'var(--status-reviewed-text)',
            }}
          >
            {reviewedCount}
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-label">
            Urgent / Priority
          </div>

          <div
            className="stat-val"
            style={{
              color: 'var(--status-urgent-text)',
            }}
          >
            {urgentCount}
          </div>
        </div>

      </div>


      {/* =================================================
          FILTER AND SEARCH BAR
      ================================================= */}

      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >

        {/* Search */}

        <div
          style={{
            flex: '1 1 300px',
            position: 'relative',
          }}
        >

          <input
            type="text"
            className="form-input"
            placeholder="Search by patient name or complaint keyword..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            style={{
              paddingLeft: '2.5rem',
            }}
          />

          <span
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)',
            }}
          >
            🔍
          </span>

        </div>


        {/* Status Filters */}

        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >

          {[
            'All',
            'Pending Review',
            'Urgent',
            'Reviewed',
          ].map((status) => (

            <button
              key={status}
              type="button"
              onClick={() =>
                setStatusFilter(status)
              }
              className={`btn btn-sm ${
                statusFilter === status
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {status}
            </button>

          ))}

        </div>

      </div>


      {/* =================================================
          CASES GRID
      ================================================= */}

      {filteredCases.length > 0 ? (

        <div className="case-card-grid">

          {filteredCases.map(
            (caseItem, index) => {

              const patient =
                caseItem.patientDetails || {};

              const isUrgent =
                caseItem.status === 'Urgent';

              const isReviewed =
                caseItem.status === 'Reviewed';

              /*
               * Use backend case ID whenever available.
               * Fallback to array index only if necessary.
               */
              const caseKey =
                caseItem.id ??
                caseItem.backendCaseId ??
                `case-${index}`;


              return (

                <div
                  key={caseKey}
                  className="case-card"
                >

                  <div>

                    {/* =================================================
                        CARD HEADER
                    ================================================= */}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                      }}
                    >

                      <div>

                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: 'var(--text-light)',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {caseItem.id}
                        </span>


                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            color: 'var(--text-main)',
                            marginTop: '0.1rem',
                          }}
                        >
                          {patient.fullName ||
                            'Anonymous Patient'}
                        </h3>

                      </div>


                      {/* Status Badge */}

                      <span
                        className={`badge ${
                          isUrgent
                            ? 'badge-urgent'
                            : isReviewed
                            ? 'badge-reviewed'
                            : 'badge-pending'
                        }`}
                      >
                        {caseItem.status ||
                          'Pending'}
                      </span>

                    </div>


                    {/* =================================================
                        DEMOGRAPHICS & DATE
                    ================================================= */}

                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginBottom: '1rem',
                      }}
                    >

                      <span>
                        {patient.age
                          ? `${patient.age} yrs`
                          : 'Age N/A'}
                      </span>

                      {' • '}

                      <span>
                        {patient.gender ||
                          'Gender N/A'}
                      </span>

                      {' • '}

                      <span>
                        {formatDateTime(
                          caseItem.createdAt
                        )}
                      </span>

                    </div>


                    {/* =================================================
                        CHIEF COMPLAINT
                    ================================================= */}

                    <div
                      style={{
                        marginBottom: '1.25rem',
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
                        Chief Complaint
                      </label>


                      <p
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--text-main)',
                          lineHeight: '1.45',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {caseItem.chiefComplaint ||
                          'No details provided.'}
                      </p>

                    </div>


                    {/* =================================================
                        SYMPTOMS PREVIEW
                    ================================================= */}

                    {caseItem.symptoms &&
                      caseItem.symptoms.length > 0 && (

                        <div
                          style={{
                            display: 'flex',
                            gap: '0.4rem',
                            flexWrap: 'wrap',
                            marginBottom: '1.25rem',
                          }}
                        >

                          {caseItem.symptoms
                            .slice(0, 3)
                            .map(
                              (sym, idx) => (

                                <span
                                  key={
                                    sym.id ??
                                    `${caseItem.id}-symptom-${idx}`
                                  }
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.2rem 0.6rem',
                                    background:
                                      'var(--bg-subtle)',
                                    borderRadius:
                                      'var(--radius-pill)',
                                    color:
                                      'var(--text-muted)',
                                    border:
                                      '1px solid var(--border-light)',
                                  }}
                                >
                                  {sym.symptom}
                                </span>

                              )
                            )}


                          {caseItem.symptoms.length > 3 && (

                            <span
                              style={{
                                fontSize: '0.75rem',
                                color:
                                  'var(--text-light)',
                                alignSelf: 'center',
                              }}
                            >
                              +
                              {caseItem.symptoms.length -
                                3}{' '}
                              more
                            </span>

                          )}

                        </div>

                      )}

                  </div>


                  {/* =================================================
                      CARD ACTION
                  ================================================= */}

                  <div
                    style={{
                      paddingTop: '1rem',
                      borderTop:
                        '1px solid var(--border-light)',
                    }}
                  >

                    <Button
                      variant="outline"
                      size="sm"
                      style={{
                        width: '100%',
                      }}
                      onClick={() =>
                        navigate(
                          `/review/${caseItem.id}`
                        )
                      }
                      icon={
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                          />
                        </svg>
                      }
                    >
                      View Case Review
                    </Button>

                  </div>

                </div>

              );

            }
          )}

        </div>

      ) : (

        /* =================================================
            EMPTY STATE
        ================================================= */

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
            🔍
          </div>


          <h3
            style={{
              fontSize: '1.2rem',
              marginBottom: '0.5rem',
            }}
          >
            No matching cases found
          </h3>


          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
            }}
          >
            Try adjusting your search criteria or
            clear status filters.
          </p>


          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
            }}
          >
            Reset Filters
          </Button>

        </div>

      )}

    </div>
  );
}