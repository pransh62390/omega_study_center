import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useExams from "../hooks/useExams";

export default function Landing() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const { exams, loading } = useExams();

  const handleLogout = () => {
    sessionStorage.removeItem("secret");
    navigate("/");
  };

  return (
    <div className="landing">
      <header className="top-bar">
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h2>Exam Portal</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}>
          <nav className="sidebar" onClick={(e) => e.stopPropagation()}>
            <h3>Exams</h3>
            <ul>
              {loading ? (
                <li>Loading exams...</li>
              ) : exams.map((exam) => (
                <li key={exam.id}>
                  <Link
                    to={`/exams/${exam.id}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {exam.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <main className="landing-content">
        <h1>Welcome</h1>
        <p>Select an exam from the menu to view papers.</p>
        <div className="exam-grid">
          {loading ? (
            <p>Loading exams...</p>
          ) : exams.map((exam) => (
            <Link
              to={`/exams/${exam.id}`}
              key={exam.id}
              className="exam-card"
            >
              <h3>{exam.name}</h3>
              <p>
                {exam.papers.length} paper{exam.papers.length !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
