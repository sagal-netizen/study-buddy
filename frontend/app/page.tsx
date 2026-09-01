"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#080508] text-[#f5e8e8]">

      <div className="flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-3xl text-center">

          <p className="text-xs uppercase tracking-[0.4em] text-[#c9a56a]">
            Welcome to
          </p>

          <h1 className="mt-5 font-[var(--font-cormorant)] text-7xl">
            Study<span className="text-[#b21e45]">Buddy</span>
            <span className="ml-3 text-2xl text-[#c9a56a]">
              AI
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/40">
            Your personal learning space. Explore courses,
            discover chapters, and learn at your own pace.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

            <button
              onClick={() => router.push("/login")}
              className="rounded-full bg-[#8b1234] px-8 py-3.5 text-sm font-medium transition hover:bg-[#b21e45]"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/register")}
              className="rounded-full border border-[#8b1234]/50 px-8 py-3.5 text-sm text-[#e7b8c4] transition hover:bg-[#8b1234]/10"
            >
              Sign Up
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full border border-white/10 px-8 py-3.5 text-sm text-white/50 transition hover:border-white/20 hover:text-white"
            >
              Enter StudyBuddy →
            </button>

          </div>

          <p className="mt-10 text-xs text-white/20">
            Learn beautifully. Learn your way.
          </p>

        </div>

      </div>

    </main>
  );
}