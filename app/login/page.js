"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logIn, resendVerificationEmail } from "@/lib/auth"; // Import auth functions

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    setUnverified(false);

    const response = await logIn(email, password);

    if (!response.success) {
      setError(response.message);
      if (response.message.includes("verify your email")) {
        setUnverified(true);
      }
    } else {
      alert("Login successful! Redirecting...");
      router.push("/"); // Redirect to homepage
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    const response = await resendVerificationEmail();
    alert(response.message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="bg-gray-100 p-6 rounded shadow-md w-96">
        <h1 className="text-4xl font-bold text-center mb-4">Login</h1>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full rounded mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full rounded mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 w-full rounded mt-2"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {unverified && (
          <button
            onClick={handleResendVerification}
            className="text-blue-500 mt-2"
          >
            Resend Verification Email
          </button>
        )}

        <p className="text-sm text-center mt-2">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
