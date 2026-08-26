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
              <iframe
                src={`${paper.questionPdf}#toolbar=0&navpanes=0&scrollbar=0`}
                title={`${paper.name} preview`}
                className="paper-preview-iframe"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  pointerEvents: "none",
                }}
              />
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
