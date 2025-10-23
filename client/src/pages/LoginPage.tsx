import React from "react";
import "./LoginPage.css"; // Import the CSS file

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">
          New here? <a href="#">Sign up</a>
        </p>

        <input
          type="text"
          placeholder="Email or phone number"
          className="login-input"
        />

        <button className="continue-btn">Continue</button>

        <div className="divider">
          <span>or</span>
        </div>

        <button className="forgotpassword-btn">
          Forgot Password
        </button>
      </div>
    </div>
  );
}
