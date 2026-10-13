"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRegister() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000";

  const handleRegister = async () => {
    setMessage("");

    if (!name || !email || !password || !adminCode) {
      setMessage("Please fill in every field.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/users/admin/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            admin_code: adminCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Could not create the administrator account."
        );
        setLoading(false);
        return;
      }

      router.push("/admin-login");
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the backend.");
    }

    setLoading(false);
  };

  const inputClass =
    "mt-2 mb-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]";
  const labelClass =
    "text-xs uppercase tracking-[0.2em] text-white/35";

  return (
    <main className="min-h-screen bg-[#070507] text-[#f5e8e8]">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
              StudyBuddy AI
            </p>

            <h1 className="mt-4 font-[var(--font-cormorant)] text-5xl">
              Create Admin
            </h1>

            <p className="mt-3 text-sm text-white/35">
              An administrator registration code is required.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#8b1234]/30 bg-[#110b0f] p-8">
            <label className={labelClass}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className={inputClass}
            />

            <label className={labelClass}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className={inputClass}
            />

            <label className={labelClass}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={inputClass}
            />

            <label className={labelClass}>Registration Code</label>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRegister();
                }
              }}
              placeholder="Registration code"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]"
            />

            <button
              onClick={handleRegister}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-[#8b1234] py-3.5 text-sm font-medium transition hover:bg-[#b21e45] disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Admin Account"}
            </button>

            {message && (
              <p className="mt-4 text-center text-sm text-[#c98296]">
                {message}
              </p>
            )}

            <button
              onClick={() => router.push("/admin-login")}
              className="mt-5 w-full text-center text-xs text-[#c9a56a] hover:text-[#e3c88f]"
            >
              ← Back to admin login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
