import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

/**
 * Documents Page
 * Allows patients to attach supporting medical records, lab reports, or imaging files.
 * Files are tracked in frontend state with details displayed clearly.
 */
export default function Documents({ caseData, updateDocuments }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState(caseData?.documents || []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;

    const newDocs = selected.map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type || 'Document',
      uploadDate: new Date().toLocaleDateString(),
    }));

    setDocuments((prev) => [...prev, ...newDocs]);
    // Reset file input value to allow selecting same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveDoc = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    updateDocuments(documents);
    navigate('/intake/case-summary');
  };

  return (
    <div className="container page-container">
      <div className="card">
        <PageHeader
          stepNumber="Step 7 of 8"
          title="Clinical Documents & Records"
          subtitle="Upload any relevant medical records, lab test reports, discharge summaries, or imaging scans."
        />

        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        />

        {/* Custom Drag & Drop / Click Zone */}
        <div
          className="dropzone"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
            📄
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            Click to Browse or Drag Medical Files Here
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Supports PDF, JPG, PNG, and DOCX (Files stay safely in your browser session for this intake).
          </p>
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 ? (
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>
              Attached Documents ({documents.length})
            </h4>
            <div className="file-list">
              {documents.map((doc, idx) => (
                <div key={idx} className="file-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>📑</span>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                        {doc.name}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {doc.size} • Uploaded {doc.uploadDate}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveDoc(idx)}
                    style={{ borderColor: '#fecdd3', color: '#e11d48' }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic', textAlign: 'center' }}>
            No documents attached yet. Document upload is optional.
          </p>
        )}

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              updateDocuments(documents);
              navigate('/intake/medications');
            }}
          >
            ← Back to Medications
          </Button>

          <Button type="button" variant="primary" onClick={handleContinue}>
            Continue to Case Summary →
          </Button>
        </div>
      </div>
    </div>
  );
}
