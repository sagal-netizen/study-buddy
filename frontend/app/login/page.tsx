"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.access_token) {
        localStorage.setItem(
          "access_token",
          data.access_token
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      router.push("/dashboard");

    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to StudyBuddy. Make sure the backend is running."
      );
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#080508] px-6 text-[#f5e8e8]">

      <div className="flex min-h-screen items-center justify-center">

        <div className="w-full max-w-md">

          <div className="mb-10 text-center">

            <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
              StudyBuddy AI
            </p>

            <h1 className="mt-4 font-[var(--font-cormorant)] text-5xl">
              Welcome back.
            </h1>

            <p className="mt-3 text-sm text-white/35">
              Your learning space is waiting for you.
            </p>

          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#110b0f] p-8">

            <label className="text-xs uppercase tracking-[0.2em] text-white/35">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 mb-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]"
            />

            <label className="text-xs uppercase tracking-[0.2em] text-white/35">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
              placeholder="Your password"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]"
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-[#8b1234] py-3.5 text-sm font-medium transition hover:bg-[#b21e45] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {message && (
              <p className="mt-4 text-center text-sm text-[#c98296]">
                {message}
              </p>
            )}

            <div className="mt-6 border-t border-white/5 pt-5 text-center">

              <p className="text-sm text-white/30">
                New to StudyBuddy?
              </p>

              <button
                onClick={() => router.push("/register")}
                className="mt-2 text-sm text-[#c98296] hover:text-white"
              >
                Create an account →
              </button>

            </div>

          </div>

          <button
            onClick={() => router.push("/")}
            className="mt-6 block w-full text-center text-xs text-white/25 hover:text-white/50"
          >
            ← Back to home
          </button>

        </div>

      </div>

    </main>
  );
}