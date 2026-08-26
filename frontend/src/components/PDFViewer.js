import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import useExams from "../hooks/useExams";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const pdfOptions = {
  disableStream: true,
  disableAutoFetch: true,
  disableRange: true,
};

function ComingSoon() {
  return (
    <div className="pdf-placeholder">
      <span>Coming soon</span>
    </div>
  );
}

function ReadOnlyPdf({ file, loadingText }) {
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(800);
  const [pdfSource, setPdfSource] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [unavailable, setUnavailable] = useState(!file);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const updateWidth = () => {
      const width = Math.floor(el.clientWidth);
      if (width > 0) setPageWidth(width);
    };

    updateWidth();
    const frame = window.requestAnimationFrame(updateWidth);
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pdfSource]);

  useEffect(() => {
    if (!file) {
      setUnavailable(true);
      setPdfSource(null);
      return undefined;
    }

    let cancelled = false;
    setUnavailable(false);
    setPdfSource(null);
    setNumPages(0);

    fetch(file, { mode: "cors", referrerPolicy: "origin" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load PDF");
        const contentType = (res.headers.get("content-type") || "").toLowerCase();
        if (contentType && !contentType.includes("pdf") && !contentType.includes("octet-stream")) {
          throw new Error("Not a PDF");
        }
        return res.arrayBuffer();
      })
      .then((data) => {
        const header = new Uint8Array(data.slice(0, 5));
        const isPdf = String.fromCharCode(...header) === "%PDF-";
        if (!isPdf) throw new Error("Not a PDF");
        if (!cancelled) setPdfSource({ data: new Uint8Array(data.slice(0)) });
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setPdfSource(null);
          setUnavailable(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  if (unavailable) {
    return <ComingSoon />;
  }

  return (
    <div
      ref={containerRef}
      className="pdf-container"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {pdfSource ? (
        <Document
          file={pdfSource}
          options={pdfOptions}
          onLoadSuccess={({ numPages: nextNumPages }) => setNumPages(nextNumPages)}
          onLoadError={() => setUnavailable(true)}
          loading={<div className="pdf-loading">{loadingText}</div>}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={pageWidth}
            />
          ))}
        </Document>
      ) : (
        <div className="pdf-loading">{loadingText}</div>
      )}
    </div>
  );
}

export default function PDFViewer() {
  const { examId, paperId } = useParams();
  const { exams, loading } = useExams();
  const [showAnswer, setShowAnswer] = useState(false);
  const answerSectionRef = useRef(null);

  useEffect(() => {
    setShowAnswer(false);
  }, [examId, paperId]);

  useEffect(() => {
    if (showAnswer) {
      answerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showAnswer]);

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
  const questionPdf = (paper?.questionPdf || paper?.questionPDF || "").trim();
  const answerPdf = (paper?.answerPdf || paper?.answerPDF || "").trim();

  if (!exam || !paper) {
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
        key={`question-${questionPdf || "missing"}`}
        file={questionPdf}
        loadingText="Loading PDF..."
      />

      {showAnswer ? (
        <div className="answer-section" ref={answerSectionRef}>
          <h3>Answer Key</h3>
          <ReadOnlyPdf
            key={`answer-${answerPdf || "missing"}`}
            file={answerPdf}
            loadingText="Loading Answer PDF..."
          />
        </div>
      ) : (
        <button className="show-answer-btn" type="button" onClick={() => setShowAnswer(true)}>
          Show Answer
        </button>
      )}
    </div>
  );
}
