import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

/**
 * Welcome Page
 * Welcoming landing screen introducing MediCase and starting the case intake process.
 */
export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="container page-container">
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
        {/* Medical Cross Graphic */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.4)',
            marginBottom: '1.75rem',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12h20" />
          </svg>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
          Welcome to <span style={{ color: 'var(--primary)' }}>MediCase</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
          Intelligent, patient-centered case-taking software designed to record clinical symptoms, medical history, and documents for swift physician evaluation.
        </p>

        {/* Feature Highlights */}
        <div
          className="grid grid-cols-3"
          style={{
            maxWidth: '700px',
            margin: '0 auto 2.75rem',
            textAlign: 'left',
          }}
        >
          <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Guided Intake</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Step-by-step intake covering demographics, complaints, and vitals.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤖</div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>AI Triage Questions</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Smart follow-up inquiry preview to clarify clinical nuances.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🩺</div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Physician Review</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Integrated doctor dashboard with organized patient case summaries.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/intake/patient-details')}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            }
          >
            Start Case Intake
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            }
          >
            Open Doctor Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
