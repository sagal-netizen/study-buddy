"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AITutorPage() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  const askLyra = async () => {
    if (!question.trim() || loading) {
      return;
    }

    const userQuestion = question.trim();

    setQuestion("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/ai/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${
              typeof window !== "undefined"
                ? (localStorage.getItem("access_token") ?? "")
                : ""
            }`,
          },
          body: JSON.stringify({
            question: userQuestion,
          }),
        }
      );

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data.answer ||
            "I'm not sure about that yet.",
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I couldn't connect to Lyra right now. Please make sure the backend and Ollama are running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070507] text-[#f5e8e8]">

      <header className="border-b border-white/[0.06] bg-[#0b070a] px-6 py-5">

        <div className="mx-auto flex max-w-5xl items-center justify-between">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="font-[var(--font-cormorant)] text-2xl"
          >
            Study
            <span className="text-[#b21e45]">
              Buddy
            </span>

            <span className="ml-2 text-xs tracking-[0.3em] text-[#c9a56a]">
              AI
            </span>
          </button>

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="text-xs text-white/35 hover:text-white"
          >
            ← Dashboard
          </button>

        </div>

      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">

        <div className="text-center">

          <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
            your personal study companion
          </p>

          <h1 className="mt-3 font-[var(--font-cormorant)] text-6xl">
            Ask{" "}
            <span className="italic text-[#b21e45]">
              Lyra
            </span>{" "}
            ✦
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/35">
            Ask about your studies, get concepts
            explained simply, work through problems,
            or just talk through something you're
            struggling with.
          </p>

        </div>

        <div className="mt-10 min-h-[420px] rounded-[2rem] border border-white/[0.07] bg-[#100b0e] p-6 md:p-8">

          {messages.length === 0 ? (

            <div className="flex min-h-[350px] items-center justify-center text-center">

              <div>

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#8b1234]/15 text-2xl text-[#c9a56a]">
                  ✦
                </div>

                <h2 className="mt-5 font-[var(--font-cormorant)] text-3xl">
                  What are you curious about?
                </h2>

                <p className="mt-2 text-sm text-white/25">
                  Try "Explain vectors like I'm
                  five" or "I'm stuck on Python."
                </p>

              </div>

            </div>

          ) : (

            <div className="space-y-5">

              {messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={`flex ${
                      message.role ===
                      "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-7 ${
                        message.role ===
                        "user"
                          ? "bg-[#8b1234] text-white"
                          : "border border-white/[0.07] bg-white/[0.02] text-white/55"
                      }`}
                    >
                      {message.content}
                    </div>

                  </div>
                )
              )}

              {loading && (

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 text-sm text-white/30">
                  Lyra is thinking ✦
                </div>

              )}

            </div>

          )}

        </div>

        <div className="mt-5 flex gap-3">

          <input
            value={question}
            onChange={(e) =>
              setQuestion(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                askLyra();
              }
            }}
            placeholder="Ask Lyra anything..."
            className="flex-1 rounded-2xl border border-white/10 bg-[#100b0e] px-5 py-4 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]/50"
          />

          <button
            onClick={askLyra}
            disabled={
              loading ||
              !question.trim()
            }
            className="rounded-2xl bg-[#8b1234] px-7 py-4 text-sm transition hover:bg-[#b21e45] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ask ✦
          </button>

        </div>

      </div>

    </main>
  );
}