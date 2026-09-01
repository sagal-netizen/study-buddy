"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Course = {
  id: number;
  title: string;
  description: string | null;
};

type Material = {
  id: number;
  filename: string;
  file_type: string | null;
  course_id: number;
  chapter_id: number | null;
};

type Chapter = {
  id: number;
  title: string;
  content: string | null;
  notes: string | null;
  course_id: number;
  materials?: Material[];
};

export default function AdminDashboard() {
  const router = useRouter();

  const API = "http://127.0.0.1:8000";

  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [chapterNotes, setChapterNotes] = useState("");

  const [selectedChapter, setSelectedChapter] =
    useState<Chapter | null>(null);

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");

  /* =====================================================
     LOAD COURSES
  ===================================================== */

  const loadCourses = async () => {
    try {
      const response = await fetch(
        `${API}/courses`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setCourses(data);
    } catch {
      setMessage("Unable to load courses.");
    }
  };

  /* =====================================================
     LOAD CHAPTERS
  ===================================================== */

  const loadChapters = async (
    course: Course
  ) => {
    try {
      const response = await fetch(
        `${API}/courses/${course.id}/chapters`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setChapters(data);
    } catch {
      setMessage(
        "Unable to load chapters."
      );
    }
  };

  /* =====================================================
     SELECT COURSE
  ===================================================== */

  const selectCourse = async (
    course: Course
  ) => {
    setSelectedCourse(course);
    setSelectedChapter(null);
    setSelectedFiles([]);
    setMessage("");

    await loadChapters(course);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  /* =====================================================
     ADD COURSE
  ===================================================== */

  const addCourse = async () => {
    if (!title.trim()) {
      setMessage(
        "Course title is required."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API}/courses`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Could not create course."
        );
        return;
      }

      setTitle("");
      setDescription("");

      setMessage(
        "Course added successfully."
      );

      await loadCourses();
    } catch {
      setMessage(
        "Backend connection failed."
      );
    }
  };

  /* =====================================================
     ADD CHAPTER
  ===================================================== */

  const addChapter = async () => {
    if (!selectedCourse) {
      setMessage(
        "Please select a course first."
      );
      return;
    }

    if (!chapterTitle.trim()) {
      setMessage(
        "Chapter title is required."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API}/courses/${selectedCourse.id}/chapters`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: chapterTitle,
            content: chapterContent,
            notes: chapterNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Could not create chapter."
        );
        return;
      }

      setChapterTitle("");
      setChapterContent("");
      setChapterNotes("");

      setMessage(
        "Chapter added successfully."
      );

      await loadChapters(
        selectedCourse
      );
    } catch {
      setMessage(
        "Backend connection failed."
      );
    }
  };

  /* =====================================================
     SELECT CHAPTER
  ===================================================== */

  const selectChapter = async (
    chapter: Chapter
  ) => {
    setSelectedChapter(chapter);
    setSelectedFiles([]);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/courses/${chapter.course_id}/chapters/${chapter.id}/materials`
      );

      if (!response.ok) {
        throw new Error();
      }

      const materials =
        await response.json();

      setSelectedChapter({
        ...chapter,
        materials,
      });
    } catch {
      setSelectedChapter({
        ...chapter,
        materials: [],
      });
    }
  };

  /* =====================================================
     FILE SELECTION
  ===================================================== */

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) {
      return;
    }

    const files = Array.from(
      event.target.files
    );

    setSelectedFiles(files);

    setMessage(
      `${files.length} file(s) selected.`
    );
  };

  /* =====================================================
     UPLOAD FILES TO SELECTED CHAPTER
  ===================================================== */

  const uploadMaterials = async () => {
    if (!selectedCourse) {
      setMessage(
        "Please select a course first."
      );
      return;
    }

    if (!selectedChapter) {
      setMessage(
        "Please select a chapter first."
      );
      return;
    }

    if (selectedFiles.length === 0) {
      setMessage(
        "Please select at least one file."
      );
      return;
    }

    setUploading(true);
    setMessage("");

    let uploadedCount = 0;
    let failedCount = 0;

    try {
      for (const file of selectedFiles) {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const response =
          await fetch(
            `${API}/courses/${selectedCourse.id}/chapters/${selectedChapter.id}/materials`,
            {
              method: "POST",
              body: formData,
            }
          );

        if (response.ok) {
          uploadedCount++;
        } else {
          failedCount++;
        }
      }

      setSelectedFiles([]);

      const fileInput =
        document.getElementById(
          "chapter-material-upload"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await selectChapter(
        selectedChapter
      );

      if (failedCount === 0) {
        setMessage(
          `${uploadedCount} material(s) uploaded successfully.`
        );
      } else {
        setMessage(
          `${uploadedCount} uploaded successfully. ${failedCount} failed.`
        );
      }
    } catch {
      setMessage(
        "Unable to upload materials."
      );
    } finally {
      setUploading(false);
    }
  };

  /* =====================================================
     DELETE MATERIAL
  ===================================================== */

  const deleteMaterial = async (
    materialId: number
  ) => {
    if (
      !confirm(
        "Delete this study material?"
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API}/materials/${materialId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        setMessage(
          "Unable to delete material."
        );
        return;
      }

      if (selectedChapter) {
        await selectChapter(
          selectedChapter
        );
      }

      setMessage(
        "Material deleted successfully."
      );
    } catch {
      setMessage(
        "Unable to delete material."
      );
    }
  };

  /* =====================================================
     DELETE COURSE
  ===================================================== */

  const deleteCourse = async (
    id: number
  ) => {
    if (
      !confirm(
        "Delete this course and its chapters?"
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API}/courses/${id}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        setMessage(
          "Unable to delete course."
        );
        return;
      }

      setSelectedCourse(null);
      setSelectedChapter(null);
      setChapters([]);

      setMessage(
        "Course deleted successfully."
      );

      await loadCourses();
    } catch {
      setMessage(
        "Unable to delete course."
      );
    }
  };

  /* =====================================================
     FILE ICON
  ===================================================== */

  const getFileIcon = (
    fileType: string | null
  ) => {
    switch (
      fileType?.toLowerCase()
    ) {
      case "pdf":
        return "📕";

      case "ppt":
      case "pptx":
        return "📊";

      case "xls":
      case "xlsx":
      case "csv":
        return "📗";

      case "doc":
      case "docx":
        return "📘";

      case "txt":
        return "📄";

      case "zip":
        return "🗜️";

      default:
        return "📎";
    }
  };

  return (
    <main className="min-h-screen bg-[#070507] text-[#f5e8e8]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-white/10 bg-[#0c080b] px-8 py-6">

        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>

            <h1 className="font-[var(--font-cormorant)] text-3xl">
              Study
              <span className="text-[#b21e45]">
                Buddy
              </span>

              <span className="ml-2 text-xs tracking-[0.3em] text-[#c9a56a]">
                ADMIN
              </span>
            </h1>

            <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-white/25">
              Course Management
            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/users"
                )
              }
              className="rounded-full border border-[#c9a56a]/40 bg-[#c9a56a]/5 px-5 py-2.5 text-xs font-medium text-[#c9a56a] transition hover:bg-[#c9a56a]/15"
            >
              User Management →
            </button>

            <span className="rounded-full border border-[#8b1234]/40 px-4 py-2 text-xs text-[#c98296]">
              Administrator
            </span>

          </div>

        </div>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="mx-auto max-w-7xl px-8 py-10">

        <p className="text-xs uppercase tracking-[0.3em] text-[#c9a56a]">
          Administration
        </p>

        <h2 className="mt-2 font-[var(--font-cormorant)] text-6xl">
          Course Dashboard
        </h2>

        <p className="mt-3 text-sm text-white/35">
          Create courses, organise chapters,
          add notes and manage study materials.
        </p>


        {/* =================================================
            STATS
        ================================================= */}

        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <Stat
            label="Total Courses"
            value={courses.length.toString()}
          />

          <Stat
            label="Selected Course"
            value={
              selectedCourse?.title ||
              "None"
            }
          />

          <Stat
            label="Chapters"
            value={chapters.length.toString()}
          />

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div className="mt-6 rounded-xl border border-[#8b1234]/30 bg-[#8b1234]/10 px-5 py-3 text-sm text-[#c98296]">
            {message}
          </div>
        )}


        {/* =================================================
            ADD COURSE + ADD CHAPTER
        ================================================= */}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">

          {/* ADD COURSE */}

          <section className="rounded-3xl border border-[#8b1234]/25 bg-[#100b0e] p-8">

            <p className="text-xs uppercase tracking-[0.25em] text-[#c9a56a]">
              Course Management
            </p>

            <h3 className="mt-2 font-[var(--font-cormorant)] text-3xl">
              Add New Course
            </h3>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Course title"
              className="mt-6 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]"
            />

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Course description"
              rows={4}
              className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]"
            />

            <button
              type="button"
              onClick={addCourse}
              className="mt-5 rounded-xl bg-[#8b1234] px-7 py-3 text-sm transition hover:bg-[#b21e45]"
            >
              + Add Course
            </button>

          </section>


          {/* ADD CHAPTER */}

          <section className="rounded-3xl border border-[#c9a56a]/10 bg-[#100b0e] p-8">

            <p className="text-xs uppercase tracking-[0.25em] text-[#c9a56a]">
              Chapter Management
            </p>

            <h3 className="mt-2 font-[var(--font-cormorant)] text-3xl">
              Add Chapter
            </h3>

            {!selectedCourse ? (

              <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">

                <p className="font-[var(--font-cormorant)] text-xl text-white/40">
                  Select a course first
                </p>

              </div>

            ) : (

              <>

                <div className="mt-5 rounded-xl bg-[#8b1234]/10 px-4 py-3 text-sm text-[#c98296]">
                  Adding to:{" "}
                  {selectedCourse.title}
                </div>

                <input
                  value={chapterTitle}
                  onChange={(e) =>
                    setChapterTitle(
                      e.target.value
                    )
                  }
                  placeholder="Chapter title"
                  className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]"
                />

                <textarea
                  value={chapterContent}
                  onChange={(e) =>
                    setChapterContent(
                      e.target.value
                    )
                  }
                  placeholder="Chapter summary / content"
                  rows={4}
                  className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#8b1234]"
                />

                <textarea
                  value={chapterNotes}
                  onChange={(e) =>
                    setChapterNotes(
                      e.target.value
                    )
                  }
                  placeholder="Chapter notes"
                  rows={5}
                  className="mt-3 w-full resize-none rounded-xl border border-[#c9a56a]/20 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#c9a56a]"
                />

                <button
                  type="button"
                  onClick={addChapter}
                  className="mt-5 rounded-xl bg-[#8b1234] px-7 py-3 text-sm transition hover:bg-[#b21e45]"
                >
                  + Add Chapter
                </button>

              </>

            )}

          </section>

        </div>


        {/* =================================================
            COURSES
        ================================================= */}

        <section className="mt-10">

          <p className="text-xs uppercase tracking-[0.25em] text-[#c9a56a]">
            Library
          </p>

          <h3 className="mt-1 font-[var(--font-cormorant)] text-4xl">
            Courses
          </h3>


          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {courses.map(
              (course) => (

                <div
                  key={course.id}
                  className={`rounded-2xl border p-6 transition ${
                    selectedCourse?.id ===
                    course.id
                      ? "border-[#8b1234]/60 bg-[#8b1234]/10"
                      : "border-white/10 bg-[#100b0e]"
                  }`}
                >

                  <div className="flex items-start justify-between gap-5">

                    <button
                      type="button"
                      onClick={() =>
                        selectCourse(
                          course
                        )
                      }
                      className="flex-1 text-left"
                    >

                      <p className="text-[9px] uppercase tracking-[0.25em] text-[#c9a56a]">
                        Course {course.id}
                      </p>

                      <h4 className="mt-2 font-[var(--font-cormorant)] text-2xl">
                        {course.title}
                      </h4>

                      <p className="mt-2 text-sm text-white/30">
                        {course.description ||
                          "No description"}
                      </p>

                      <p className="mt-4 text-xs text-[#c98296]">
                        Manage course →
                      </p>

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCourse(
                          course.id
                        )
                      }
                      className="text-xs text-white/25 transition hover:text-[#b21e45]"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        </section>


        {/* =================================================
            CHAPTER WORKSPACE
        ================================================= */}

        {selectedCourse && (

          <section className="mt-10 rounded-3xl border border-white/10 bg-[#100b0e] p-8">

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-[#c9a56a]">
                Curriculum
              </p>

              <h3 className="mt-1 font-[var(--font-cormorant)] text-4xl">
                {selectedCourse.title}
              </h3>

              <p className="mt-2 text-sm text-white/30">
                Select a chapter to manage its
                notes and study materials.
              </p>

            </div>


            <div className="mt-7 space-y-5">

              {chapters.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">

                  <p className="font-[var(--font-cormorant)] text-2xl text-white/30">
                    No chapters yet.
                  </p>

                  <p className="mt-2 text-sm text-white/20">
                    Add a chapter above.
                  </p>

                </div>

              ) : (

                chapters.map(
                  (
                    chapter,
                    index
                  ) => {

                    const isSelected =
                      selectedChapter?.id ===
                      chapter.id;

                    return (

                      <div
                        key={chapter.id}
                        className={`rounded-3xl border transition ${
                          isSelected
                            ? "border-[#8b1234]/60 bg-[#8b1234]/5"
                            : "border-white/[0.08] bg-black/10"
                        }`}
                      >

                        {/* CHAPTER HEADER */}

                        <button
                          type="button"
                          onClick={() =>
                            selectChapter(
                              chapter
                            )
                          }
                          className="w-full p-6 text-left"
                        >

                          <div className="flex items-center gap-5">

                            <span className="font-[var(--font-cormorant)] text-2xl text-[#b21e45]">
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <div className="flex-1">

                              <h4 className="font-[var(--font-cormorant)] text-2xl">
                                {chapter.title}
                              </h4>

                              <p className="mt-1 text-xs text-white/25">
                                Click to manage
                                chapter
                              </p>

                            </div>

                            <span className="text-[#c98296]">
                              {isSelected
                                ? "−"
                                : "+"}
                            </span>

                          </div>

                        </button>


                        {/* CHAPTER DETAILS */}

                        {isSelected && (

                          <div className="border-t border-white/[0.08] p-6">

                            <div className="grid gap-6 lg:grid-cols-2">

                              {/* NOTES */}

                              <div className="rounded-2xl border border-[#c9a56a]/15 bg-[#c9a56a]/5 p-6">

                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a56a]">
                                  Chapter Notes
                                </p>

                                <h5 className="mt-2 font-[var(--font-cormorant)] text-2xl">
                                  Notes & Summary
                                </h5>

                                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/40">
                                  {chapter.notes ||
                                    "No notes have been added for this chapter."}
                                </p>

                                {chapter.content && (
                                  <div className="mt-5 border-t border-white/10 pt-5">

                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                                      Chapter Content
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/35">
                                      {chapter.content}
                                    </p>

                                  </div>
                                )}

                              </div>


                              {/* MATERIALS */}

                              <div className="rounded-2xl border border-[#8b1234]/20 bg-[#8b1234]/5 p-6">

                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#c98296]">
                                  Chapter Materials
                                </p>

                                <h5 className="mt-2 font-[var(--font-cormorant)] text-2xl">
                                  PDFs & Documents
                                </h5>

                                <p className="mt-2 text-xs leading-5 text-white/30">
                                  Upload files specifically
                                  for this chapter.
                                </p>


                                {/* FILE PICKER */}

                                <label
                                  htmlFor={`chapter-material-upload-${chapter.id}`}
                                  className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 px-5 py-7 text-center transition hover:border-[#8b1234]/60 hover:bg-[#8b1234]/10"
                                >

                                  <span className="text-3xl">
                                    📎
                                  </span>

                                  <span className="mt-2 text-sm text-white/60">
                                    Choose PDF / DOC
                                    / PPT
                                  </span>

                                  <span className="mt-1 text-[10px] text-white/25">
                                    PDF · DOC · DOCX ·
                                    PPT · PPTX · XLS ·
                                    XLSX · TXT · CSV · ZIP
                                  </span>

                                  <input
                                    id={`chapter-material-upload-${chapter.id}`}
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.zip"
                                    onChange={
                                      handleFileSelection
                                    }
                                    className="hidden"
                                  />

                                </label>


                                {/* SELECTED FILES */}

                                {selectedFiles.length >
                                  0 && (

                                  <div className="mt-4 space-y-2">

                                    {selectedFiles.map(
                                      (
                                        file,
                                        fileIndex
                                      ) => (

                                        <div
                                          key={`${file.name}-${fileIndex}`}
                                          className="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3"
                                        >

                                          <div className="flex items-center justify-between gap-3">

                                            <span className="truncate text-xs text-white/60">
                                              📄{" "}
                                              {file.name}
                                            </span>

                                            <span className="shrink-0 text-[10px] text-white/20">
                                              {(
                                                file.size /
                                                1024 /
                                                1024
                                              ).toFixed(
                                                2
                                              )}{" "}
                                              MB
                                            </span>

                                          </div>

                                        </div>

                                      )
                                    )}

                                    <button
                                      type="button"
                                      onClick={
                                        uploadMaterials
                                      }
                                      disabled={
                                        uploading
                                      }
                                      className="mt-3 w-full rounded-xl bg-[#8b1234] px-5 py-3 text-xs transition hover:bg-[#b21e45] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {uploading
                                        ? "Uploading..."
                                        : `Upload ${selectedFiles.length} File${
                                            selectedFiles.length ===
                                            1
                                              ? ""
                                              : "s"
                                          }`}
                                    </button>

                                  </div>

                                )}


                                {/* EXISTING MATERIALS */}

                                <div className="mt-6">

                                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                                    Uploaded for this
                                    chapter
                                  </p>

                                  <div className="mt-3 space-y-2">

                                    {(
                                      selectedChapter?.id ===
                                      chapter.id
                                        ? selectedChapter.materials ||
                                          []
                                        : []
                                    ).length ===
                                    0 ? (

                                      <p className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-white/20">
                                        No files uploaded
                                        yet.
                                      </p>

                                    ) : (

                                      (
                                        selectedChapter
                                          ?.materials ||
                                        []
                                      ).map(
                                        (
                                          material
                                        ) => (

                                          <div
                                            key={
                                              material.id
                                            }
                                            className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3"
                                          >

                                            <div className="flex min-w-0 items-center gap-3">

                                              <span>
                                                {getFileIcon(
                                                  material.file_type
                                                )}
                                              </span>

                                              <span className="truncate text-xs text-white/50">
                                                {
                                                  material.filename
                                                }
                                              </span>

                                            </div>

                                            <div className="flex shrink-0 gap-3">

                                              <a
                                                href={`${API}/materials/${material.id}/download`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-[#c98296] hover:text-[#b21e45]"
                                              >
                                                Download
                                              </a>

                                              <button
                                                type="button"
                                                onClick={() =>
                                                  deleteMaterial(
                                                    material.id
                                                  )
                                                }
                                                className="text-[10px] text-white/20 hover:text-[#b21e45]"
                                              >
                                                Delete
                                              </button>

                                            </div>

                                          </div>

                                        )
                                      )

                                    )}

                                  </div>

                                </div>

                              </div>

                            </div>

                          </div>

                        )}

                      </div>

                    );
                  }
                )

              )}

            </div>

          </section>

        )}

      </div>

    </main>
  );
}


/* =========================================================
   STAT
========================================================= */

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#100b0e] p-6">

      <p className="text-xs uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p className="mt-3 truncate font-[var(--font-cormorant)] text-3xl">
        {value}
      </p>

    </div>
  );
}