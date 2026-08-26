import React from "react";
import { useParams, Link } from "react-router-dom";
import useExams from "../hooks/useExams";

export default function Papers() {
  const { examId } = useParams();
  const { exams, loading } = useExams();

  const exam = exams.find((e) => e.id === examId);

  if (!exam) {
    return (
      <div className="papers-page">
        <Link to="/exams" className="back-link">
          &larr; Back
        </Link>
        <h2>Exam not found</h2>
      </div>
    );
  }

  return (
    <div className="papers-page">
      <Link to="/exams" className="back-link">
        &larr; Back
      </Link>
      <h2>{exam.name}</h2>
      <div className="papers-grid">
        {loading ? [] : exam.papers.map((paper) => (
          <Link
            to={`/exams/${examId}/${paper.id}`}
            key={paper.id}
            className="paper-card"
          >
            <div className="paper-preview">
              <div className="pdf-icon-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>PDF</span>
              </div>
            </div>
            <div className="paper-info">
              <h3>{paper.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
