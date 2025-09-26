import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await fetch('https://task-manager-backend-407e.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        const data = await response.json();
        onLogin(data.token);
        navigate("/");
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.msg || "Login failed" });
      }
    } catch (err) {
      setErrors({ general: "Network error" });
    }
    setSubmitting(false);
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
            <ErrorMessage name="username" component="div" style={{ color: 'red' }} />

            <label htmlFor="password">Password</label>
            <Field
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <ErrorMessage name="password" component="div" style={{ color: 'red' }} />

            <label>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Show password
            </label>
            <button className="button" type="submit" disabled={isSubmitting}>Login</button>
            {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
          </Form>
        )}
      </Formik>
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
}

export default Login;