"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type QuizHistory = {
  topic: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function QuizzesPage() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(5);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);

  // ============================================================
  // LOAD SAVED QUIZ HISTORY
  // ============================================================

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(
        "studybuddy_quiz_history"
      );

      if (saved) {
        setQuizHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Could not load quiz history:", error);
    }
  };

  // ============================================================
  // SAVE QUIZ RESULT
  // ============================================================

  const saveQuizResult = (
    finalScore: number,
    totalQuestions: number
  ) => {
    try {
      const percentage = Math.round(
        (finalScore / totalQuestions) * 100
      );

      const newResult: QuizHistory = {
        topic,
        score: finalScore,
        total: totalQuestions,
        percentage,
        date: new Date().toLocaleString(),
      };

      const existing =
        JSON.parse(
          localStorage.getItem(
            "studybuddy_quiz_history"
          ) || "[]"
        ) || [];

      const updated = [
        ...existing,
        newResult,
      ];

      localStorage.setItem(
        "studybuddy_quiz_history",
        JSON.stringify(updated)
      );

      setQuizHistory(updated);
    } catch (error) {
      console.error("Could not save quiz result:", error);
    }
  };

  // ============================================================
  // GENERATE QUIZ
  // ============================================================

  const generateQuiz = async () => {
    if (!topic.trim()) {
      setError(
        "Please enter a topic or chapter."
      );
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token") ?? ""
          : "";

      const response = await fetch(
        `${API}/ai/quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            topic: topic.trim(),
            number_of_questions: questionCount,
            difficulty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to generate quiz."
        );
      }

      if (
        !data.questions ||
        data.questions.length === 0
      ) {
        throw new Error(
          "No quiz questions were generated."
        );
      }

      setQuestions(data.questions);

    } catch (error) {
      console.error(error);

      setError(
        "Could not generate the quiz. Make sure the backend and Ollama are running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SELECT ANSWER
  // ============================================================

  const selectAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);

    if (
      index ===
      questions[currentQuestion].answer
    ) {
      setScore(
        (previous) => previous + 1
      );
    }
  };

  // ============================================================
  // NEXT QUESTION
  // ============================================================

  const nextQuestion = () => {
    if (
      currentQuestion + 1 >=
      questions.length
    ) {
      const finalScore =
        score +
        (selectedAnswer ===
        questions[currentQuestion].answer
          ? 1
          : 0);

      setScore(finalScore);
      setFinished(true);

      saveQuizResult(
        finalScore,
        questions.length
      );

      return;
    }

    setCurrentQuestion(
      (previous) => previous + 1
    );

    setSelectedAnswer(null);
  };

  // ============================================================
  // RESET QUIZ
  // ============================================================

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setError("");
  };

  // ============================================================
  // HISTORY STATS
  // ============================================================

  const totalQuizzes =
    quizHistory.length;

  const averageScore =
    totalQuizzes > 0
      ? Math.round(
          quizHistory.reduce(
            (sum, item) =>
              sum + item.percentage,
            0
          ) / totalQuizzes
        )
      : 0;

  const bestScore =
    totalQuizzes > 0
      ? Math.max(
          ...quizHistory.map(
            (item) => item.percentage
          )
        )
      : 0;

  const latestScore =
    totalQuizzes > 0
      ? quizHistory[
          quizHistory.length - 1
        ].percentage
      : 0;

  const previousScore =
    totalQuizzes > 1
      ? quizHistory[
          quizHistory.length - 2
        ].percentage
      : null;

  const growth =
    previousScore !== null
      ? latestScore - previousScore
      : 0;

  const current =
    questions[currentQuestion];

  // Load saved history when page first becomes interactive.
  if (
    typeof window !== "undefined" &&
    quizHistory.length === 0
  ) {
    loadHistory();
  }

  return (
    <main className="min-h-screen bg-[#070507] text-[#f5e8e8]">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[10%] h-80 w-80 rounded-full bg-[#8b1234]/10 blur-[120px]" />

        <div className="absolute right-[5%] top-[45%] h-96 w-96 rounded-full bg-[#c9a56a]/5 blur-[140px]" />

        <div className="absolute bottom-[-10%] left-[35%] h-96 w-96 rounded-full bg-[#b21e45]/5 blur-[140px]" />
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="relative z-10 border-b border-white/[0.06] bg-[#0b070a]/90 px-6 py-5 backdrop-blur-xl">

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

      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12">

        {/* =================================================
            QUIZ SETUP
        ================================================= */}

        {!questions.length &&
          !loading &&
          !finished && (

            <section className="rounded-[2rem] border border-white/[0.07] bg-[#100b0e] p-8 md:p-12">

              <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
                Test your understanding
              </p>

              <h1 className="mt-3 font-[var(--font-cormorant)] text-6xl md:text-7xl">
                Quiz{" "}
                <span className="italic text-[#b21e45]">
                  Me.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/35">
                Let Lyra create an AI-powered
                quiz from your study material
                or any topic you want to practice.
              </p>

              <div className="mt-10 grid gap-5 md:grid-cols-3">

                {/* TOPIC */}

                <div className="md:col-span-3">

                  <label className="text-[10px] uppercase tracking-[0.25em] text-[#c9a56a]">
                    Topic or Chapter
                  </label>

                  <input
                    value={topic}
                    onChange={(e) =>
                      setTopic(e.target.value)
                    }
                    placeholder="Example: Python Chapter 4"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]/60"
                  />

                </div>

                {/* DIFFICULTY */}

                <div>

                  <label className="text-[10px] uppercase tracking-[0.25em] text-[#c9a56a]">
                    Difficulty
                  </label>

                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value
                      )
                    }
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-[#100b0e] px-5 py-4 text-sm outline-none"
                  >

                    <option value="easy">
                      Easy
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="hard">
                      Hard
                    </option>

                  </select>

                </div>

                {/* QUESTION COUNT */}

                <div>

                  <label className="text-[10px] uppercase tracking-[0.25em] text-[#c9a56a]">
                    Questions
                  </label>

                  <select
                    value={questionCount}
                    onChange={(e) =>
                      setQuestionCount(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-[#100b0e] px-5 py-4 text-sm outline-none"
                  >

                    <option value={5}>
                      5 Questions
                    </option>

                    <option value={10}>
                      10 Questions
                    </option>

                  </select>

                </div>

                {/* GENERATE */}

                <div className="flex items-end">

                  <button
                    type="button"
                    onClick={generateQuiz}
                    className="w-full rounded-2xl bg-[#8b1234] px-6 py-4 text-sm transition hover:bg-[#b21e45]"
                  >
                    Generate Quiz ✦
                  </button>

                </div>

              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-[#8b1234]/30 bg-[#8b1234]/10 p-4 text-sm text-[#c98296]">
                  {error}
                </div>
              )}

              {/* GROWTH SNAPSHOT */}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">

                <GrowthCard
                  label="Quizzes Taken"
                  value={String(totalQuizzes)}
                />

                <GrowthCard
                  label="Average"
                  value={`${averageScore}%`}
                />

                <GrowthCard
                  label="Best Score"
                  value={`${bestScore}%`}
                />

              </div>

            </section>
          )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="flex min-h-[500px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-[#8b1234]/15 text-3xl text-[#c9a56a]">
                ✦
              </div>

              <h2 className="mt-6 font-[var(--font-cormorant)] text-3xl">
                Lyra is preparing your quiz...
              </h2>

              <p className="mt-2 text-sm text-white/25">
                Creating questions for you.
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            QUIZ
        ================================================= */}

        {questions.length > 0 &&
          !finished &&
          !loading &&
          current && (

            <section className="rounded-[2rem] border border-white/[0.07] bg-[#100b0e] p-7 md:p-10">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a56a]">
                    {topic}
                  </p>

                  <p className="mt-2 text-xs text-white/25">
                    Question{" "}
                    {currentQuestion + 1}{" "}
                    of{" "}
                    {questions.length}
                  </p>

                </div>

                <span className="font-[var(--font-cormorant)] text-2xl text-[#c98296]">
                  {score} pts
                </span>

              </div>

              {/* PROGRESS */}

              <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">

                <div
                  className="h-full bg-[#8b1234] transition-all"
                  style={{
                    width: `${
                      ((currentQuestion + 1) /
                        questions.length) *
                      100
                    }%`,
                  }}
                />

              </div>

              {/* QUESTION */}

              <h2 className="mt-10 font-[var(--font-cormorant)] text-3xl leading-tight md:text-4xl">
                {current.question}
              </h2>

              {/* OPTIONS */}

              <div className="mt-8 space-y-3">

                {current.options.map(
                  (
                    option,
                    index
                  ) => {

                    const isCorrect =
                      index ===
                      current.answer;

                    const isSelected =
                      selectedAnswer ===
                      index;

                    let className =
                      "border-white/[0.08] bg-white/[0.02] hover:border-[#8b1234]/40";

                    if (
                      selectedAnswer !==
                        null &&
                      isCorrect
                    ) {
                      className =
                        "border-[#c9a56a]/50 bg-[#c9a56a]/10";
                    }

                    if (
                      isSelected &&
                      !isCorrect
                    ) {
                      className =
                        "border-[#8b1234]/60 bg-[#8b1234]/15";
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          selectAnswer(
                            index
                          )
                        }
                        className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${className}`}
                      >

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs text-white/40">
                          {String.fromCharCode(
                            65 + index
                          )}
                        </span>

                        <span className="text-sm text-white/65">
                          {option}
                        </span>

                      </button>
                    );
                  }
                )}

              </div>

              {/* EXPLANATION */}

              {selectedAnswer !== null && (

                <div className="mt-6 rounded-2xl border border-[#c9a56a]/10 bg-[#c9a56a]/5 p-5">

                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a56a]">
                    Explanation
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {current.explanation}
                  </p>

                </div>
              )}

              {/* NEXT */}

              {selectedAnswer !== null && (

                <button
                  type="button"
                  onClick={nextQuestion}
                  className="mt-6 rounded-xl bg-[#8b1234] px-7 py-3 text-sm hover:bg-[#b21e45]"
                >
                  {currentQuestion + 1 ===
                  questions.length
                    ? "See Results →"
                    : "Next Question →"}
                </button>
              )}

            </section>
          )}

        {/* =================================================
            RESULTS + ACTUAL GROWTH
        ================================================= */}

        {finished && (

          <section className="space-y-6">

            <div className="rounded-[2rem] border border-[#c9a56a]/20 bg-gradient-to-br from-[#180a10] to-[#100b0e] p-10 text-center md:p-16">

              <p className="text-xs uppercase tracking-[0.3em] text-[#c9a56a]">
                Quiz Complete
              </p>

              <h1 className="mt-4 font-[var(--font-cormorant)] text-7xl">
                {score} /{" "}
                {questions.length}
              </h1>

              <p className="mt-3 text-xl text-[#c98296]">
                {Math.round(
                  (score /
                    questions.length) *
                  100
                )}
                %
              </p>

              <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/30">

                {score ===
                questions.length
                  ? "Perfect score. You absolutely cooked that quiz. ✦"
                  : score >=
                    questions.length * 0.7
                  ? "Great work. Keep going — you're getting stronger."
                  : "No stress. Review the explanations and try again."}

              </p>

              {/* ACTUAL GROWTH */}

              <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">

                <GrowthCard
                  label="This Quiz"
                  value={`${Math.round(
                    (score /
                      questions.length) *
                    100
                  )}%`}
                />

                <GrowthCard
                  label="Average"
                  value={`${averageScore}%`}
                />

                <GrowthCard
                  label="Best"
                  value={`${Math.max(
                    bestScore,
                    Math.round(
                      (score /
                        questions.length) *
                      100
                    )
                  )}%`}
                />

              </div>

              {/* GROWTH MESSAGE */}

              <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">

                <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a56a]">
                  Your Growth
                </p>

                {previousScore === null ? (

                  <p className="mt-2 text-sm text-white/50">
                    This is your first recorded quiz.
                    Keep practicing and StudyBuddy
                    will track your progress from here. ✦
                  </p>

                ) : growth > 0 ? (

                  <p className="mt-2 text-sm text-[#c98296]">
                    ↑ You're{" "}
                    <strong>
                      {growth}%
                    </strong>{" "}
                    better than your previous quiz.
                    That's real progress. 🔥
                  </p>

                ) : growth < 0 ? (

                  <p className="mt-2 text-sm text-white/50">
                    You dropped{" "}
                    <strong>
                      {Math.abs(growth)}%
                    </strong>{" "}
                    from your previous quiz.
                    No panic — use the explanations,
                    review the topic and try again.
                  </p>

                ) : (

                  <p className="mt-2 text-sm text-white/50">
                    You're holding steady at{" "}
                    <strong>
                      {latestScore}%
                    </strong>
                    . One more round and let's push
                    that number higher. ✦
                  </p>

                )}

              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={resetQuiz}
                  className="rounded-full bg-[#8b1234] px-7 py-3 text-sm hover:bg-[#b21e45]"
                >
                  Try Another Quiz
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/dashboard"
                    )
                  }
                  className="rounded-full border border-white/10 px-7 py-3 text-sm text-white/50 hover:text-white"
                >
                  Back to Dashboard
                </button>

              </div>

            </div>

            {/* PERFORMANCE HISTORY */}

            {quizHistory.length > 0 && (

              <div className="rounded-[2rem] border border-white/[0.07] bg-[#100b0e] p-7 md:p-10">

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                      Your journey
                    </p>

                    <h2 className="mt-2 font-[var(--font-cormorant)] text-4xl">
                      Performance History
                    </h2>

                  </div>

                  <span className="text-xs text-white/25">
                    {quizHistory.length} quiz
                    {quizHistory.length !== 1
                      ? "zes"
                      : ""}
                  </span>

                </div>

                <div className="mt-7 space-y-3">

                  {quizHistory
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          key={`${item.date}-${index}`}
                          className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                        >

                          <div>

                            <p className="text-sm text-white/70">
                              {item.topic}
                            </p>

                            <p className="mt-1 text-[10px] text-white/25">
                              {item.date}
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="font-[var(--font-cormorant)] text-2xl text-[#c98296]">
                              {item.percentage}%
                            </p>

                            <p className="text-[10px] text-white/25">
                              {item.score}/
                              {item.total}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                </div>

              </div>
            )}

          </section>
        )}

      </div>
    </main>
  );
}


/* ============================================================
   GROWTH CARD
============================================================ */

function GrowthCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">

      <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p className="mt-2 font-[var(--font-cormorant)] text-2xl text-[#c98296]">
        {value}
      </p>

    </div>
  );
}