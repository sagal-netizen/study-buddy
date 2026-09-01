"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Course = {
  id: number;
  title: string;
  description: string | null;
};

type Chapter = {
  id: number;
  title: string;
  content: string | null;
  notes: string | null;
};

type Progress = {
  id: number;
  user_id: number;
  chapter_id: number;
  completed: boolean;
};

type Tutor = {
  id: number;
  course_id: number;
  tutor_name: string;
  personality: string;
  teaching_style: string;
  tone: string;
  difficulty: string;
  custom_instructions: string | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.course_id;

  const API = "http://127.0.0.1:8000";

  const USER_ID = 1;

  const [course, setCourse] =
    useState<Course | null>(null);

  const [chapters, setChapters] =
    useState<Chapter[]>([]);

  const [progress, setProgress] =
    useState<Progress[]>([]);

  const [tutor, setTutor] =
    useState<Tutor | null>(null);

  const [openChapter, setOpenChapter] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [tutorOpen, setTutorOpen] =
    useState(false);

  const [question, setQuestion] =
    useState("");

  const [chat, setChat] =
    useState<ChatMessage[]>([]);

  const [asking, setAsking] =
    useState(false);

  // =====================================================
  // LOAD COURSE
  // =====================================================

  useEffect(() => {
    if (!courseId) {
      return;
    }

    const loadCourse = async () => {
      try {
        const courseResponse =
          await fetch(
            `${API}/courses/${courseId}`
          );

        const courseData =
          await courseResponse.json();

        if (!courseResponse.ok) {
          setLoading(false);
          return;
        }

        setCourse(courseData);

        // -------------------------------------------------
        // LOAD CHAPTERS
        // -------------------------------------------------

        const chapterResponse =
          await fetch(
            `${API}/courses/${courseId}/chapters`
          );

        if (chapterResponse.ok) {
          const chapterData =
            await chapterResponse.json();

          setChapters(chapterData);
        }

        // -------------------------------------------------
        // LOAD PROGRESS
        // -------------------------------------------------

        const progressResponse =
          await fetch(
            `${API}/progress/${USER_ID}`
          );

        if (progressResponse.ok) {
          const progressData =
            await progressResponse.json();

          setProgress(progressData);
        }

        // -------------------------------------------------
        // LOAD COURSE AI TUTOR
        // -------------------------------------------------

        const tutorResponse =
          await fetch(
            `${API}/courses/${courseId}/tutor`
          );

        if (tutorResponse.ok) {
          const tutorData =
            await tutorResponse.json();

          setTutor(tutorData);

          setChat([
            {
              role: "assistant",
              content: `Hi! I'm ${
                tutorData.tutor_name
              }, your ${
                courseData.title
              } tutor. Ask me anything you're struggling with and I'll help you understand it step by step.`,
            },
          ]);
        }

      } catch (error) {
        console.error(
          "Course loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourse();

  }, [courseId]);

  // =====================================================
  // CHECK COMPLETION
  // =====================================================

  const isChapterCompleted = (
    chapterId: number
  ) => {
    return progress.some(
      (item) =>
        item.chapter_id === chapterId &&
        item.completed === true
    );
  };

  // =====================================================
  // MARK COMPLETE
  // =====================================================

  const markComplete = async (
    chapterId: number
  ) => {
    try {
      const response =
        await fetch(
          `${API}/progress/${USER_ID}/${chapterId}/complete`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Unable to update progress."
        );
        return;
      }

      setProgress((previous) => {

        const existing =
          previous.find(
            (item) =>
              item.chapter_id ===
              chapterId
          );

        if (existing) {

          return previous.map(
            (item) =>
              item.chapter_id ===
              chapterId
                ? {
                    ...item,
                    completed: true,
                  }
                : item
          );
        }

        return [
          ...previous,
          {
            id:
              data.progress.id,
            user_id: USER_ID,
            chapter_id: chapterId,
            completed: true,
          },
        ];
      });

      setMessage(
        "Chapter completed! Progress saved."
      );

    } catch {

      setMessage(
        "Backend connection failed."
      );
    }
  };

  // =====================================================
  // ASK COURSE AI TUTOR
  // =====================================================

  const askTutor = async () => {

    const trimmed =
      question.trim();

    if (!trimmed || asking) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
    };

    setChat((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");
    setAsking(true);

    try {

      const response =
        await fetch(
          `${API}/ai/ask`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              question: trimmed,
              course_id:
                Number(courseId),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setChat((previous) => [
          ...previous,
          {
            role: "assistant",
            content:
              data.detail ||
              "I couldn't answer that right now.",
          },
        ]);

        return;
      }

      setChat((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            data.answer ||
            "I couldn't generate an answer.",
        },
      ]);

    } catch (error) {

      console.error(
        "Tutor error:",
        error
      );

      setChat((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting to your AI tutor. Please make sure the backend and Ollama are running.",
        },
      ]);

    } finally {

      setAsking(false);

    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleQuestionKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      askTutor();
    }
  };

  // =====================================================
  // CALCULATE PROGRESS
  // =====================================================

  const completedCount =
    chapters.filter((chapter) =>
      isChapterCompleted(
        chapter.id
      )
    ).length;

  const progressPercentage =
    chapters.length > 0
      ? Math.round(
          (completedCount /
            chapters.length) *
            100
        )
      : 0;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080508] text-white/50">
        Loading course...
      </main>
    );
  }

  // =====================================================
  // COURSE NOT FOUND
  // =====================================================

  if (!course) {

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#080508] text-[#f5e8e8]">

        <h1 className="font-[var(--font-cormorant)] text-4xl">
          Course not found
        </h1>

        <button
          onClick={() =>
            router.push("/dashboard")
          }
          className="mt-5 text-sm text-[#c98296]"
        >
          ← Back to dashboard
        </button>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080508] text-[#f5e8e8]">

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="border-b border-white/[0.06] bg-[#0b070a] px-6 py-5 md:px-10">

        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
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
              router.push(
                "/dashboard"
              )
            }
            className="text-xs text-white/35 transition hover:text-white"
          >
            ← Dashboard
          </button>

        </div>

      </nav>


      {/* =================================================
          COURSE HERO
      ================================================= */}

      <section className="relative overflow-hidden border-b border-white/[0.06]">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(139,18,52,0.22),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-10">

          <p className="text-xs uppercase tracking-[0.35em] text-[#c9a56a]">
            StudyBuddy AI · Course
          </p>

          <h1 className="mt-5 max-w-3xl font-[var(--font-cormorant)] text-6xl leading-none md:text-7xl">
            {course.title}
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/40">
            {course.description ||
              "Explore this course, work through each chapter and build your knowledge step by step."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">

            <div className="rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 text-xs text-white/40">
              {chapters.length} Chapters
            </div>

            <div className="rounded-full border border-[#8b1234]/30 bg-[#8b1234]/10 px-5 py-2.5 text-xs text-[#c98296]">
              {progressPercentage}% Complete
            </div>

            {tutor && (
              <div className="rounded-full border border-[#c9a56a]/20 bg-[#c9a56a]/5 px-5 py-2.5 text-xs text-[#c9a56a]">
                ✦ {tutor.tutor_name} · AI Tutor
              </div>
            )}

          </div>

        </div>

      </section>


      {/* =================================================
          AI TUTOR
      ================================================= */}

      <section className="mx-auto max-w-4xl px-6 pt-10 md:px-10">

        <div className="overflow-hidden rounded-3xl border border-[#8b1234]/30 bg-gradient-to-br from-[#180b10] to-[#0d080b]">

          <div className="p-7">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

              <div>

                <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a56a]">
                  Your course companion
                </p>

                <h2 className="mt-2 font-[var(--font-cormorant)] text-4xl">
                  {tutor?.tutor_name || "AI Tutor"} ✦
                </h2>

                <p className="mt-2 text-sm text-white/35">
                  {tutor
                    ? `${tutor.personality} · ${tutor.teaching_style} · ${tutor.tone}`
                    : "Your personal course tutor"}
                </p>

              </div>

              <button
                onClick={() =>
                  setTutorOpen(
                    !tutorOpen
                  )
                }
                className="rounded-full bg-[#8b1234] px-7 py-3 text-sm transition hover:bg-[#b21e45]"
              >
                {tutorOpen
                  ? "Close Tutor"
                  : `Ask ${
                      tutor?.tutor_name ||
                      "Tutor"
                    } ✦`}
              </button>

            </div>

          </div>


          {tutorOpen && (

            <div className="border-t border-white/[0.07]">

              {/* CHAT */}

              <div className="max-h-[420px] space-y-4 overflow-y-auto p-6">

                {chat.map(
                  (item, index) => (

                    <div
                      key={index}
                      className={
                        item.role ===
                        "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >

                      <div
                        className={
                          item.role ===
                          "user"
                            ? "max-w-[80%] rounded-2xl rounded-br-md bg-[#8b1234] px-5 py-3 text-sm leading-6"
                            : "max-w-[80%] rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.03] px-5 py-3 text-sm leading-6 text-white/65"
                        }
                      >
                        {item.content}
                      </div>

                    </div>

                  )
                )}

                {asking && (

                  <div className="flex justify-start">

                    <div className="rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.03] px-5 py-3 text-sm text-white/35">
                      {tutor?.tutor_name ||
                        "Tutor"}{" "}
                      is thinking...
                    </div>

                  </div>

                )}

              </div>


              {/* INPUT */}

              <div className="border-t border-white/[0.07] p-5">

                <div className="flex gap-3">

                  <input
                    value={question}
                    onChange={(event) =>
                      setQuestion(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleQuestionKeyDown
                    }
                    disabled={asking}
                    placeholder={`Ask ${
                      tutor?.tutor_name ||
                      "your tutor"
                    } anything...`}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#8b1234]/60"
                  />

                  <button
                    onClick={askTutor}
                    disabled={
                      asking ||
                      !question.trim()
                    }
                    className="rounded-xl bg-[#8b1234] px-5 py-3 text-sm transition hover:bg-[#b21e45] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {asking
                      ? "..."
                      : "Ask"}
                  </button>

                </div>

                <p className="mt-2 text-[10px] text-white/20">
                  Press Enter to ask · Your tutor is
                  configured specifically for this course.
                </p>

              </div>

            </div>

          )}

        </div>

      </section>


      {/* =================================================
          COURSE PROGRESS
      ================================================= */}

      <section className="mx-auto max-w-4xl px-6 pt-10 md:px-10">

        <div className="rounded-3xl border border-[#8b1234]/20 bg-[#10090d] p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-[#c9a56a]">
                Your Progress
              </p>

              <p className="mt-2 font-[var(--font-cormorant)] text-2xl">
                {completedCount} of{" "}
                {chapters.length} chapters
                completed
              </p>

            </div>

            <span className="font-[var(--font-cormorant)] text-3xl text-[#c98296]">
              {progressPercentage}%
            </span>

          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">

            <div
              className="h-full rounded-full bg-[#8b1234] transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
              }}
            />

          </div>

        </div>

      </section>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (

        <div className="mx-auto max-w-4xl px-6 pt-5 md:px-10">

          <div className="rounded-xl border border-[#8b1234]/30 bg-[#8b1234]/10 px-5 py-3 text-sm text-[#c98296]">
            {message}
          </div>

        </div>

      )}


      {/* =================================================
          CHAPTERS
      ================================================= */}

      <section className="mx-auto max-w-4xl px-6 py-14 md:px-10">

        <div className="mb-8">

          <p className="text-xs uppercase tracking-[0.3em] text-[#c9a56a]">
            Course content
          </p>

          <h2 className="mt-2 font-[var(--font-cormorant)] text-4xl">
            Chapters
          </h2>

          <p className="mt-2 text-sm text-white/30">
            Select a chapter to view its content and notes.
          </p>

        </div>


        <div className="space-y-3">

          {chapters.map(
            (chapter, index) => {

              const isOpen =
                openChapter ===
                chapter.id;

              const completed =
                isChapterCompleted(
                  chapter.id
                );

              return (

                <div
                  key={chapter.id}
                  className={`overflow-hidden rounded-2xl border transition ${
                    completed
                      ? "border-[#c9a56a]/30 bg-[#110d09]"
                      : isOpen
                      ? "border-[#8b1234]/50 bg-[#11090d]"
                      : "border-white/[0.07] bg-[#0e090c]"
                  }`}
                >

                  <button
                    onClick={() =>
                      setOpenChapter(
                        isOpen
                          ? null
                          : chapter.id
                      )
                    }
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >

                    <div className="flex items-center gap-5">

                      <span
                        className={`font-[var(--font-cormorant)] text-xl ${
                          completed
                            ? "text-[#c9a56a]"
                            : "text-[#b21e45]"
                        }`}
                      >
                        {completed
                          ? "✓"
                          : String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                      </span>

                      <div>

                        <span className="font-[var(--font-cormorant)] text-2xl">
                          {chapter.title}
                        </span>

                        {completed && (
                          <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#c9a56a]">
                            Completed
                          </p>
                        )}

                      </div>

                    </div>

                    <span
                      className={`text-xl text-[#c98296] transition ${
                        isOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    >
                      ⌄
                    </span>

                  </button>


                  {isOpen && (

                    <div className="border-t border-white/[0.07] px-6 pb-6 pt-5">

                      <p className="text-xs uppercase tracking-[0.2em] text-[#c9a56a]">
                        Chapter content
                      </p>

                      <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-white/40">
                        {chapter.content ||
                          "No content has been added for this chapter yet."}
                      </p>


                      {chapter.notes && (

                        <div className="mt-6 rounded-2xl border border-[#c9a56a]/10 bg-[#c9a56a]/5 p-5">

                          <p className="text-xs uppercase tracking-[0.2em] text-[#c9a56a]">
                            Chapter Notes
                          </p>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/40">
                            {chapter.notes}
                          </p>

                        </div>

                      )}


                      {completed ? (

                        <div className="mt-6 inline-flex items-center rounded-full border border-[#c9a56a]/30 bg-[#c9a56a]/10 px-5 py-2.5 text-xs text-[#c9a56a]">
                          ✓ Chapter Completed
                        </div>

                      ) : (

                        <button
                          onClick={() =>
                            markComplete(
                              chapter.id
                            )
                          }
                          className="mt-6 rounded-full bg-[#8b1234] px-6 py-3 text-sm transition hover:bg-[#b21e45]"
                        >
                          Mark as Complete ✓
                        </button>

                      )}

                    </div>

                  )}

                </div>

              );
            }
          )}

        </div>


        {chapters.length === 0 && (

          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">

            <p className="font-[var(--font-cormorant)] text-2xl text-white/30">
              No chapters available yet.
            </p>

          </div>

        )}


        {/* =================================================
            COMPLETION MESSAGE
        ================================================= */}

        {chapters.length > 0 &&
          progressPercentage === 100 && (

            <div className="mt-10 rounded-3xl border border-[#c9a56a]/20 bg-gradient-to-r from-[#180a10] to-[#0e090c] p-8">

              <p className="text-xs uppercase tracking-[0.25em] text-[#c9a56a]">
                Course Complete
              </p>

              <h3 className="mt-2 font-[var(--font-cormorant)] text-3xl">
                You've completed this course.
              </h3>

              <p className="mt-2 text-sm text-white/30">
                All chapters have been marked as completed.
              </p>

            </div>

          )}

      </section>

    </main>
  );
}