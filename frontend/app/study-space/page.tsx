"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8000";

type Theme =
  | "rain"
  | "forest"
  | "midnight"
  | "cafe"
  | "library"
  | "focus";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const themes: {
  id: Theme;
  name: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "rain",
    name: "Rainy",
    icon: "🌧️",
    description: "Soft rain for deep focus",
  },
  {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    description: "A calm natural escape",
  },
  {
    id: "midnight",
    name: "Midnight",
    icon: "🌙",
    description: "Quiet late-night studying",
  },
  {
    id: "cafe",
    name: "Cozy Café",
    icon: "☕",
    description: "Warm and comforting",
  },
  {
    id: "library",
    name: "Library",
    icon: "📚",
    description: "Classic academic atmosphere",
  },
  {
    id: "focus",
    name: "Pure Focus",
    icon: "✦",
    description: "Minimal distractions",
  },
];

export default function StudySpacePage() {
  const router = useRouter();

  const [theme, setTheme] =
    useState<Theme>("rain");

  const [seconds, setSeconds] =
    useState(25 * 60);

  const [running, setRunning] =
    useState(false);

  const [isBreak, setIsBreak] =
    useState(false);

  const [showThemes, setShowThemes] =
    useState(false);

  const [showTutor, setShowTutor] =
    useState(false);

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [aiLoading, setAiLoading] =
    useState(false);

  const [breakMessage, setBreakMessage] =
    useState("");

  /* ============================================================
     TIMER
  ============================================================ */

  useEffect(() => {
    if (!running || isBreak) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((previous) => {
        if (previous <= 1) {
          setRunning(false);
          setIsBreak(true);
          setBreakMessage(
            "Your focus session is complete. Take a little break. ✦"
          );
          return 25 * 60;
        }

        return previous - 1;
      });
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [running, isBreak]);

  /* ============================================================
     FORMAT TIMER
  ============================================================ */

  const minutes =
    Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

  const remainingSeconds =
    (seconds % 60)
      .toString()
      .padStart(2, "0");

  /* ============================================================
     THEME
  ============================================================ */

  const currentTheme = useMemo(
    () =>
      themes.find(
        (item) => item.id === theme
      ) || themes[0],
    [theme]
  );

  /* ============================================================
     TIMER CONTROLS
  ============================================================ */

  const toggleFocus = () => {
    if (isBreak) {
      return;
    }

    setRunning(
      (previous) => !previous
    );
  };

  const resetTimer = () => {
    setRunning(false);
    setIsBreak(false);
    setBreakMessage("");
    setSeconds(25 * 60);
  };

  const takeBreak = () => {
    setRunning(false);
    setIsBreak(true);
    setBreakMessage(
      "Focus paused. Breathe, stretch, grab some water — you're allowed to take a moment."
    );
  };

  const resumeFocus = () => {
    setIsBreak(false);
    setBreakMessage("");
    setRunning(true);
  };

  /* ============================================================
     AI TUTOR
  ============================================================ */

  const askLyra = async () => {
    if (!question.trim() || aiLoading) {
      return;
    }

    const userQuestion =
      question.trim();

    setQuestion("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setAiLoading(true);

    try {
      const response = await fetch(
        `${API}/ai/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            question: userQuestion,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to contact Lyra."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data.answer ||
            "I'm not sure about that yet.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I couldn't connect to Lyra right now. Please make sure the backend and Ollama are running.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  /* ============================================================
     THEME BACKGROUND
  ============================================================ */

  const backgroundClass =
    theme === "rain"
      ? "bg-gradient-to-br from-[#071017] via-[#0b1118] to-[#08090e]"
      : theme === "forest"
      ? "bg-gradient-to-br from-[#07100b] via-[#0c1710] to-[#070b09]"
      : theme === "midnight"
      ? "bg-gradient-to-br from-[#070814] via-[#0b0d20] to-[#05060d]"
      : theme === "cafe"
      ? "bg-gradient-to-br from-[#1b100b] via-[#20140e] to-[#100a08]"
      : theme === "library"
      ? "bg-gradient-to-br from-[#17100b] via-[#19120d] to-[#0d0907]"
      : "bg-[#070507]";

  return (
    <main
      className={`relative min-h-screen overflow-hidden text-[#f5e8e8] transition-all duration-700 ${backgroundClass}`}
    >
      {/* ========================================================
          ANIMATED ENVIRONMENT
      ======================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* RAIN */}

        {theme === "rain" && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(92,145,180,0.16),transparent_30%),radial-gradient(circle_at_80%_60%,rgba(40,80,110,0.12),transparent_35%)]" />

            <div className="rain-layer absolute inset-0 opacity-60">
              {Array.from({
                length: 80,
              }).map((_, index) => (
                <span
                  key={index}
                  className="rain-drop"
                  style={{
                    left: `${
                      (index * 37) % 100
                    }%`,
                    animationDelay: `${
                      (index % 12) * 0.13
                    }s`,
                    animationDuration: `${
                      0.7 +
                      (index % 5) * 0.15
                    }s`,
                  }}
                />
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#05070a] to-transparent" />
          </>
        )}

        {/* FOREST */}

        {theme === "forest" && (
          <>
            <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-emerald-900/20 blur-[100px]" />

            <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-green-900/20 blur-[120px]" />

            <div className="leaf-one absolute left-[15%] top-[20%] text-4xl opacity-20">
              🍃
            </div>

            <div className="leaf-two absolute left-[70%] top-[30%] text-3xl opacity-20">
              🍃
            </div>

            <div className="leaf-three absolute left-[45%] top-[65%] text-5xl opacity-10">
              🍂
            </div>
          </>
        )}

        {/* MIDNIGHT */}

        {theme === "midnight" && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(91,91,180,0.18),transparent_40%)]" />

            {Array.from({
              length: 35,
            }).map((_, index) => (
              <span
                key={index}
                className="twinkle-star absolute h-1 w-1 rounded-full bg-white/60"
                style={{
                  left: `${
                    (index * 29) % 100
                  }%`,
                  top: `${
                    (index * 43) % 85
                  }%`,
                  animationDelay: `${
                    index * 0.12
                  }s`,
                }}
              />
            ))}

            <div className="absolute right-[12%] top-[12%] text-7xl opacity-20">
              ☾
            </div>
          </>
        )}

        {/* CAFE */}

        {theme === "cafe" && (
          <>
            <div className="absolute left-[10%] top-[15%] h-96 w-96 rounded-full bg-orange-900/20 blur-[110px]" />

            <div className="absolute right-[5%] bottom-[10%] h-80 w-80 rounded-full bg-amber-700/10 blur-[100px]" />

            <div className="steam-one absolute left-[22%] top-[25%] text-5xl opacity-10">
              ☕
            </div>

            <div className="steam-two absolute right-[22%] top-[45%] text-4xl opacity-10">
              ☕
            </div>
          </>
        )}

        {/* LIBRARY */}

        {theme === "library" && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,165,106,0.12),transparent_38%)]" />

            <div className="absolute left-[8%] top-[20%] text-8xl opacity-[0.035]">
              📚
            </div>

            <div className="absolute right-[8%] bottom-[15%] text-8xl opacity-[0.035]">
              📖
            </div>
          </>
        )}

        {/* FOCUS */}

        {theme === "focus" && (
          <>
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8b1234]/10 blur-[130px]" />
          </>
        )}

        {/* DARK OVERLAY */}

        <div className="absolute inset-0 bg-black/25" />

      </div>

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <header className="relative z-30 border-b border-white/[0.06] bg-black/20 px-6 py-5 backdrop-blur-xl">

        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <button
            type="button"
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

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setShowThemes(
                  (previous) =>
                    !previous
                )
              }
              className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/60 transition hover:border-[#c9a56a]/40 hover:text-[#c9a56a]"
            >
              {currentTheme.icon}{" "}
              {currentTheme.name}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              className="text-xs text-white/35 transition hover:text-white"
            >
              ← Dashboard
            </button>

          </div>

        </div>

      </header>

      {/* ========================================================
          THEME PICKER
      ======================================================== */}

      {showThemes && (
        <div className="relative z-40 mx-auto max-w-6xl px-6 pt-5">

          <div className="rounded-3xl border border-white/10 bg-[#0d090c]/95 p-5 shadow-2xl backdrop-blur-xl">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                  choose your environment
                </p>

                <p className="mt-1 text-xs text-white/25">
                  Change the atmosphere whenever
                  you need a different kind of focus.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowThemes(false)
                }
                className="text-white/30 hover:text-white"
              >
                ×
              </button>

            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {themes.map(
                (item) => (

                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTheme(
                        item.id
                      );
                      setShowThemes(
                        false
                      );
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      theme === item.id
                        ? "border-[#8b1234]/60 bg-[#8b1234]/15"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-[#c9a56a]/30"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <span className="text-2xl">
                        {item.icon}
                      </span>

                      <div>

                        <p className="text-sm text-white/70">
                          {item.name}
                        </p>

                        <p className="mt-1 text-[10px] text-white/25">
                          {item.description}
                        </p>

                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          MAIN
      ======================================================== */}

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">

        <div className="text-center">

          <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
            {isBreak
              ? "slow down · breathe · reset"
              : running
              ? "deep focus"
              : "your personal focus environment"}
          </p>

          <h1 className="mt-3 font-[var(--font-cormorant)] text-6xl md:text-7xl">
            {isBreak ? (
              <>
                Take a{" "}
                <span className="italic text-[#b21e45]">
                  little break.
                </span>
              </>
            ) : (
              <>
                Study{" "}
                <span className="italic text-[#b21e45]">
                  your way.
                </span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/35">
            {isBreak
              ? "Your timer is paused. Rest for a moment or talk to Lyra if you feel like it."
              : `${currentTheme.description}. Settle in, start your timer, and let everything else wait.`}
          </p>

        </div>

        {/* ======================================================
            BREAK BANNER
        ====================================================== */}

        {isBreak && (
          <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-[#c9a56a]/20 bg-[#c9a56a]/5 p-6 text-center">

            <span className="text-3xl">
              ☕
            </span>

            <p className="mt-3 text-sm leading-6 text-white/50">
              {breakMessage}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">

              <button
                type="button"
                onClick={resumeFocus}
                className="rounded-full bg-[#8b1234] px-6 py-3 text-sm hover:bg-[#b21e45]"
              >
                Resume Focus →
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowTutor(true)
                }
                className="rounded-full border border-white/10 px-6 py-3 text-sm text-white/50 hover:border-[#c9a56a]/30 hover:text-[#c9a56a]"
              >
                Talk to Lyra ✦
              </button>

            </div>

          </div>
        )}

        {/* ======================================================
            TIMER
        ====================================================== */}

        <section className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-white/[0.08] bg-black/25 p-8 text-center shadow-2xl backdrop-blur-md md:p-12">

          <div className="flex items-center justify-between">

            <div className="text-left">

              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                {isBreak
                  ? "paused"
                  : "Pomodoro Focus"}
              </p>

              <p className="mt-2 text-xs text-white/25">
                {running
                  ? "Stay with it. You've got this."
                  : isBreak
                  ? "Focus session paused."
                  : "Ready when you are."}
              </p>

            </div>

            <span className="text-2xl">
              {currentTheme.icon}
            </span>

          </div>

          <div
            className={`mt-8 font-[var(--font-cormorant)] text-8xl transition-all duration-500 ${
              running
                ? "text-[#c98296]"
                : "text-white/50"
            }`}
          >
            {minutes}:{remainingSeconds}
          </div>

          <div className="mx-auto mt-7 h-1.5 max-w-xl overflow-hidden rounded-full bg-white/5">

            <div
              className="h-full rounded-full bg-[#8b1234] transition-all duration-1000"
              style={{
                width: `${
                  ((25 * 60 -
                    seconds) /
                    (25 * 60)) *
                  100
                }%`,
              }}
            />

          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            {!isBreak && (
              <button
                type="button"
                onClick={toggleFocus}
                className="rounded-full bg-[#8b1234] px-8 py-3.5 text-sm shadow-[0_0_30px_rgba(139,18,52,0.25)] transition hover:bg-[#b21e45]"
              >
                {running
                  ? "Pause Focus"
                  : "Start Focus"}
              </button>
            )}

            {!isBreak && (
              <button
                type="button"
                onClick={takeBreak}
                className="rounded-full border border-[#c9a56a]/20 bg-[#c9a56a]/5 px-7 py-3.5 text-sm text-[#c9a56a] transition hover:bg-[#c9a56a]/10"
              >
                ☕ Take a Break
              </button>
            )}

            {isBreak && (
              <button
                type="button"
                onClick={resumeFocus}
                className="rounded-full bg-[#8b1234] px-8 py-3.5 text-sm hover:bg-[#b21e45]"
              >
                Resume Focus
              </button>
            )}

            <button
              type="button"
              onClick={resetTimer}
              className="rounded-full border border-white/10 px-7 py-3.5 text-sm text-white/45 transition hover:text-white"
            >
              Reset
            </button>

          </div>

        </section>

        {/* ======================================================
            STUDY CONTROLS
        ====================================================== */}

        <div className="mx-auto mt-6 grid max-w-3xl gap-4 md:grid-cols-2">

          <button
            type="button"
            onClick={() =>
              setShowThemes(
                (previous) =>
                  !previous
              )
            }
            className="rounded-3xl border border-white/[0.07] bg-black/20 p-6 text-left backdrop-blur-md transition hover:-translate-y-1 hover:border-[#c9a56a]/30"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a56a]">
                  environment
                </p>

                <h2 className="mt-2 font-[var(--font-cormorant)] text-2xl">
                  {currentTheme.icon}{" "}
                  {currentTheme.name}
                </h2>

                <p className="mt-1 text-xs text-white/25">
                  Change your study atmosphere
                </p>

              </div>

              <span className="text-white/20">
                →
              </span>

            </div>

          </button>

          <button
            type="button"
            onClick={() =>
              setShowTutor(true)
            }
            className="rounded-3xl border border-[#8b1234]/20 bg-[#8b1234]/5 p-6 text-left backdrop-blur-md transition hover:-translate-y-1 hover:border-[#8b1234]/50"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a56a]">
                  need help?
                </p>

                <h2 className="mt-2 font-[var(--font-cormorant)] text-2xl">
                  Ask Lyra ✦
                </h2>

                <p className="mt-1 text-xs text-white/25">
                  Ask a doubt without leaving Study Space
                </p>

              </div>

              <span className="text-[#b21e45]">
                ✦
              </span>

            </div>

          </button>

        </div>

      </div>

      {/* ========================================================
          FLOATING LYRA BUTTON
      ======================================================== */}

      {!showTutor && (
        <button
          type="button"
          onClick={() =>
            setShowTutor(true)
          }
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-[#8b1234]/40 bg-[#180b10]/95 px-5 py-3 text-sm shadow-2xl backdrop-blur-xl transition hover:scale-105 hover:bg-[#8b1234]"
        >
          <span className="text-[#c9a56a]">
            ✦
          </span>
          Ask Lyra
        </button>
      )}

      {/* ========================================================
          LYRA PANEL
      ======================================================== */}

      {showTutor && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-4 backdrop-blur-sm md:items-center">

          <div className="flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d090c] shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#120a0f] p-5">

              <div>

                <p className="text-[9px] uppercase tracking-[0.3em] text-[#c9a56a]">
                  StudyBuddy AI
                </p>

                <h2 className="mt-1 font-[var(--font-cormorant)] text-2xl">
                  Lyra ✦
                </h2>

                <p className="text-[10px] text-white/25">
                  {isBreak
                    ? "Break conversation"
                    : "Study doubt assistant"}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowTutor(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white"
              >
                ×
              </button>

            </div>

            {/* MESSAGES */}

            <div className="flex-1 overflow-y-auto p-5">

              {messages.length === 0 ? (

                <div className="flex h-full items-center justify-center text-center">

                  <div>

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8b1234]/15 text-xl text-[#c9a56a]">
                      ✦
                    </div>

                    <h3 className="mt-5 font-[var(--font-cormorant)] text-2xl">
                      {isBreak
                        ? "Need a little company?"
                        : "Stuck on something?"}
                    </h3>

                    <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-white/25">

                      {isBreak
                        ? "Talk to Lyra while you take your break. You can return to focus whenever you're ready."
                        : "Ask me about the concept you're studying. I'll help you understand it without making you leave your focus space."}

                    </p>

                  </div>

                </div>

              ) : (

                <div className="space-y-4">

                  {messages.map(
                    (
                      message,
                      index
                    ) => (

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
                          className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
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

                  {aiLoading && (
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm text-white/25">
                      Lyra is thinking ✦
                    </div>
                  )}

                </div>

              )}

            </div>

            {/* INPUT */}

            <div className="border-t border-white/[0.07] bg-[#100b0e] p-4">

              <div className="flex gap-2">

                <input
                  value={question}
                  onChange={(event) =>
                    setQuestion(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      askLyra();
                    }
                  }}
                  placeholder={
                    isBreak
                      ? "Talk to Lyra..."
                      : "Ask your study doubt..."
                  }
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]/50"
                />

                <button
                  type="button"
                  onClick={askLyra}
                  disabled={
                    aiLoading ||
                    !question.trim()
                  }
                  className="rounded-xl bg-[#8b1234] px-4 text-sm transition hover:bg-[#b21e45] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  →
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          ANIMATION STYLES
      ======================================================== */}

      <style jsx>{`
        .rain-drop {
          position: absolute;
          top: -40px;
          width: 1px;
          height: 35px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(180, 215, 235, 0.5)
          );
          transform: rotate(14deg);
          animation: rainFall linear infinite;
        }

        @keyframes rainFall {
          from {
            transform: translateY(-50px)
              translateX(0)
              rotate(14deg);
          }

          to {
            transform: translateY(110vh)
              translateX(-70px)
              rotate(14deg);
          }
        }

        .twinkle-star {
          animation: twinkle 2.5s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.15;
            transform: scale(0.8);
          }

          50% {
            opacity: 0.8;
            transform: scale(1.3);
          }
        }

        .leaf-one {
          animation: leafFloatOne 7s ease-in-out infinite;
        }

        .leaf-two {
          animation: leafFloatTwo 9s ease-in-out infinite;
        }

        .leaf-three {
          animation: leafFloatThree 8s ease-in-out infinite;
        }

        @keyframes leafFloatOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0)
              rotate(0deg);
          }

          50% {
            transform: translate3d(
                35px,
                25px,
                0
              )
              rotate(12deg);
          }
        }

        @keyframes leafFloatTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0)
              rotate(0deg);
          }

          50% {
            transform: translate3d(
                -30px,
                40px,
                0
              )
              rotate(-15deg);
          }
        }

        @keyframes leafFloatThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0)
              rotate(0deg);
          }

          50% {
            transform: translate3d(
                25px,
                -30px,
                0
              )
              rotate(18deg);
          }
        }

        .steam-one {
          animation: steam 5s ease-in-out infinite;
        }

        .steam-two {
          animation: steam 6s ease-in-out infinite
            1s;
        }

        @keyframes steam {
          0%,
          100% {
            transform: translateY(10px)
              scale(0.9);
            opacity: 0.05;
          }

          50% {
            transform: translateY(-25px)
              scale(1.1);
            opacity: 0.16;
          }
        }
      `}</style>
    </main>
  );
}