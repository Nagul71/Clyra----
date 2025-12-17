// src/pages/SignupPage.jsx
import React from "react";
import SignupForm from "../Components/auth/SignUpForm";
import { Sparkles } from "lucide-react";

export default function SignupPage() {
  return (
    
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-6">
      
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold">Create your Clyra account</h1>
        <p className="mt-2 text-sm text-gray-500">Start by creating a project and picking a ML goal</p>

        <div className="mt-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}