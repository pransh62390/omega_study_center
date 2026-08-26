import React from "react";
import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }) {
  const secret = sessionStorage.getItem("secret");

  if (!secret) {
    return <Navigate to="/" replace />;
  }

  return children;
}
