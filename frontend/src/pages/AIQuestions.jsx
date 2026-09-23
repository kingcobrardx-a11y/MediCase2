import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import InputField from '../components/InputField';
import Button from '../components/Button';

/**
 * AIQuestions Page
 * Demonstrates a placeholder UI for AI-generated clinical follow-up questions.
 * Clearly marked as a future AI integration.
 */
export default function AIQuestions({ caseData, updateAIQuestions }) {
  const navigate = useNavigate();

  // Default simulated questions tailored to clinical intake
  const defaultQuestions = [
    {
      id: 'q1',
      question: 'What specific time of day or activity triggers or worsens your symptoms?',
      answer: '',
    },
    {
      id: 'q2',
      question: 'Have you noticed any related sensations (such as dizziness, tingling, numbness, or blurred vision)?',
      answer: '',
    },
    {
      id: 'q3',
      question: 'Have any remedies, rest, hot/cold compresses, or over-the-counter medications offered relief?',
      answer: '',
    },
  ];

  const [questions, setQuestions] = useState(
    caseData?.aiQuestions && caseData.aiQuestions.length > 0
      ? caseData.aiQuestions
      : defaultQuestions
  );

  const handleAnswerChange = (index, value) => {
    const updated = [...questions];
    updated[index].answer = value;
    setQuestions(updated);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    updateAIQuestions(questions);
    navigate('/intake/medical-history');
  };

  const handleSkip = () => {
    updateAIQuestions(questions);
    navigate('/intake/medical-history');
  };

  return (
    <div className="container page-container">
      <div className="card">
        <PageHeader
          stepNumber="Step 4 of 8"
          title="AI Clinical Follow-up"
          subtitle="Preliminary clarifying questions generated to provide your doctor with deeper clinical context."
          badge="AI Preview"
        />

        {/* Future AI Feature Banner */}
        <div className="info-banner info-banner-ai">
          <span className="info-banner-icon">🤖</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0369a1' }}>
                Future AI Feature (Preview Concept)
              </strong>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                Coming Soon
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>
              In the upcoming production release, MediCase will analyze your chief complaint and symptoms in real time using medical AI to generate targeted clarifying questions. For now, sample follow-up prompts are provided below. Answering is optional.
            </p>
          </div>
        </div>

        <form onSubmit={handleContinue}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {questions.map((item, index) => (
              <div
                key={item.id || index}
                style={{
                  padding: '1.25rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      background: 'var(--primary)',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <label
                    htmlFor={`ai-q-${index}`}
                    style={{ fontWeight: '600', fontSize: '0.92rem', color: 'var(--text-main)' }}
                  >
                    {item.question}
                  </label>
                </div>

                <InputField
                  id={`ai-q-${index}`}
                  name={`ai_answer_${index}`}
                  type="textarea"
                  rows={2}
                  placeholder="Type your response here or leave blank if not applicable..."
                  value={item.answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                updateAIQuestions(questions);
                navigate('/intake/symptoms');
              }}
            >
              ← Back to Symptoms
            </Button>

            <div className="form-actions-right">
              <Button type="button" variant="outline" onClick={handleSkip}>
                Skip this Step
              </Button>
              <Button type="submit" variant="primary">
                Continue to Medical History →
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
