import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import useExams from "../hooks/useExams";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function ReadOnlyPdf({ file, loadingText, onLoadSuccess, numPages }) {
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const width = Math.floor(el.clientWidth);
      if (width > 0) setPageWidth(width);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="pdf-container"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <Document
        file={file}
        onLoadSuccess={onLoadSuccess}
        loading={<div className="pdf-loading">{loadingText}</div>}
      >
        {pageWidth
          ? Array.from(new Array(numPages || 0), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={pageWidth}
              />
            ))
          : null}
      </Document>
    </div>
  );
}

export default function PDFViewer() {
  const { examId, paperId } = useParams();
  const { exams, loading } = useExams();
  const [numPages, setNumPages] = useState(null);
  const [numAnswerPages, setNumAnswerPages] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setNumPages(null);
    setNumAnswerPages(null);
    setShowAnswer(false);
  }, [examId, paperId]);

  useEffect(() => {
    const blockKeys = (e) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "u"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const blockPrint = (e) => e.preventDefault();
    window.addEventListener("keydown", blockKeys, true);
    window.addEventListener("beforeprint", blockPrint);
    return () => {
      window.removeEventListener("keydown", blockKeys, true);
      window.removeEventListener("beforeprint", blockPrint);
    };
  }, []);

  if (loading) {
    return (
      <div className="pdf-viewer-page">
        <p>Loading paper...</p>
      </div>
    );
  }

  const exam = exams.find((e) => e.id === examId);
  const paper = exam?.papers.find((p) => p.id === paperId);

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

      <ReadOnlyPdf
        file={paper.questionPdf}
        loadingText="Loading PDF..."
        numPages={numPages}
        onLoadSuccess={({ numPages: nextNumPages }) => setNumPages(nextNumPages)}
      />

      {showAnswer ? (
        <div className="answer-section">
          <h3>Answer Key</h3>
          {paper.answerPdf ? (
            <ReadOnlyPdf
              file={paper.answerPdf}
              loadingText="Loading Answer PDF..."
              numPages={numAnswerPages}
              onLoadSuccess={({ numPages: nextNumPages }) => setNumAnswerPages(nextNumPages)}
            />
          ) : (
            <div className="pdf-placeholder">
              <span>Coming soon</span>
            </div>
          )}
        </div>
      ) : (
        <button className="show-answer-btn" type="button" onClick={() => setShowAnswer(true)}>
          Show Answer
        </button>
      )}
    </div>
  );
}
