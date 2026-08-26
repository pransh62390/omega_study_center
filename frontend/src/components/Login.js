import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import localUsers from "../../users.json";
import { fetchFresh } from "../fetchFresh";

function userList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  return [];
}

function parseUsers(data) {
  return userList(data)
    .map((entry) => ({
      username: String(entry.username || "").trim(),
      password: String(entry.password || ""),
    }))
    .filter((entry) => entry.username);
}

function credentialsMatch(users, username, password) {
  const enteredUser = username.trim();
  return users.some(
    (user) => user.username === enteredUser && user.password === password
  );
}

function matchesFallback(username, password) {
  const validUser = process.env.REACT_APP_USERNAME;
  const validPass = process.env.REACT_APP_PASSWORD;
  return Boolean(validUser && username === validUser && password === validPass);
}

async function loadUsers() {
  const usersUrl = process.env.REACT_APP_USERS_JSON_URL;
  if (usersUrl) {
    try {
      const res = await fetchFresh(usersUrl, { mode: "cors", referrerPolicy: "origin" });
      if (res.ok) {
        return parseUsers(await res.json());
      }
    } catch (err) {
      console.error("Error fetching users from S3:", err);
    }
  }
  return parseUsers(localUsers);
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

    try {
      const users = await loadUsers();
      if (
        credentialsMatch(users, enteredUser, password) ||
        matchesFallback(enteredUser, password)
      ) {
        completeLogin();
        return;
      }
      setError(true);
    } catch (err) {
      console.error("Error checking credentials:", err);
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
