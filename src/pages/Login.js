// src/components/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const errorStyle = { color: "red", marginTop: 4, marginBottom: 8 };

function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log("TRACKING: User visited Login page");
  }, []);

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        console.log("TRACKING: User logged in at", new Date().toISOString());
        // ✅ Save token and user to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Optional callback
        if (onLogin) onLogin(data.token, data.user);

        // Redirect to home or projects page
        navigate("/");
      } else {
        console.log("TRACKING: Failed login attempt at", new Date().toISOString());
        setErrors({ general: data.msg || "Login failed" });
      }
    } catch {
      setErrors({ general: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400 }}>
      <h1>Login</h1>
      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors }) => (
          <Form>
            <label htmlFor="username">Username</label>
            <Field
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
            />
            <ErrorMessage name="username" component="div" style={errorStyle} />

            <label htmlFor="password">Password</label>
            <Field
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <ErrorMessage name="password" component="div" style={errorStyle} />

            <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Show password
            </label>

            <button className="button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {errors.general && (
              <p style={errorStyle} role="alert" aria-live="assertive">
                {errors.general}
              </p>
            )}
          </Form>
        )}
      </Formik>

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
