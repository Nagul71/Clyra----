// src/components/auth/AuthWrapper.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AuthWrapper({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse rounded-md bg-gray-100 px-8 py-6">Checking session…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}