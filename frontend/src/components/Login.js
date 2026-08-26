import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function parseUsers(data) {
  const list = Array.isArray(data) ? data : data?.users || data?.accounts || [];
  return list
    .map((entry) => ({
      username: String(entry.username || entry.user || entry.email || "").trim(),
      password: String(entry.password || entry.pass || ""),
    }))
    .filter((entry) => entry.username);
}

function matchesFallback(username, password) {
  const validUser = process.env.REACT_APP_USERNAME;
  const validPass = process.env.REACT_APP_PASSWORD;
  return Boolean(validUser && username === validUser && password === validPass);
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const completeLogin = () => {
    sessionStorage.setItem("secret", process.env.REACT_APP_SECRET || "authenticated");
    navigate("/exams");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setSubmitting(true);

    const enteredUser = username.trim();
    const usersUrl = process.env.REACT_APP_USERS_JSON_URL;

    try {
      if (usersUrl) {
        const res = await fetch(usersUrl, { mode: "cors", referrerPolicy: "origin" });
        if (!res.ok) throw new Error("Failed to fetch users");
        const users = parseUsers(await res.json());
        const match = users.find(
          (user) => user.username === enteredUser && user.password === password
        );
        if (match) {
          completeLogin();
          return;
        }
      } else if (matchesFallback(enteredUser, password)) {
        completeLogin();
        return;
      }

      setError(true);
    } catch (err) {
      console.error("Error fetching users from S3:", err);
      if (matchesFallback(enteredUser, password)) {
        completeLogin();
        return;
      }
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Exam Portal</h1>
        {error && <p className="login-error">Wrong username or password</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
