// src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
const { login } = useAuth();
const navigate = useNavigate();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);


const handleSubmit = async (e) => {
e.preventDefault();
setError(null);
setLoading(true);
const { data, error } = await login({ email, password });
setLoading(false);
if (error) {
setError(error.message);
return;
}
// redirect to dashboard
navigate("/dashboard");
};


return (
<form className="space-y-4" onSubmit={handleSubmit}>
<div>
<label className="block text-sm font-medium">Email</label>
<input
required
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="you@company.com"
/>
</div>


<div>
<label className="block text-sm font-medium">Password</label>
<input
required
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
placeholder="••••••••"
/>
</div>


{error && <div className="text-sm text-red-600">{error}</div>}


<div className="flex items-center justify-between">
<button
type="submit"
className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
disabled={loading}
>
{loading ? "Signing in..." : "Sign in"}
</button>
<a className="text-sm text-indigo-600 hover:underline" href="/signup">
Create account
</a>
</div>
</form>
);
}