import React from "react";
import { useParams, Link } from "react-router-dom";
import useExams from "../hooks/useExams";

export default function PDFViewer() {
  const { examId, paperId } = useParams();
  const { exams, loading, error } = useExams();

  // 1. Declare all hooks at the top level
  const [showAnswer, setShowAnswer] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p" || e.key === "u")) {
        e.preventDefault();
        alert("Saving, printing, and viewing source are disabled.");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Default exam/paper if hook fails
  const defaultExam = { id: "", name: "Punjab Lecturer Cadre", papers: [] };
  const defaultPaper = { id: "", name: "", questionPdf: "", answerPdf: "" };

  const exam = exams.find((e) => e.id === examId) || defaultExam;
  const paper = exam?.papers.find((p) => p.id === paperId) || defaultPaper;

  // 2. Conditional return AFTER all hooks
  if (!exam || !paper || !paper.questionPdf) {
    return (
      <div className="pdf-viewer-page">
        <Link to="/exams" className="back-link">
          &larr; Back
        </Link>
        <h2>Paper not found</h2>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-page">
      <Link to={`/exams/${examId}`} className="back-link">
        &larr; Back to {exam.name}
      </Link>
      <h2>{paper.name} - Questions</h2>

       <div
         className="pdf-container"
         onContextMenu={(e) => e.preventDefault()}
         style={{ userSelect: "none" }}
       >
         <iframe
           src={`${paper.questionPdf}#toolbar=0&navpanes=0&scrollbar=1`}
           title="Question Paper"
           className="pdf-frame"
         />
       </div>

      {showAnswer ? (
        <div className="answer-section">
          <h3>Answer Key</h3>
          {paper.answerPdf ? (
             <div
               className="pdf-container"
               onContextMenu={(e) => e.preventDefault()}
               style={{ userSelect: "none" }}
             >
               <iframe
                 src={`${paper.answerPdf}#toolbar=0&navpanes=0&scrollbar=1`}
                 title="Answer Paper"
                 className="pdf-frame"
               />
             </div>
          ) : (
            <div className="pdf-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <span>Coming soon</span>
            </div>
          )}
        </div>
      ) : (
        <button
          className="show-answer-btn"
          onClick={() => setShowAnswer(true)}
        >
          Show Answer
        </button>
      )}
    </div>
  );
}