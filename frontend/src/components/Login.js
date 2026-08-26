import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const validUser = process.env.REACT_APP_USERNAME;
    const validPass = process.env.REACT_APP_PASSWORD;
    const secret = process.env.REACT_APP_SECRET;

    if (username === validUser && password === validPass) {
      sessionStorage.setItem("secret", secret);
      navigate("/exams");
    } else {
      setError(true);
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
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
