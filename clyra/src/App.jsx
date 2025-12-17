// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import UploadPage from "./Pages/UploadPage";

import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import Dashboard from "./Pages/Dashboard";
import ProjectSetupPage from "./Pages/ProjectSetupPage";
import AuthWrapper from "./Components/auth/AuthWrapper";
import EditorPage from "./Pages/EditorPage";
import ProjectPage from "./Pages/ProjectPage";
import LandingPage from "./Pages/LandingPage";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <AuthWrapper>
                <Dashboard />
              </AuthWrapper>
            }
          />
          <Route path="/projects/:id" element={<ProjectPage />} />


          <Route
            path="/projects/:id/setup"
            element={
              <AuthWrapper>
                <ProjectSetupPage />
              </AuthWrapper>
            }
          />

           {/* Module 2: Dataset Upload */}
          <Route
            path="/projects/:id/upload"
            element={
              <AuthWrapper>
                <UploadPage />
              </AuthWrapper>
            }
          />

          {/* Module 3: Interactive Spreadsheet Editor */}
          <Route
            path="/editor/:datasetId"
            element={
              <AuthWrapper>
                <EditorPage />
              </AuthWrapper>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
