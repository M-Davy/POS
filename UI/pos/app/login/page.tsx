
"use client";

import { useState } from "react";
import { FaUser, FaLock, FaSignInAlt, FaGoogle, FaFacebookF } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const data = { username, password };
    try {
      const response = await fetch("http://127.0.0.1:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("token", result.token);
        setMessage("Login successful! Redirecting...");
        setMessageType("success");
        setTimeout(() => {
          if (result.is_admin) {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/dashboard";
          }
        }, 1500);
      } else {
        setMessage(result.error || "Login failed. Please check your credentials.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("A network error occurred. Please check your connection.");
      setMessageType("error");
    }
  };

  return (
    <div className="slide-in">
      <div className="card">
        <div className="image-side">
          <Image src="/images/groceries.jpeg" alt="Groceries" width={400} height={500} className="main-image" />
        </div>
        <div className="form-side">
          <div className="title-with-logo">
            <Image src="/images/logo.jpeg" alt="Logo" width={50} height={50} className="title-logo" />
            <h1>ESIT GROCERIES</h1>
          </div>
          <form id="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Email Address"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <FaUser className="icon" />
            </div>
            <div className="form-group">
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <FaLock className="icon" />
            </div>
            <button type="submit" className="btn">
              Login <FaSignInAlt className="arrow-icon" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
