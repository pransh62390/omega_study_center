import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import useExams from "../hooks/useExams";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer() {
  const { examId, paperId } = useParams();
  const { exams, loading, error } = useExams();
  const [numPages, setNumPages] = useState(null);
  const [numAnswerPages, setNumAnswerPages] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p" || e.key === "u")) {
        e.preventDefault();
        alert("Saving, printing, and viewing source are disabled.");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const defaultExam = { id: "", name: "Punjab Lecturer Cadre", papers: [] };
  const defaultPaper = { id: "", name: "", questionPdf: "", answerPdf: "" };

  const exam = exams.find((e) => e.id === examId) || defaultExam;
  const paper = exam?.papers.find((p) => p.id === paperId) || defaultPaper;

  if (!exam || !paper || !paper.questionPdf) {
    return (
      <div className="pdf-viewer-page">
        <Link to="/exams" className="back-link">&larr; Back</Link>
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

      <div className="pdf-container" onContextMenu={(e) => e.preventDefault()} style={{ userSelect: "none" }}>
        <Document 
          file={paper.questionPdf} 
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading="Loading PDF..."
        >
          {Array.from(new Array(numPages || 0), (el, index) => (
            <Page 
              key={`page_${index + 1}`} 
              pageNumber={index + 1} 
              renderTextLayer={false} 
              renderAnnotationLayer={false}
              width={window.innerWidth * 0.9}
            />
          ))}
        </Document>
      </div>

      {showAnswer ? (
        <div className="answer-section">
          <h3>Answer Key</h3>
          {paper.answerPdf ? (
            <div className="pdf-container" onContextMenu={(e) => e.preventDefault()} style={{ userSelect: "none" }}>
              <Document 
                file={paper.answerPdf} 
                onLoadSuccess={({ numPages }) => setNumAnswerPages(numPages)}
                loading="Loading Answer PDF..."
              >
                {Array.from(new Array(numAnswerPages || 0), (el, index) => (
                  <Page 
                    key={`ans_page_${index + 1}`} 
                    pageNumber={index + 1} 
                    renderTextLayer={false} 
                    renderAnnotationLayer={false}
                    width={window.innerWidth * 0.9}
                  />
                ))}
              </Document>
            </div>
          ) : (
            <div className="pdf-placeholder">
              <span>Coming soon</span>
            </div>
          )}
        </div>
      ) : (
        <button className="show-answer-btn" onClick={() => setShowAnswer(true)}>
          Show Answer
        </button>
      )}
    </div>
  );
}
