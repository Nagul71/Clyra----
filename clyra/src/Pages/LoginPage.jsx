// src/pages/LoginPage.jsx
import React from "react";
import LoginForm from "../Components/auth/LoginForm";
import { Sparkles } from "lucide-react";
export default function LoginPage() {

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold">Clyra</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold mb-3">
              Welcome back
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to continue to Clyra
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <LoginForm />
          </div>

          {/* Footer Text */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to Clyra's{" "}
            <a href="#" className="text-black hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-black hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        © 2024 Clyra. All rights reserved.
      </div>
    </div>
  );
}


