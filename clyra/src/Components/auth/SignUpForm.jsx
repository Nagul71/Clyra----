// src/components/auth/SignupForm.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await signup({ email, password, name });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      const user = session?.data?.session?.user;
      if (user) {
        await supabase.from("profiles").upsert({ id: user.id, name: name }, { returning: "minimal" });
      }
    } catch (e) {
      // non-fatal
      console.warn("profile create issue", e);
    }

    // redirect
    navigate("/dashboard");
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Asha Kumar"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="At least 8 characters"
        />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <div className="text-center">
        <a 
          className="text-xs text-gray-600 hover:text-gray-900 transition-colors" 
          href="/login"
        >
          Already have an account? <span className="medium">Sign in</span>
        </a>
      </div>
    </form>
  );
}