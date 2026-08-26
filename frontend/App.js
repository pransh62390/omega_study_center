import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Login from "./src/components/Login";
import Landing from "./src/components/Landing";
import Papers from "./src/components/Papers";
import PDFViewer from "./src/components/PDFViewer";
import AuthGuard from "./src/components/AuthGuard";

const CatchAll = () => {
  const secret = sessionStorage.getItem("secret");
  return <Navigate to={secret ? "/exams" : "/"} replace />;
};

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || ""}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/exams"
          element={
            <AuthGuard>
              <Landing />
            </AuthGuard>
          }
        />
        <Route
          path="/exams/:examId"
          element={
            <AuthGuard>
              <Papers />
            </AuthGuard>
          }
        />
        <Route
          path="/exams/:examId/:paperId"
          element={
            <AuthGuard>
              <PDFViewer />
            </AuthGuard>
          }
        />
        <Route path="*" element={<CatchAll />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
