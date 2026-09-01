"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Course = {
  id: number;
  title: string;
  description: string | null;
};

type QuizResult = {
  score: number;
  total: number;
  percentage: number;
  date: string;
};

const API = "http://127.0.0.1:8000";

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentName, setStudentName] = useState("Student");
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch(`${API}/courses`);

        if (!response.ok) {
          throw new Error("Could not load courses");
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Course loading error:", error);
      }
    };

    loadDashboard();

    const storedName = localStorage.getItem("studentName");

    if (storedName) {
      setStudentName(storedName);
    }

    const storedResults = localStorage.getItem("quizResults");

    if (storedResults) {
      try {
        setQuizResults(JSON.parse(storedResults));
      } catch {
        setQuizResults([]);
      }
    }

    // Also load the quiz history used by the Quiz page.
    const quizHistory = localStorage.getItem(
      "studybuddy_quiz_history"
    );

    if (quizHistory && !storedResults) {
      try {
        setQuizResults(JSON.parse(quizHistory));
      } catch {
        setQuizResults([]);
      }
    }
  }, []);

  const averageQuizScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce(
            (sum, result) => sum + result.percentage,
            0
          ) / quizResults.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#070507] text-[#f5e8e8]">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/[0.06] bg-[#0b070a] p-6 lg:block">

        <div>
          <Link
            href="/dashboard"
            className="font-[var(--font-cormorant)] text-3xl font-semibold"
          >
            Study
            <span className="text-[#b21e45]">
              Buddy
            </span>

            <span className="ml-2 text-xs tracking-[0.3em] text-[#c9a56a]">
              AI
            </span>
          </Link>

          <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-white/25">
            your learning sanctuary
          </p>
        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="mt-12 space-y-2">

          <SidebarLink
            href="/dashboard"
            icon="⌂"
            label="Dashboard"
            active
          />

          {/* IMPORTANT:
              My Courses now jumps directly to the
              course library on this dashboard.
          */}

          <a
            href="#courses"
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm text-white/35 transition hover:bg-white/[0.03] hover:text-white"
          >
            <span className="text-white/25">
              ♢
            </span>

            My Courses
          </a>


          <SidebarLink
            href="/ai-tutor"
            icon="✦"
            label="AI Tutor"
          />

          <SidebarLink
            href="/study-space"
            icon="☾"
            label="Study Space"
          />

          <SidebarLink
            href="/quizzes"
            icon="♧"
            label="Quizzes"
          />

          <SidebarLink
            href="/study-clubs"
            icon="♡"
            label="Study Clubs"
          />

          <SidebarLink
            href="/curiosity"
            icon="✧"
            label="Random Curiosity"
          />

        </nav>


        {/* =================================================
            STUDENT PROFILE
        ================================================= */}

        <div className="absolute bottom-6 left-6 right-6">

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b1234] font-[var(--font-cormorant)] text-xl">
                {studentName.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-[var(--font-cormorant)] text-lg">
                  {studentName}
                </p>

                <p className="text-[10px] text-white/30">
                  Keep growing ✦
                </p>
              </div>

            </div>

          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="lg:ml-64">

        {/* HEADER */}

        <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#080508]/90 px-6 py-5 backdrop-blur-xl md:px-10">

          <div className="lg:hidden">
            <h1 className="font-[var(--font-cormorant)] text-2xl">
              Study
              <span className="text-[#b21e45]">
                Buddy
              </span>
            </h1>
          </div>

          <div className="hidden text-xs text-white/30 md:block">
            Your learning journey continues ✦
          </div>

          <div className="flex items-center gap-4">

            <Link
              href="/curiosity"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/50 transition hover:border-[#c9a56a]/40 hover:text-[#c9a56a]"
            >
              ✧
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b1234] font-[var(--font-cormorant)] text-lg">
              {studentName.charAt(0).toUpperCase()}
            </div>

          </div>

        </header>


        <div className="px-6 py-8 md:px-10 lg:px-12">

          {/* =================================================
              HERO
          ================================================= */}

          <section
            className="relative min-h-[380px] overflow-hidden rounded-[2rem] border border-[#c9a56a]/10"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=85')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >

            <div className="absolute inset-0 bg-gradient-to-r from-[#080508] via-[#080508]/90 to-[#080508]/30" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#080508] via-transparent to-transparent" />

            <div className="relative z-10 flex min-h-[380px] items-center px-8 py-12 md:px-12">

              <div className="max-w-2xl">

                <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
                  welcome back ❦
                </p>

                <h1 className="mt-4 font-[var(--font-cormorant)] text-6xl leading-[0.9] md:text-7xl">

                  Good to see you,
                  <br />

                  <span className="italic text-[#b21e45]">
                    {studentName}.
                  </span>

                </h1>

                <p className="mt-6 max-w-lg text-sm leading-7 text-white/50">
                  Your mind doesn't need more
                  pressure. It needs the right
                  space to grow. Pick up where
                  you left off.
                </p>


                <div className="mt-8 flex flex-wrap gap-3">

                  <Link
                    href={
                      courses.length > 0
                        ? `/course/${courses[0].id}`
                        : "#courses"
                    }
                    className="rounded-full bg-[#8b1234] px-7 py-3 text-sm font-medium shadow-[0_0_30px_rgba(139,18,52,0.3)] transition hover:bg-[#b21e45]"
                  >
                    Continue Learning →
                  </Link>

                  <Link
                    href="/ai-tutor"
                    className="rounded-full border border-white/10 bg-black/20 px-7 py-3 text-sm text-white/60 backdrop-blur-md transition hover:border-[#c9a56a]/40 hover:text-[#c9a56a]"
                  >
                    Ask Lyra ✦
                  </Link>

                  <Link
                    href="/quizzes"
                    className="rounded-full border border-white/10 bg-black/20 px-7 py-3 text-sm text-white/60 backdrop-blur-md transition hover:border-[#c9a56a]/40 hover:text-[#c9a56a]"
                  >
                    Quiz Me ♧
                  </Link>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              STATS
          ================================================= */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              icon="🔥"
              label="Study Streak"
              value="7 days"
              detail="Keep the streak alive"
            />

            <StatCard
              icon="✦"
              label="Quiz Growth"
              value={`${averageQuizScore}%`}
              detail={
                quizResults.length > 0
                  ? `${quizResults.length} quiz${
                      quizResults.length === 1
                        ? ""
                        : "zes"
                    } completed`
                  : "Take your first quiz"
              }
            />

            <StatCard
              icon="♢"
              label="Courses"
              value={courses.length.toString()}
              detail="Available to learn"
            />

            <StatCard
              icon="◷"
              label="Learning Mode"
              value="Active"
              detail="You're making progress"
            />

          </section>


          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.5fr_0.7fr]">

            <div>

              {/* =================================================
                  CONTINUE LEARNING
              ================================================= */}

              <section>

                <div className="mb-5 flex items-end justify-between">

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                      pick up where you left off
                    </p>

                    <h2 className="mt-1 font-[var(--font-cormorant)] text-4xl">
                      Continue Learning
                    </h2>
                  </div>

                  <a
                    href="#courses"
                    className="text-xs text-[#c98296] hover:text-white"
                  >
                    View all →
                  </a>

                </div>


                {courses.length > 0 ? (

                  <Link
                    href={`/course/${courses[0].id}`}
                    className="group block overflow-hidden rounded-3xl border border-white/[0.07] bg-[#100b0e] transition hover:border-[#8b1234]/50"
                  >

                    <div className="grid md:grid-cols-[0.8fr_1.2fr]">

                      <div className="relative min-h-[220px] overflow-hidden bg-gradient-to-br from-[#421020] to-[#0c070a]">

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(178,30,69,0.5),transparent_55%)]" />

                        <div className="relative flex h-full items-center justify-center">

                          <span className="font-[var(--font-cormorant)] text-8xl italic text-white/10">
                            01
                          </span>

                          <span className="absolute text-5xl text-[#c9a56a]">
                            ♢
                          </span>

                        </div>

                      </div>


                      <div className="p-7">

                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#c9a56a]">
                          currently studying
                        </p>

                        <h3 className="mt-3 font-[var(--font-cormorant)] text-3xl">
                          {courses[0].title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-white/35">
                          {courses[0].description ||
                            "Continue exploring this course and discover its chapters."}
                        </p>

                        <div className="mt-6 flex items-center justify-between">

                          <span className="text-xs text-white/30">
                            Open course
                          </span>

                          <span className="text-sm text-[#c98296] group-hover:text-white">
                            Continue →
                          </span>

                        </div>

                      </div>

                    </div>

                  </Link>

                ) : (

                  <EmptyState />

                )}

              </section>


              {/* =================================================
                  MY COURSES
              ================================================= */}

              <section
                id="courses"
                className="mt-10 scroll-mt-8"
              >

                <div className="mb-5">

                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                    your library
                  </p>

                  <h2 className="mt-1 font-[var(--font-cormorant)] text-4xl">
                    My Courses
                  </h2>

                  <p className="mt-2 text-sm text-white/25">
                    Choose a course to continue learning.
                  </p>

                </div>


                {courses.length > 0 ? (

                  <div className="grid gap-4 md:grid-cols-2">

                    {courses.map(
                      (course, index) => (

                        <Link
                          key={course.id}
                          href={`/course/${course.id}`}
                          className="group rounded-3xl border border-white/[0.07] bg-[#100b0e] p-6 transition hover:-translate-y-1 hover:border-[#8b1234]/40"
                        >

                          <div className="flex items-start justify-between">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8b1234]/15 font-[var(--font-cormorant)] text-2xl text-[#b21e45]">
                              {String(index + 1).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            <span className="text-white/20 transition group-hover:text-[#c9a56a]">
                              →
                            </span>

                          </div>


                          <h3 className="mt-6 font-[var(--font-cormorant)] text-2xl">
                            {course.title}
                          </h3>


                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/30">
                            {course.description ||
                              "Explore this course and begin your learning journey."}
                          </p>


                          <div className="mt-5 text-[10px] uppercase tracking-[0.2em] text-[#c98296]">
                            Start learning →
                          </div>

                        </Link>

                      )
                    )}

                  </div>

                ) : (

                  <EmptyState />

                )}

              </section>

            </div>


            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <aside className="space-y-5">

              {/* AI TUTOR */}

              <div className="relative overflow-hidden rounded-3xl border border-[#8b1234]/25 bg-gradient-to-br from-[#180b10] to-[#0d080b] p-7">

                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#8b1234]/20 blur-3xl" />

                <p className="relative text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                  your companion
                </p>

                <h3 className="relative mt-2 font-[var(--font-cormorant)] text-3xl">
                  Ask Lyra ✦
                </h3>

                <p className="relative mt-3 text-sm leading-6 text-white/35">
                  Stuck on something? Talk to
                  your AI tutor normally — ask,
                  learn, discuss and understand.
                </p>

                <Link
                  href="/ai-tutor"
                  className="relative mt-6 block w-full rounded-xl bg-[#8b1234] py-3 text-center text-sm transition hover:bg-[#b21e45]"
                >
                  Start a conversation
                </Link>

              </div>


              {/* QUIZ */}

              <div className="rounded-3xl border border-[#c9a56a]/15 bg-[#100b0e] p-7">

                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                  challenge yourself
                </p>

                <h3 className="mt-2 font-[var(--font-cormorant)] text-3xl">
                  Quiz Me ♧
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/30">
                  Test your understanding and
                  watch your learning score grow.
                </p>

                <Link
                  href="/quizzes"
                  className="mt-5 block rounded-xl border border-[#8b1234]/30 bg-[#8b1234]/10 py-3 text-center text-sm text-[#c98296] transition hover:bg-[#8b1234]/20"
                >
                  Take a Quiz →
                </Link>

              </div>


              {/* TODAY */}

              <div className="rounded-3xl border border-white/[0.07] bg-[#100b0e] p-7">

                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                  your day
                </p>

                <h3 className="mt-2 font-[var(--font-cormorant)] text-3xl">
                  Today's Plan
                </h3>

                <div className="mt-6 space-y-5">

                  <PlanItem
                    time="10:00"
                    title="Study your course"
                    done
                  />

                  <PlanItem
                    time="14:30"
                    title="Practice Quiz"
                  />

                  <PlanItem
                    time="19:00"
                    title="Review today's notes"
                  />

                </div>

              </div>


              {/* GROWTH */}

              <div className="rounded-3xl border border-white/[0.07] bg-[#100b0e] p-7">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                      learning growth
                    </p>

                    <h3 className="mt-2 font-[var(--font-cormorant)] text-3xl">
                      Your Progress
                    </h3>

                  </div>

                  <span className="text-3xl">
                    ✦
                  </span>

                </div>


                <div className="mt-6">

                  <div className="flex justify-between text-xs text-white/30">

                    <span>
                      Quiz performance
                    </span>

                    <span>
                      {averageQuizScore}%
                    </span>

                  </div>


                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">

                    <div
                      className="h-full rounded-full bg-[#8b1234] transition-all"
                      style={{
                        width: `${averageQuizScore}%`,
                      }}
                    />

                  </div>

                </div>


                <p className="mt-4 text-xs leading-5 text-white/25">
                  Every completed quiz contributes
                  to this learning snapshot.
                </p>

              </div>


              {/* QUICK ACTIONS */}

              <div className="rounded-3xl border border-white/[0.07] bg-[#100b0e] p-7">

                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                  quick actions
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <QuickAction
                    icon="✦"
                    title="AI Tutor"
                    href="/ai-tutor"
                  />

                  <QuickAction
                    icon="♧"
                    title="Quiz Me"
                    href="/quizzes"
                  />

                  <QuickAction
                    icon="☾"
                    title="Study Space"
                    href="/study-space"
                  />

                  <QuickAction
                    icon="♡"
                    title="Study Clubs"
                    href="/study-clubs"
                  />

                  <QuickAction
                    icon="✧"
                    title="Random Curiosity"
                    href="/curiosity"
                  />

                </div>

              </div>

            </aside>

          </div>

        </div>

      </section>

    </main>
  );
}


/* ============================================================
   SIDEBAR LINK
============================================================ */

function SidebarLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm transition ${
        active
          ? "bg-[#8b1234]/15 text-[#f5e8e8]"
          : "text-white/35 hover:bg-white/[0.03] hover:text-white"
      }`}
    >

      <span
        className={
          active
            ? "text-[#b21e45]"
            : "text-white/25"
        }
      >
        {icon}
      </span>

      {label}

    </Link>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#100b0e] p-5">

      <div className="flex items-center justify-between">

        <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
          {label}
        </p>

        <span className="text-lg">
          {icon}
        </span>

      </div>

      <p className="mt-4 font-[var(--font-cormorant)] text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#c98296]">
        {detail}
      </p>

    </div>
  );
}


/* ============================================================
   PLAN ITEM
============================================================ */

function PlanItem({
  time,
  title,
  done = false,
}: {
  time: string;
  title: string;
  done?: boolean;
}) {
  return (
    <div className="flex gap-4">

      <div className="w-12 pt-1 text-[10px] text-white/25">
        {time}
      </div>

      <div className="flex flex-1 gap-3">

        <div
          className={`mt-1 h-3 w-3 rounded-full ${
            done
              ? "bg-[#8b1234]"
              : "border border-[#8b1234]"
          }`}
        />

        <div>

          <p
            className={`text-sm ${
              done
                ? "text-white/30 line-through"
                : "text-white/70"
            }`}
          >
            {title}
          </p>

          {done && (
            <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-[#c98296]">
              completed
            </p>
          )}

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  icon,
  title,
  href,
}: {
  icon: string;
  title: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:border-[#8b1234]/40 hover:bg-[#8b1234]/10"
    >

      <div className="text-lg text-[#b21e45]">
        {icon}
      </div>

      <p className="mt-2 text-xs text-white/50">
        {title}
      </p>

    </Link>
  );
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-[#100b0e] p-12 text-center">

      <p className="font-[var(--font-cormorant)] text-3xl text-white/30">
        Your journey begins here.
      </p>

      <p className="mt-2 text-sm text-white/20">
        Pick a course to start learning.
      </p>

    </div>
  );
}