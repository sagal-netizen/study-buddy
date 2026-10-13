"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000";

  const handleLogin = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/users/login`,
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
        setMessage(
          data.detail || "Invalid email or password."
        );
        setLoading(false);
        return;
      }

      if (data.user?.role !== "admin") {
        setMessage(
          "You do not have administrator access."
        );
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "admin_user",
        JSON.stringify(data.user)
      );

      if (data.access_token) {
        localStorage.setItem(
          "admin_access_token",
          data.access_token
        );
      }

      router.push("/admin");

    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the backend."
      );
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#070507] text-[#f5e8e8]">

      <div className="flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-md">

          <div className="mb-10 text-center">

            <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
              StudyBuddy AI
            </p>

            <h1 className="mt-4 font-[var(--font-cormorant)] text-5xl">
              Admin Portal
            </h1>

            <p className="mt-3 text-sm text-white/35">
              Authorized access only.
            </p>

          </div>

          <div className="rounded-[2rem] border border-[#8b1234]/30 bg-[#110b0f] p-8">

            <label className="text-xs uppercase tracking-[0.2em] text-white/35">
              Admin Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@example.com"
              className="mt-2 mb-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]"
            />

            <label className="text-xs uppercase tracking-[0.2em] text-white/35">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
              placeholder="Admin password"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]"
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-[#8b1234] py-3.5 text-sm font-medium transition hover:bg-[#b21e45] disabled:opacity-50"
            >
              {loading
                ? "Verifying..."
                : "Enter Admin Portal"}
            </button>

            {message && (
              <p className="mt-4 text-center text-sm text-[#c98296]">
                {message}
              </p>
            )}

            <button
              onClick={() =>
                router.push("/admin-register")
              }
              className="mt-5 w-full text-center text-xs text-[#c9a56a] hover:text-[#e3c88f]"
            >
              Create Admin Account →
            </button>

          </div>

          <button
            onClick={() => router.push("/")}
            className="mt-6 block w-full text-center text-xs text-white/25 hover:text-white/50"
          >
            ← Back to student website
          </button>

        </div>

      </div>

    </main>
  );
}